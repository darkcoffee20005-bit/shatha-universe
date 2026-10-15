/**
 * Section 6 — Planet of Secret Letters.
 * Three sealed envelopes; each opens with a flap animation and reveals its
 * letter in a dialog. Opened state is remembered.
 */
import { $, fill, h, isAbortError, prefersReducedMotion, wait } from './utils.js';
import { closeDialog, openDialog, setupDialog } from './dialogs.js';
import { burstFrom } from './fx.js';
import { showCompletion } from './ui.js';

const SEALS = ['☺', '☾', '✦', '❀', '✧'];
const OPEN_DELAY = 750;

export function createLetters(ctx) {
  const { store, t, num, config } = ctx;
  const letters = config.letters;
  const list = $('#envelopes');
  const progress = $('#letters-progress');
  const completion = $('#letters-complete');
  const dialog = $('#letter-dialog');
  let controller = null;

  setupDialog(dialog);

  const envelopes = letters.map((letter, i) => {
    const state = h('span', { class: 'envelope__state' });
    const button = h(
      'button',
      { class: `envelope envelope--${i % 3}`, type: 'button', 'aria-haspopup': 'dialog' },
      h(
        'span',
        { class: 'envelope__art', 'aria-hidden': 'true' },
        h('span', { class: 'envelope__back' }),
        h('span', { class: 'envelope__paper' }),
        h('span', { class: 'envelope__front' }),
        h('span', { class: 'envelope__flap' }),
        h('span', { class: 'envelope__seal', text: SEALS[i % SEALS.length] }),
      ),
      h('span', { class: 'envelope__label', text: letter.label }),
      state,
    );
    button.addEventListener('click', () => openLetter(i));
    list.append(h('li', { class: 'envelope-item' }, button));
    return { letter, button, state };
  });

  async function openLetter(index) {
    if (controller) return; // an envelope is already opening
    const { letter, button } = envelopes[index];
    controller = new AbortController();
    try {
      button.classList.add('is-opening');
      if (!prefersReducedMotion()) await wait(OPEN_DELAY, controller.signal);
      store.addToList('openedLetters', letter.id);
      burstFrom(button.querySelector('.envelope__seal'), { count: 10, spread: 50 });
      showLetter(letter, button);
      render();
    } catch (error) {
      if (!isAbortError(error)) throw error;
    } finally {
      controller = null;
    }
  }

  function showLetter(letter, origin) {
    $('#letter-label').textContent = letter.label;
    $('#letter-title').textContent = letter.title;
    $('#letter-body').replaceChildren(
      ...letter.paragraphs.map((p, i) => h('p', { class: 'reveal-line', style: { '--i': i }, text: p })),
    );
    $('#letter-sign').textContent = config.signature ? `— ${config.signature}` : '';
    openDialog(dialog, origin);
    dialog.querySelector('.dialog__inner').scrollTop = 0;
  }

  function render() {
    const opened = new Set(store.get().openedLetters);
    let count = 0;
    for (const { letter, button, state } of envelopes) {
      const isOpen = opened.has(letter.id);
      if (isOpen) count += 1;
      button.classList.toggle('is-open', isOpen);
      if (!isOpen) button.classList.remove('is-opening');
      state.textContent = t(isOpen ? 'letterOpened' : 'letterSealed');
    }
    progress.textContent = fill(t('lettersProgress'), { n: num(count), total: num(letters.length) });
    if (letters.length && count === letters.length) {
      if (store.complete('letters')) ctx.celebrate('letters');
      showCompletion(completion, t('lettersComplete'), t('backToGalaxy'));
    } else {
      completion.hidden = true;
    }
  }

  return {
    mount: render,
    unmount() {
      controller?.abort();
      controller = null;
      closeDialog(dialog);
    },
  };
}
