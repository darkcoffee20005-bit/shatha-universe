/**
 * Tiny particle bursts (DOM + CSS transforms). The number of live
 * particles is capped so low-powered phones never get overwhelmed.
 */
import { prefersReducedMotion, rand } from './utils.js';

const MAX_LIVE = 70;
const PALETTE = ['#FFF3C4', '#FFC6E1', '#CDB3FF', '#FFFFFF'];
let live = 0;

/**
 * Burst particles from a viewport point.
 * @param {number} x  clientX
 * @param {number} y  clientY
 */
export function burst(x, y, { count = 12, spread = 70, colors = PALETTE } = {}) {
  const layer = document.getElementById('fx-layer');
  if (!layer) return;
  const reduced = prefersReducedMotion();
  const total = Math.min(reduced ? Math.min(count, 4) : count, MAX_LIVE - live);

  for (let i = 0; i < total; i += 1) {
    const angle = (Math.PI * 2 * i) / total + rand(-0.3, 0.3);
    const distance = (reduced ? 0.3 : 1) * spread * rand(0.45, 1);
    const particle = document.createElement('span');
    particle.className = 'fx-particle';
    particle.style.cssText =
      `left:${x}px;top:${y}px;` +
      `--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance}px;` +
      `--size:${rand(3, 6.5).toFixed(1)}px;--c:${colors[i % colors.length]};` +
      `--dur:${rand(600, 1000) | 0}ms`;

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      live -= 1;
      particle.remove();
    };
    particle.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 1400); // safety net if animations are disabled
    live += 1;
    layer.append(particle);
  }
}

/** Burst from the visual centre of an element. */
export function burstFrom(element, options) {
  const rect = element.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, options);
}
