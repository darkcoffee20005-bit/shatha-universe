/**
 * Section 4 — Planet of Memories.
 * Each memory is a star in a small constellation. Opening one shows a card
 * (native <dialog>) with prev/next navigation. Viewing them all completes
 * the planet.
 */
import { $, fill, h, svgEl } from './utils.js';
import { closeDialog, openDialog, setupDialog } from './dialogs.js';
import { burstFrom } from './fx.js';
import { showCompletion } from './ui.js';

/* A gentle default constellation (x, y in %) used when a memory has no position. */
const DEFAULT_POSITIONS = [
  [18, 70], [34, 40], [52, 58], [68, 26], [84, 46],
  [74, 78], [44, 84], [24, 22], [56, 12],
];

/** Decorative SVG used instead of a photo (or when a photo fails to load). */
function placeholderArt(index, caption) {
  const hue = [330, 270, 45, 250, 300][index % 5];
  const id = `mem-grad-${index}`;
  const svg = svgEl('svg', { viewBox: '0 0 320 180', role: 'img', 'aria-label': caption, class: 'memory-card__art' });
  svg.innerHTML = `
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue} 55% 22%)"/>
        <stop offset="1" stop-color="#080B1D"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#${id})"/>
    <circle cx="232" cy="64" r="26" fill="#FFF3C4" opacity=".9"/>
    <circle cx="244" cy="56" r="24" fill="hsl(${hue} 55% 20%)"/>
    <g fill="#FFF3C4">
      <circle cx="60" cy="40" r="1.6"/><circle cx="110" cy="70" r="1.1"/><circle cx="150" cy="30" r="1.4"/>
      <circle cx="80" cy="120" r="1"/><circle cx="190" cy="110" r="1.3"/><circle cx="290" cy="130" r="1.1"/>
    </g>
    <path d="M60 40 L110 70 L150 30" stroke="#CDB3FF" stroke-width=".8" fill="none" opacity=".6"/>
    <path d="M0 160 Q80 130 160 150 T320 140 V180 H0Z" fill="#211548" opacity=".9"/>`;
  return h('div', { class: 'memory-card__placeholder' }, svg, h('span', { text: caption }));
}

export function createMemories(ctx) {
  const { store, t, num, config } = ctx;
  const memories = config.memories;
  const sky = $('#memory-sky');
  const lines = $('.sky__lines', sky);
  const starList = $('.sky__stars', sky);
  const progress = $('#memories-progress');
  const completion = $('#memories-complete');
  const dialog = $('#memory-dialog');
  const media = $('#memory-media');
  const prevBtn = $('#memory-prev');
  const nextBtn = $('#memory-next');
  let current = 0;

  setupDialog(dialog);

  const positions = memories.map((m, i) => {
    if (m.position) return [m.position.x, m.position.y];
    const [x, y] = DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length];
    return [ctx.dir === 'rtl' ? 100 - x : x, y];
  });

  /* ── Build stars & lines once ─────────────────────────── */
  const stars = memories.map((memory, i) => {
    const [x, y] = positions[i];
    const button = h(
      'button',
      {
        class: 'mem-star',
        type: 'button',
        'aria-label': `${fill(t('memoryLabel'), { n: num(i + 1) })}: ${memory.title}`,
        style: { '--twinkle-delay': `${(i * 0.7) % 3}s` },
      },
      h('span', { class: 'mem-star__core', 'aria-hidden': 'true' }),
      h('span', { class: 'mem-star__num', 'aria-hidden': 'true', text: num(i + 1) }),
    );
    button.addEventListener('click', () => open(i, button));
    starList.append(h('li', { class: 'sky__item', style: { '--x': `${x}%`, '--y': `${y}%` } }, button));
    return button;
  });

  const segments = memories.slice(1).map((_, i) => {
    const [x1, y1] = positions[i];
    const [x2, y2] = positions[i + 1];
    const line = svgEl('line', { x1, y1, x2, y2, 'vector-effect': 'non-scaling-stroke', class: 'sky__segment' });
    lines.append(line);
    return line;
  });

  prevBtn.addEventListener('click', () => open((current - 1 + memories.length) % memories.length));
  nextBtn.addEventListener('click', () => open((current + 1) % memories.length));
  const navVisible = memories.length > 1;
  prevBtn.hidden = !navVisible;
  nextBtn.hidden = !navVisible;

  /* ── Card ─────────────────────────────────────────────── */
  function renderMedia(memory, index) {
    if (!memory.image) {
      media.replaceChildren(placeholderArt(index, t('photoPlaceholder')));
      return;
    }
    const img = h('img', { src: memory.image, alt: memory.imageAlt, loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', () => media.replaceChildren(placeholderArt(index, t('photoPlaceholder'))), { once: true });
    media.replaceChildren(img);
  }

  function open(index, origin) {
    current = index;
    const memory = memories[index];
    renderMedia(memory, index);
    $('#memory-index').textContent = fill(t('memoryLabel'), { n: num(index + 1) });
    $('#memory-date').textContent = memory.date;
    $('#memory-title').textContent = memory.title;
    $('#memory-text').textContent = memory.text;

    stars.forEach((s, i) => s.classList.toggle('is-active', i === index));
    if (!dialog.open) openDialog(dialog, origin ?? stars[index]);
    dialog.querySelector('.dialog__inner').scrollTop = 0;

    if (store.addToList('viewedMemories', memory.id)) burstFrom(stars[index], { count: 8, spread: 40 });
    render();
  }

  dialog.addEventListener('close', () => stars.forEach((s) => s.classList.remove('is-active')));

  function render() {
    const viewed = new Set(store.get().viewedMemories);
    const seen = memories.map((m) => viewed.has(m.id));
    stars.forEach((star, i) => {
      star.classList.toggle('is-viewed', seen[i]);
      star.setAttribute('aria-pressed', String(seen[i]));
    });
    segments.forEach((line, i) => line.classList.toggle('is-lit', seen[i] && seen[i + 1]));
    const count = seen.filter(Boolean).length;
    progress.textContent = fill(t('memoriesProgress'), { n: num(count), total: num(memories.length) });

    if (count === memories.length) {
      if (store.complete('memories')) ctx.celebrate('memories');
      showCompletion(completion, t('memoriesComplete'), t('backToGalaxy'));
    } else {
      completion.hidden = true;
    }
  }

  return {
    mount: render,
    unmount: () => closeDialog(dialog),
  };
}
