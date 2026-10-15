/**
 * Section 5 — Planet of Little Things.
 * Small glowing lights that each reveal one short, specific message.
 */
import { $, fill, h } from './utils.js';
import { burstFrom } from './fx.js';
import { showCompletion } from './ui.js';

export function createLittleThings(ctx) {
  const { store, t, num, config } = ctx;
  const things = config.littleThings;
  const list = $('#things-list');
  const progress = $('#things-progress');
  const completion = $('#things-complete');

  const items = things.map((thing, i) => {
    const messageId = `thing-msg-${i}`;
    const message = h('p', { class: 'thing__text', id: messageId, text: thing.text });
    const button = h(
      'button',
      {
        class: 'thing__light',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': messageId,
      },
      h('span', { class: 'thing__icon', 'aria-hidden': 'true', text: thing.icon }),
      h('span', { class: 'thing__label', text: thing.label }),
    );
    const card = h('li', { class: 'thing', style: { '--float-delay': `${-i * 0.9}s` } }, button, h('div', { class: 'thing__reveal' }, message));
    button.addEventListener('click', () => reveal(i));
    list.append(card);
    return { thing, card, button };
  });

  function reveal(index) {
    const { thing, button } = items[index];
    if (store.addToList('revealedThings', thing.id)) {
      burstFrom(button.querySelector('.thing__icon'), { count: 9, spread: 45 });
      ctx.sound.chime(index);
    }
    render();
  }

  function render() {
    const revealed = new Set(store.get().revealedThings);
    let count = 0;
    for (const { thing, card, button } of items) {
      const open = revealed.has(thing.id);
      if (open) count += 1;
      card.classList.toggle('is-revealed', open);
      button.setAttribute('aria-expanded', String(open));
    }
    progress.textContent = fill(t('thingsProgress'), { n: num(count), total: num(things.length) });
    if (things.length && count === things.length) {
      if (store.complete('littleThings')) ctx.celebrate('littleThings');
      showCompletion(completion, t('thingsComplete'), t('backToGalaxy'));
    } else {
      completion.hidden = true;
    }
  }

  return { mount: render, unmount() {} };
}
