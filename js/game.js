/**
 * Section 3 — Catch-a-Star mini-game.
 *
 * Rules: catch TARGET stars within DURATION ms. Up to MAX_VISIBLE stars are
 * on screen; uncaught stars drift away after a while and are replaced.
 * Every timer and listener belongs to a "session" that is torn down when the
 * game ends or the visitor leaves, so nothing keeps running in the background.
 */
import { $, clamp, fill, h, isAbortError, nextFrame, prefersReducedMotion, rand, svgEl, wait } from './utils.js';
import { burstFrom } from './fx.js';
import { showCompletion } from './ui.js';

const TARGET = 5;
const DURATION = 15000;
const MAX_VISIBLE = 3;
const STAR_LIFETIME = 2900;
const EDGE_PADDING_PX = 34; // keeps stars fully inside the arena

/* Where the caught stars travel to form a little constellation (x, y in %). */
const CONSTELLATION = [
  [16, 58], [32, 34], [50, 52], [68, 28], [84, 50],
];

const STAR_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.3 7.4.2-5.9 4.6 2.1 7.4L12 16.6 5.8 21l2.1-7.4L2 9l7.4-.2z"/></svg>';

export function createGame(ctx) {
  const { store, t, num, config } = ctx;
  const arena = $('#game-arena');
  const lines = $('.game__lines', arena);
  const introPanel = $('#game-intro');
  const losePanel = $('#game-lose');
  const timeEl = $('#game-time');
  const timeBar = $('#game-timebar');
  const scoreEl = $('#game-score');
  const messageBox = $('#game-message');
  const linesList = $('#game-lines');
  const completeBox = $('#game-complete');
  const seconds = Math.round(DURATION / 1000);

  $('#game-rules').textContent = fill(t('gameRules'), { seconds: num(seconds), total: num(TARGET) });
  arena.setAttribute('aria-label', t('gameArenaLabel'));

  let session = null;

  /* ── HUD ──────────────────────────────────────────────── */
  function setHud(score, msLeft) {
    timeEl.textContent = num(Math.ceil(msLeft / 1000));
    timeBar.style.transform = `scaleX(${clamp(msLeft / DURATION, 0, 1)})`;
    scoreEl.textContent = fill(t('gameScore'), { n: num(score), total: num(TARGET) });
    store.runtime.game = { score, timeLeftMs: msLeft, running: session?.phase === 'playing' };
  }

  function clearArena() {
    arena.querySelectorAll('.catch-star, .const-star').forEach((el) => el.remove());
    lines.replaceChildren();
    arena.classList.remove('is-playing', 'is-won', 'is-paused');
  }

  /* ── Session lifecycle ────────────────────────────────── */
  function endSession() {
    if (!session) return;
    session.controller.abort();
    clearInterval(session.interval);
    session.timeouts.forEach(clearTimeout);
    session = null;
  }

  /** setTimeout tracked by the current session (auto-cleared on end). */
  function later(fn, ms) {
    const s = session;
    if (!s) return;
    const id = setTimeout(() => {
      s.timeouts.delete(id);
      if (session === s) fn();
    }, ms);
    s.timeouts.add(id);
  }

  const elapsed = (s) => s.elapsedBefore + (s.paused ? 0 : performance.now() - s.resumedAt);

  function start(event) {
    endSession();
    clearArena();
    introPanel.hidden = true;
    losePanel.hidden = true;
    messageBox.hidden = true;
    completeBox.hidden = true;

    session = {
      phase: 'playing',
      controller: new AbortController(),
      score: 0,
      elapsedBefore: 0,
      resumedAt: performance.now(),
      paused: false,
      stars: [],
      caughtAt: [],
      timeouts: new Set(),
      interval: 0,
    };
    arena.classList.add('is-playing');
    setHud(0, DURATION);
    ctx.announce(fill(t('gameStarted'), { seconds: num(seconds) }));

    for (let i = 0; i < MAX_VISIBLE; i += 1) later(spawn, 250 + i * 420);
    session.interval = setInterval(tick, 100);
    document.addEventListener('visibilitychange', onVisibility, { signal: session.controller.signal });
    // Keyboard starts keep focus in the arena so Enter can catch stars.
    if (event?.detail === 0) arena.focus({ preventScroll: true });
  }

  function tick() {
    if (!session || session.phase !== 'playing') return;
    const left = Math.max(0, DURATION - elapsed(session));
    setHud(session.score, left);
    if (left <= 0) lose();
  }

  /** Pause the clock while the tab is hidden — leaving shouldn't cost time. */
  function onVisibility() {
    if (!session || session.phase !== 'playing') return;
    if (document.hidden) {
      session.elapsedBefore = elapsed(session);
      session.paused = true;
      arena.classList.add('is-paused');
    } else {
      session.paused = false;
      session.resumedAt = performance.now();
      arena.classList.remove('is-paused');
    }
  }

  /* ── Stars ────────────────────────────────────────────── */
  /** Pick a spot inside the padded arena, as far as possible from other stars. */
  function pickPosition() {
    const rect = arena.getBoundingClientRect();
    const padX = (EDGE_PADDING_PX / Math.max(rect.width, 1)) * 100;
    const padY = (EDGE_PADDING_PX / Math.max(rect.height, 1)) * 100;
    let best = null;
    let bestDistance = -1;
    for (let i = 0; i < 14; i += 1) {
      const candidate = { x: rand(padX, 100 - padX), y: rand(padY, 100 - padY) };
      const nearest = Math.min(
        ...session.stars.map((s) => Math.hypot((s.x - candidate.x) * rect.width, (s.y - candidate.y) * rect.height) / 100),
        Infinity,
      );
      if (nearest > bestDistance) {
        best = candidate;
        bestDistance = nearest;
      }
      if (nearest > 110) break;
    }
    return best;
  }

  function spawn() {
    if (!session || session.phase !== 'playing' || session.stars.length >= MAX_VISIBLE) return;
    const { x, y } = pickPosition();
    const el = h('button', {
      class: 'catch-star',
      type: 'button',
      'aria-label': t('gameStarLabel'),
      style: { left: `${x}%`, top: `${y}%`, '--spin': `${rand(-25, 25).toFixed(0)}deg`, '--hue': `${rand(-12, 12).toFixed(0)}deg` },
    });
    el.innerHTML = STAR_SVG;
    const star = { el, x, y, caught: false };
    const { signal } = session.controller;
    // pointerdown feels instant on touch; keydown covers Enter/Space.
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      catchStar(star);
    }, { signal });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        catchStar(star);
      }
    }, { signal });
    session.stars.push(star);
    arena.append(el);
    later(() => expire(star), STAR_LIFETIME + rand(-300, 500));
  }

  function removeStar(star, className, delay) {
    session.stars = session.stars.filter((s) => s !== star);
    star.el.classList.add(className);
    star.el.disabled = true;
    setTimeout(() => star.el.remove(), delay);
  }

  function expire(star) {
    if (star.caught || !session?.stars.includes(star)) return;
    const hadFocus = document.activeElement === star.el;
    removeStar(star, 'is-leaving', 350);
    if (hadFocus) arena.focus({ preventScroll: true });
    later(spawn, 200);
  }

  function catchStar(star) {
    if (!session || session.phase !== 'playing' || star.caught) return; // each star counts once
    star.caught = true;
    const hadFocus = document.activeElement === star.el;
    session.score += 1;
    session.caughtAt.push([star.x, star.y]);
    burstFrom(star.el, { count: 12, spread: 64 });
    ctx.sound.chime(session.score);
    removeStar(star, 'is-caught', 420);
    scoreEl.classList.remove('is-bump');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('is-bump');
    setHud(session.score, Math.max(0, DURATION - elapsed(session)));
    if (hadFocus) arena.focus({ preventScroll: true });

    if (session.score >= TARGET) win();
    else later(spawn, 260);
  }

  /** Keyboard players can press Enter on the arena to catch the oldest star. */
  arena.addEventListener('keydown', (e) => {
    if (e.target !== arena || !session || session.phase !== 'playing') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const oldest = session.stars.find((s) => !s.caught);
      if (oldest) catchStar(oldest);
    }
  });

  /* ── Endings ──────────────────────────────────────────── */
  function stopPlay(phase) {
    session.phase = phase;
    clearInterval(session.interval);
    session.timeouts.forEach(clearTimeout);
    session.timeouts.clear();
    session.stars.forEach((s) => removeStar(s, 'is-leaving', 300));
    arena.classList.remove('is-playing');
    store.runtime.game.running = false;
  }

  function lose() {
    stopPlay('lost');
    const score = session.score;
    $('#game-lose-text').textContent = fill(t('gameLose'), { n: num(score), total: num(TARGET) });
    losePanel.hidden = false;
    ctx.announce(`${t('gameLoseTitle')} ${$('#game-lose-text').textContent}`);
    $('#game-retry').focus({ preventScroll: true });
  }

  async function win() {
    const s = session;
    const timeMs = elapsed(s);
    stopPlay('won');
    arena.classList.add('is-won');
    ctx.announce(t('gameWin'));
    const firstWin = store.complete('game');
    store.update((d) => {
      d.gameWins += 1;
      d.bestGameMs = d.bestGameMs ? Math.min(d.bestGameMs, timeMs) : timeMs;
    });

    try {
      await playConstellation(s);
      await revealMessage(s);
    } catch (error) {
      if (!isAbortError(error)) throw error;
      return; // visitor left mid-animation
    }
    showCompletion(completeBox, t('gameUnlocked'), t('backToGalaxy'));
    if (firstWin) ctx.celebrate('game');
  }

  /** Fly each caught star to its place in the constellation, then draw the lines. */
  async function playConstellation(s) {
    const { signal } = s.controller;
    const reduced = prefersReducedMotion();
    const targets = CONSTELLATION.map(([x, y]) => [ctx.dir === 'rtl' ? 100 - x : x, y]);
    const dots = s.caughtAt.slice(0, TARGET).map(([x, y]) => {
      const dot = h('span', { class: 'const-star', 'aria-hidden': 'true', style: { left: `${x}%`, top: `${y}%` } });
      arena.append(dot);
      return dot;
    });
    await nextFrame();
    dots.forEach((dot, i) => {
      dot.style.left = `${targets[i][0]}%`;
      dot.style.top = `${targets[i][1]}%`;
      dot.classList.add('is-placed');
    });
    if (!reduced) await wait(1300, signal);

    // One segment per pair, faded in one after another.
    targets.slice(1).forEach(([x2, y2], i) => {
      const [x1, y1] = targets[i];
      lines.append(svgEl('line', {
        x1, y1, x2, y2,
        class: 'game__constellation-line',
        'vector-effect': 'non-scaling-stroke',
        style: `--i:${i}`,
      }));
    });
    if (!reduced) await wait(1200, signal);
  }

  async function revealMessage(s) {
    const { signal } = s.controller;
    const reduced = prefersReducedMotion();
    linesList.replaceChildren();
    messageBox.hidden = false;
    messageBox.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    for (const line of config.loveMessage) {
      linesList.append(h('li', { class: 'reveal-line', text: line }));
      if (!reduced) await wait(950, signal);
    }
  }

  /* ── Intro (also the "play again" screen) ─────────────── */
  function showIntro() {
    endSession();
    clearArena();
    introPanel.hidden = false;
    losePanel.hidden = true;
    messageBox.hidden = true;
    $('#game-note').hidden = !store.isCompleted('game');
    setHud(0, DURATION);
  }

  $('#game-start').addEventListener('click', start);
  $('#game-retry').addEventListener('click', start);

  return {
    mount: showIntro,
    unmount() {
      endSession();
      clearArena();
    },
  };
}
