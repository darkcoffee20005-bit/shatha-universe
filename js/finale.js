/**
 * Section 7 — The Final Star.
 * A timed sequence: the galaxy dims → scattered stars gather → a heart
 * constellation draws itself → stardust → her name → the message → the
 * "read the last letter" button. Every step can be skipped, and the whole
 * sequence is aborted cleanly if she leaves.
 */
import { $, fill, h, isAbortError, nextFrame, prefersReducedMotion, rand, svgEl, wait } from './utils.js';
import { confirmDialog } from './dialogs.js';
import { burst } from './fx.js';

const POINTS = 18;
// The five discovered worlds become the brightest stars of the heart.
const WORLD_COLORS = ['#FFC6E1', '#FFF3C4', '#CDB3FF', '#A9C8FF', '#FFFFFF'];
// Evenly spread slots on the heart for the five world stars.
const WORLD_SLOTS = [0, 1, 2, 3, 4].map((k) => Math.round((k * POINTS) / 5));
const STAGES = ['is-gather', 'is-draw', 'is-burst', 'is-name', 'is-message', 'is-ready'];

/** Classic parametric heart, mapped into the 0–100 viewBox. */
function heartPoints(count) {
  // Sample the curve densely, then pick points evenly spaced along its length
  // (plain angle sampling bunches stars together at the dip and the tip).
  const dense = Array.from({ length: 400 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 400;
    const x = 16 * Math.sin(a) ** 3;
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return [50 + x * 2.55, 46 - y * 2.55];
  });
  const lengths = [0];
  for (let i = 1; i <= dense.length; i += 1) {
    const [x1, y1] = dense[i - 1];
    const [x2, y2] = dense[i % dense.length];
    lengths.push(lengths[i - 1] + Math.hypot(x2 - x1, y2 - y1));
  }
  const total = lengths[lengths.length - 1];
  let j = 0;
  return Array.from({ length: count }, (_, i) => {
    const target = (total * i) / count;
    while (lengths[j + 1] < target) j += 1;
    return dense[j];
  });
}

export function createFinale(ctx) {
  const { store, t, config } = ctx;
  const section = $('#view-final');
  const path = $('.finale__path', section);
  const starGroup = $('.finale__stars', section);
  const readBtn = $('#finale-read');
  const letter = $('#finale-letter');
  const actions = $('#finale-actions');
  const skipBtn = $('#finale-skip');
  const photo = $('#finale-photo');
  let controller = null;
  let actionsTimer = 0;

  /* ── Build the heart once ─────────────────────────────── */
  const points = heartPoints(POINTS);
  path.setAttribute('d', `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z`);
  const stars = points.map(([x, y], i) => {
    const worldIndex = WORLD_SLOTS.indexOf(i);
    const isWorld = worldIndex !== -1;
    const color = isWorld ? WORLD_COLORS[worldIndex] : '#FFF3C4';
    const g = svgEl('g', { class: `finale__star${isWorld ? ' is-world' : ''}` });
    g.append(
      svgEl('circle', { cx: x, cy: y, r: isWorld ? 3.2 : 2, class: 'finale__star-glow', fill: color }),
      svgEl('circle', { cx: x, cy: y, r: isWorld ? 1.15 : 0.7, fill: color }),
    );
    g.style.setProperty('--delay', `${(i * 60) % 700}ms`);
    starGroup.append(g);
    return g;
  });

  /* Optional final photo — shown only if configured AND it loads. */
  if (config.photos.final) {
    const img = h('img', { src: config.photos.final, alt: config.photos.finalAlt, loading: 'lazy', decoding: 'async' });
    img.addEventListener('load', () => (photo.hidden = false), { once: true });
    img.addEventListener('error', () => photo.remove(), { once: true });
    photo.append(img);
  }

  /* ── Letter text (word-by-word reveal) ─────────────────── */
  $('#finale-greeting').textContent = fill(t('finalGreeting'), { nickname: config.nickname });
  $('#finale-signature').textContent = config.signature ? `— ${config.signature}` : '';
  let wordIndex = 0;
  $('#finale-letter-body').replaceChildren(
    ...config.finalLetter.map((paragraph) =>
      h(
        'p',
        {},
        ...paragraph.split(/\s+/).map((word) => {
          // Cap the stagger so long letters never take forever.
          const delay = Math.min(wordIndex++ * 55, 6000);
          return [h('span', { class: 'word', style: { '--d': `${delay}ms` }, text: word }), ' '];
        }),
      ),
    ),
  );

  function scatter() {
    for (const star of stars) {
      star.style.transform = `translate(${rand(-70, 70).toFixed(1)}px, ${rand(-70, 70).toFixed(1)}px)`;
    }
  }

  function reset() {
    clearTimeout(actionsTimer);
    section.classList.remove(...STAGES, 'is-instant', 'is-letter-open');
    readBtn.hidden = false;
    letter.hidden = true;
    actions.hidden = true;
    skipBtn.hidden = true;
    scatter();
  }

  function complete() {
    controller?.abort();
    controller = null;
    skipBtn.hidden = true;
    section.classList.add(...STAGES);
    if (store.complete('final')) {
      store.update((d) => {
        d.finalRevealed = true;
      });
    }
    ctx.announce(`${config.herName}. ${config.finalMessage}`);
  }

  function skip() {
    section.classList.add('is-instant');
    stars.forEach((s) => (s.style.transform = 'none'));
    complete();
    readBtn.focus({ preventScroll: true });
  }

  async function play() {
    controller = new AbortController();
    const { signal } = controller;
    if (prefersReducedMotion()) {
      skip();
      return;
    }
    skipBtn.hidden = false;
    try {
      await nextFrame();
      await wait(700, signal);
      section.classList.add('is-gather');
      stars.forEach((s) => (s.style.transform = 'none'));
      await wait(2400, signal);
      section.classList.add('is-draw');
      await wait(2300, signal);
      section.classList.add('is-burst');
      const rect = $('.finale__heart', section).getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height * 0.46, { count: 36, spread: Math.min(rect.width, 320) * 0.6 });
      await wait(900, signal);
      section.classList.add('is-name');
      await wait(1300, signal);
      section.classList.add('is-message');
      await wait(1500, signal);
      complete();
    } catch (error) {
      if (!isAbortError(error)) throw error;
    }
  }

  readBtn.addEventListener('click', () => {
    readBtn.hidden = true;
    letter.hidden = false;
    section.classList.add('is-letter-open');
    letter.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    const words = letter.querySelectorAll('.word').length;
    const revealTime = prefersReducedMotion() ? 0 : Math.min(words * 55, 6000) + 600;
    actionsTimer = setTimeout(() => {
      actions.hidden = false;
    }, revealTime);
  });

  skipBtn.addEventListener('click', skip);

  $('#finale-replay').addEventListener('click', async () => {
    const confirmed = await confirmDialog($('#confirm-dialog'), {
      title: t('confirmTitle'),
      message: t('confirmText'),
      yes: t('confirmYes'),
      no: t('confirmNo'),
    });
    if (!confirmed) return;
    store.reset();
    ctx.navigate('entrance');
  });

  return {
    mount() {
      reset();
      document.body.classList.add('is-finale');
      play();
    },
    unmount() {
      controller?.abort();
      controller = null;
      document.body.classList.remove('is-finale');
      reset();
    },
  };
}
