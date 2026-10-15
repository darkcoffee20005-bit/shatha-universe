/**
 * Shared UI pieces: announcements, toast, completion banners.
 */
import { h } from './utils.js';

let announceTimer = 0;
/** Speak a message to assistive technology without showing it. */
export function announce(message) {
  const region = document.getElementById('announcer');
  if (!region) return;
  region.textContent = '';
  clearTimeout(announceTimer);
  // A short delay makes screen readers treat repeated text as new.
  announceTimer = setTimeout(() => {
    region.textContent = message;
  }, 60);
}

let toastTimer = 0;
/** Brief visible message (also announced politely via role=status). */
export function toast(message, duration = 3200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), duration);
}

/** Fill a `.completion` container with a message and a way back to the galaxy. */
export function showCompletion(container, message, backLabel) {
  container.replaceChildren(
    h('p', { class: 'completion__text', text: message }),
    h('button', { class: 'btn btn--primary', type: 'button', 'data-action': 'back', text: backLabel }),
  );
  container.hidden = false;
}
