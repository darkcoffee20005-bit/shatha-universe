/**
 * Small DOM / timing helpers shared by every module.
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Create an element: h('button', { class: 'x', text: 'Hi', 'aria-label': '…' }, child…)
 * `style` accepts an object; keys starting with "--" are set as custom properties.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key === 'style') {
      for (const [prop, val] of Object.entries(value)) el.style.setProperty(prop, val);
    } else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child != null && child !== false) el.append(child);
  }
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null) el.setAttribute(key, String(value));
  }
  return el;
}

const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => Boolean(reducedMotionQuery?.matches);

/** setTimeout as a promise that rejects with AbortError when `signal` aborts. */
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export const isAbortError = (error) => error?.name === 'AbortError';

/** Resolve on the next painted frame (lets CSS transitions start from a set state). */
export const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

/** "Hello {name}" + { name: 'x' } → "Hello x" */
export const fill = (template, vars = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) => (key in vars ? vars[key] : `{${key}}`));

export const rand = (min, max) => min + Math.random() * (max - min);
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
