/**
 * App entry: wires config, state, routing and every section together.
 *
 * Routing uses the URL hash (#/galaxy, #/memories …) so the browser back
 * button works and the site runs from any sub-directory on static hosting.
 */
import { resolveConfig, createTranslator } from './config.js';
import { createStore } from './state.js';
import { createStarfield } from './starfield.js';
import { createSound } from './sound.js';
import { announce, toast } from './ui.js';
import { $, $$, fill } from './utils.js';
import { createEntrance } from './entrance.js';
import { createGalaxy } from './galaxy.js';
import { createMemories } from './memories.js';
import { createLittleThings } from './little-things.js';
import { createLetters } from './letters.js';
import { createGame } from './game.js';
import { createFinale } from './finale.js';

const ROUTES = {
  entrance: '',
  galaxy: 'galaxy',
  memories: 'memories',
  littleThings: 'little-things',
  letters: 'letters',
  game: 'catch-a-star',
  final: 'final-star',
};
const VIEW_BY_ROUTE = Object.fromEntries(Object.entries(ROUTES).map(([view, route]) => [route, view]));

function init() {
  const config = resolveConfig();
  const { t, dir, lang, num } = createTranslator(config.language);
  const store = createStore();

  /* ── Static text & document metadata ──────────────────── */
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.title = fill(t('docTitle'), { name: config.herName });
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
  $$('[data-bind]').forEach((el) => {
    const value = config[el.dataset.bind] ?? '';
    el.textContent = value;
    if (!value) el.hidden = true;
  });
  $$('[data-planet-title]').forEach((el) => (el.textContent = config.planets[el.dataset.planetTitle].title));

  /* ── Background & sound ───────────────────────────────── */
  const starfield = createStarfield($('#starfield'));
  starfield.start();

  const soundBtn = $('#sound-toggle');
  const sound = createSound(config.music, {
    onFallback: () => toast(t('soundFallback')),
    onUnavailable: () => toast(t('soundUnavailable')),
  });
  const renderSoundButton = () => {
    const on = sound.enabled;
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.setAttribute('aria-label', t(on ? 'soundOff' : 'soundOn'));
    soundBtn.title = t(on ? 'soundOff' : 'soundOn');
  };
  soundBtn.addEventListener('click', () => {
    if (sound.enabled) sound.disable();
    else sound.enable();
    store.update((d) => {
      d.soundOn = sound.enabled;
    });
    renderSoundButton();
  });
  renderSoundButton();

  /* ── Shared context handed to every section ───────────── */
  const ctx = {
    config,
    store,
    t,
    num,
    dir,
    sound,
    starfield,
    announce,
    toast,
    navigate,
    /** Called when a world is completed for the first time. */
    celebrate(id) {
      const message = fill(t('worldCompleted'), { title: config.planets[id].title });
      toast(message);
      announce(message);
    },
    /** The entrance click is a user gesture — the only moment we may resume music. */
    onJourneyStart() {
      if (store.get().soundOn && !sound.enabled) {
        sound.enable();
        renderSoundButton();
      }
    },
  };

  const controllers = {
    entrance: createEntrance(ctx),
    galaxy: createGalaxy(ctx),
    memories: createMemories(ctx),
    littleThings: createLittleThings(ctx),
    letters: createLetters(ctx),
    game: createGame(ctx),
    final: createFinale(ctx),
  };
  const sections = Object.fromEntries(Object.keys(controllers).map((id) => [id, $(`#view-${id}`)]));
  let currentView = null;

  /* ── Router ───────────────────────────────────────────── */
  function viewFromHash() {
    const route = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    return VIEW_BY_ROUTE[route] ?? 'entrance';
  }

  function navigate(view) {
    const hash = `#/${ROUTES[view] ?? ''}`;
    if (location.hash === hash || (view === 'entrance' && !location.hash)) render(view);
    else location.hash = hash; // → hashchange → render
  }

  /** Resolve guards (intro not seen, locked world) to the view we can actually show. */
  function resolveView(requested) {
    if (requested === 'entrance') return 'entrance';
    if (!store.get().introSeen) return 'entrance';
    if (requested !== 'galaxy' && !store.isUnlocked(requested)) {
      announce(t('lockedRedirect'));
      return 'galaxy';
    }
    return requested;
  }

  function render(requested) {
    const view = resolveView(requested);
    if (view !== requested) history.replaceState(null, '', `#/${ROUTES[view]}`);
    if (view === currentView) return;

    if (currentView) controllers[currentView].unmount?.();
    for (const [id, el] of Object.entries(sections)) {
      if (id === view) continue;
      el.hidden = true;
      el.classList.remove('is-active');
    }
    const isFirstRender = currentView === null;
    currentView = view;
    store.runtime.section = view;
    document.body.dataset.view = view;

    const section = sections[view];
    section.hidden = false;
    controllers[view].mount?.();
    window.scrollTo(0, 0);
    requestAnimationFrame(() => section.classList.add('is-active'));

    // Move focus to the new heading for keyboard & screen-reader users
    // (not on first load — we don't want to steal focus from the page).
    if (!isFirstRender) section.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', () => render(viewFromHash()));

  // One delegated handler for every "back to galaxy" button.
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="back"]')) navigate('galaxy');
  });

  render(viewFromHash());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
