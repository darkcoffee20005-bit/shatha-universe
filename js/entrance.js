/**
 * Section 1 — The Cosmic Entrance.
 * The start button opens the portal, streaks the starfield, then hands
 * over to the galaxy. Guarded against double-activation and skippable.
 */
import { $, isAbortError, prefersReducedMotion, wait } from './utils.js';

const PORTAL_DURATION = 1900;

export function createEntrance(ctx) {
  const section = $('#view-entrance');
  const startBtn = $('#entrance-start');
  const skipBtn = $('#entrance-skip');
  let controller = null;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    controller?.abort();
    ctx.starfield.cancelWarp();
    ctx.store.update((d) => {
      d.introSeen = true;
    });
    ctx.navigate('galaxy');
  }

  async function begin() {
    if (controller) return; // already opening — ignore double taps
    controller = new AbortController();
    const { signal } = controller;
    startBtn.disabled = true;
    ctx.onJourneyStart();
    section.classList.add('is-opening');

    try {
      if (prefersReducedMotion()) {
        await wait(400, signal);
      } else {
        skipBtn.hidden = false;
        ctx.starfield.warp(PORTAL_DURATION);
        await wait(PORTAL_DURATION, signal);
      }
      finish();
    } catch (error) {
      if (!isAbortError(error)) throw error; // aborted by skip or by leaving
    }
  }

  startBtn.addEventListener('click', begin);
  skipBtn.addEventListener('click', finish);

  return {
    mount() {
      controller = null;
      finished = false;
      section.classList.remove('is-opening');
      startBtn.disabled = false;
      skipBtn.hidden = true;
      const hasProgress = ctx.store.get().introSeen || ctx.store.completedCount() > 0;
      startBtn.textContent = ctx.t(hasProgress ? 'continue' : 'start');
    },
    unmount() {
      controller?.abort();
      ctx.starfield.cancelWarp();
      skipBtn.hidden = true;
    },
  };
}
