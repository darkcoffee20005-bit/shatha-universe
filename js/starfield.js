/**
 * Layered, twinkling star background on a single <canvas>.
 * Canvas is used here because a few hundred independently twinkling stars
 * would be far heavier as DOM nodes. The loop pauses when the tab is hidden
 * and renders a single static frame under prefers-reduced-motion.
 */
import { clamp, prefersReducedMotion } from './utils.js';

const COLORS = ['#FFF3C4', '#FFFFFF', '#FFFFFF', '#CDB3FF', '#FFC6E1'];
const LAYERS = [
  { size: [0.4, 0.9], alpha: 0.55, drift: 0.0035 },
  { size: [0.7, 1.3], alpha: 0.75, drift: 0.007 },
  { size: [1.1, 1.9], alpha: 0.95, drift: 0.012 },
];

export function createStarfield(canvas) {
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return { start() {}, warp: () => Promise.resolve(), cancelWarp() {} };

  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;
  let running = false;
  let warpState = null; // { start, duration, resolve }

  function seed() {
    const count = Math.round(clamp((width * height) / 5200, 90, 260));
    stars = Array.from({ length: count }, () => {
      const layerIndex = Math.random() < 0.55 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const layer = LAYERS[layerIndex];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
        alpha: layer.alpha,
        drift: layer.drift,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        phase: Math.random() * Math.PI * 2,
        speed: 0.0006 + Math.random() * 0.0018, // varied twinkle timing
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (!running) draw(performance.now());
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;

    // Warp progress 0→1→0 gives a "camera flying in" streak effect.
    let warp = 0;
    if (warpState) {
      const p = clamp((time - warpState.start) / warpState.duration, 0, 1);
      warp = Math.sin(p * Math.PI) ** 2;
      if (p >= 1) finishWarp();
    }

    for (const s of stars) {
      // Positions are derived from time (not accumulated) so they never drift out of sync.
      const x = (((s.x - time * s.drift) % width) + width) % width;
      const y = s.y;
      const twinkle = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.color;

      if (warp > 0.01) {
        const k = warp * 2.4;
        const x2 = cx + (x - cx) * (1 + k);
        const y2 = cy + (y - cy) * (1 + k);
        const x1 = cx + (x - cx) * (1 + k * 0.6);
        const y1 = cy + (y - cy) * (1 + k * 0.6);
        ctx.lineWidth = s.r;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        continue;
      }

      if (s.r > 1.2) {
        ctx.globalAlpha = s.alpha * twinkle * 0.18;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - s.r / 2, y - s.r / 2, s.r, s.r);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(time) {
    draw(time);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || prefersReducedMotion() || document.hidden) {
      draw(performance.now());
      return;
    }
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  function finishWarp() {
    const resolve = warpState?.resolve;
    warpState = null;
    resolve?.();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
    stop();
    start();
  });

  resize();

  return {
    start,
    /** Streak the stars outward for `duration` ms. Resolves when done. */
    warp(duration = 1800) {
      if (!running) return Promise.resolve();
      finishWarp();
      return new Promise((resolve) => {
        warpState = { start: performance.now(), duration, resolve };
      });
    },
    cancelWarp: finishWarp,
  };
}
