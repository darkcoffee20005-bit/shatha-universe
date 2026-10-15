/**
 * Section 2 — Her Galaxy: the navigation hub.
 * Planets are real <button>s positioned in % over an SVG line layer, so the
 * constellation lines and the touch targets always share coordinates.
 */
import { PLANET_IDS } from './state.js';
import { $, fill, h, svgEl } from './utils.js';
import { burstFrom } from './fx.js';

/* Planet positions (in % of the map). Mirrored automatically for RTL. */
const LAYOUTS = {
  portrait: {
    memories: [27, 9],
    littleThings: [73, 28],
    letters: [27, 47],
    game: [73, 66],
    final: [36, 85],
  },
  landscape: {
    memories: [11, 30],
    littleThings: [30, 62],
    letters: [50, 24],
    game: [70, 62],
    final: [89, 32],
  },
};

const PLANET_COLORS = {
  memories: ['#FFC6E1', '#FFF3C4'],
  littleThings: ['#FFF3C4', '#FFFFFF'],
  letters: ['#CDB3FF', '#8759DB'],
  game: ['#A9C8FF', '#FFF3C4'],
  final: ['#FFFFFF', '#FFF3C4', '#FFC6E1'],
};

export function createGalaxy(ctx) {
  const { store, t, num, config } = ctx;
  const map = $('#galaxy-map');
  const linesSvg = $('.galaxy__lines', map);
  const list = $('.galaxy__planets', map);
  const dots = $('#view-galaxy .progress__dots');
  const progressLabel = $('#galaxy-progress');
  const hint = $('#galaxy-hint');
  const landscapeQuery = window.matchMedia('(min-width: 700px) and (min-aspect-ratio: 1/1)');

  const buttons = new Map();
  const segments = [];
  const litSegments = new Set();
  let unsubscribe = null;

  /* ── Build once ─────────────────────────────────────────── */
  PLANET_IDS.forEach((id, index) => {
    const status = h('span', { class: 'planet__status' });
    const button = h(
      'button',
      { class: `planet planet--${id}`, type: 'button', 'data-planet': id },
      h(
        'span',
        { class: 'planet__orb', 'aria-hidden': 'true' },
        h('span', { class: 'planet__halo' }),
        h('span', { class: 'planet__body' }),
        h('span', { class: 'planet__ring' }),
        h('span', { class: 'planet__moon' }),
      ),
      h('span', { class: 'planet__label' }, h('span', { class: 'planet__title', text: config.planets[id].title }), status),
      h('span', { class: 'planet__badge', 'aria-hidden': 'true', text: '✓' }),
    );
    button.addEventListener('click', () => onPlanet(id, button));
    buttons.set(id, { button, status });
    list.append(h('li', { class: 'planet-item', style: { '--float-delay': `${-index * 1.3}s` } }, button));
    dots.append(h('li', { class: 'progress__dot' }));

    if (index > 0) {
      const line = svgEl('line', { class: 'galaxy__segment', 'vector-effect': 'non-scaling-stroke', pathLength: 1 });
      linesSvg.append(line);
      segments.push({ line, from: PLANET_IDS[index - 1], to: id });
    }
  });

  function onPlanet(id, button) {
    if (!store.isUnlocked(id)) {
      button.classList.remove('is-denied');
      void button.offsetWidth; // restart the shake animation
      button.classList.add('is-denied');
      const blocker = store.blockedBy(id);
      ctx.toast(fill(t('lockedToast'), { title: config.planets[blocker]?.title ?? '' }));
      return;
    }
    burstFrom(button.querySelector('.planet__orb'), { count: 10, spread: 60, colors: PLANET_COLORS[id] });
    ctx.navigate(id);
  }

  /* ── Layout ─────────────────────────────────────────────── */
  function layout() {
    const positions = LAYOUTS[landscapeQuery.matches ? 'landscape' : 'portrait'];
    const mirror = ctx.dir === 'rtl';
    const point = (id) => {
      const [x, y] = positions[id];
      return [mirror ? 100 - x : x, y];
    };
    for (const [id, { button }] of buttons) {
      const [x, y] = point(id);
      button.parentElement.style.setProperty('--x', `${x}%`);
      button.parentElement.style.setProperty('--y', `${y}%`);
    }
    for (const { line, from, to } of segments) {
      const [x1, y1] = point(from);
      const [x2, y2] = point(to);
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
    }
    map.classList.toggle('is-landscape', landscapeQuery.matches);
  }
  landscapeQuery.addEventListener('change', layout);
  layout();

  /* ── State → UI ─────────────────────────────────────────── */
  function render() {
    const total = PLANET_IDS.length;
    const done = store.completedCount();
    let nextId = null;

    PLANET_IDS.forEach((id, index) => {
      const { button, status } = buttons.get(id);
      const completed = store.isCompleted(id);
      const unlocked = store.isUnlocked(id);
      const state = completed ? 'done' : unlocked ? 'available' : 'locked';
      if (state === 'available' && !nextId) nextId = id;
      button.dataset.state = state;
      button.setAttribute('aria-disabled', String(state === 'locked'));
      status.textContent = t(state === 'done' ? 'statusDone' : state === 'available' ? 'statusAvailable' : 'statusLocked');
      dots.children[index].classList.toggle('is-done', completed);
    });

    progressLabel.textContent = fill(t('progress'), { n: num(done), total: num(total) });
    hint.textContent = nextId ? fill(t('hintNext'), { title: config.planets[nextId].title }) : t('hintDone');

    // Light the segment leaving each completed planet; animate only newly lit ones.
    for (const { line, from, to } of segments) {
      const lit = store.isCompleted(from) && store.isUnlocked(to);
      const key = `${from}>${to}`;
      line.classList.toggle('is-lit', lit);
      if (lit && !litSegments.has(key)) {
        litSegments.add(key);
        line.classList.add('is-drawing');
        line.addEventListener('animationend', () => line.classList.remove('is-drawing'), { once: true });
      }
      if (!lit) litSegments.delete(key);
    }
  }

  return {
    mount() {
      render();
      unsubscribe = store.subscribe(render);
    },
    unmount() {
      unsubscribe?.();
      unsubscribe = null;
    },
  };
}
