/**
 * Centralized state + persistence.
 *
 * `persisted` holds progress that survives a refresh (localStorage).
 * `runtime` holds volatile values (current section, live game numbers).
 * localStorage is only a convenience — never a security mechanism.
 */

export const PLANET_IDS = ['memories', 'littleThings', 'letters', 'game', 'final'];

/** Each world unlocks once the listed worlds are completed (a gentle linear journey). */
export const UNLOCK_RULES = {
  memories: [],
  littleThings: ['memories'],
  letters: ['littleThings'],
  game: ['letters'],
  final: ['game'],
};

const STORAGE_KEY = 'her-universe:progress:v1';
const LIST_KEYS = ['completed', 'viewedMemories', 'revealedThings', 'openedLetters'];

const defaults = () => ({
  version: 1,
  introSeen: false,
  completed: [],
  viewedMemories: [],
  revealedThings: [],
  openedLetters: [],
  gameWins: 0,
  bestGameMs: null,
  finalRevealed: false,
  soundOn: false,
});

/* ── Storage that never throws (private mode, disabled storage, quota) ── */
const storage = {
  read() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* progress simply won't persist */
    }
  },
};

const uniqueStrings = (value, allowed) =>
  Array.isArray(value)
    ? [...new Set(value.filter((v) => typeof v === 'string' && v.length < 80 && (!allowed || allowed.includes(v))))]
    : [];

/** Accept only well-formed saved data; anything unexpected falls back to defaults. */
function validate(raw) {
  const base = defaults();
  if (!raw || typeof raw !== 'object' || raw.version !== 1) return base;
  return {
    ...base,
    introSeen: raw.introSeen === true,
    completed: uniqueStrings(raw.completed, PLANET_IDS),
    viewedMemories: uniqueStrings(raw.viewedMemories),
    revealedThings: uniqueStrings(raw.revealedThings),
    openedLetters: uniqueStrings(raw.openedLetters),
    gameWins: Number.isInteger(raw.gameWins) && raw.gameWins >= 0 ? raw.gameWins : 0,
    bestGameMs: Number.isFinite(raw.bestGameMs) && raw.bestGameMs > 0 ? raw.bestGameMs : null,
    finalRevealed: raw.finalRevealed === true,
    soundOn: raw.soundOn === true,
  };
}

function load() {
  const text = storage.read();
  if (!text) return defaults();
  try {
    return validate(JSON.parse(text));
  } catch {
    return defaults();
  }
}

export function createStore() {
  let data = load();
  const runtime = { section: 'entrance', game: { score: 0, timeLeftMs: 0, running: false } };
  const listeners = new Set();

  const save = () => storage.write(JSON.stringify(data));
  const notify = (change) => listeners.forEach((fn) => fn(data, change));

  /** Apply a mutation to a copy, re-validate, persist and notify. */
  function update(mutator, change = {}) {
    const draft = structuredClone(data);
    mutator(draft);
    data = validate(draft);
    save();
    notify(change);
  }

  const isCompleted = (id) => data.completed.includes(id);
  const isUnlocked = (id) => (UNLOCK_RULES[id] ?? []).every(isCompleted);

  return {
    get: () => data,
    runtime,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    update,
    isCompleted,
    isUnlocked,
    /** First unfinished prerequisite of a locked world (for friendly messages). */
    blockedBy: (id) => (UNLOCK_RULES[id] ?? []).find((req) => !isCompleted(req)) ?? null,
    completedCount: () => data.completed.length,
    /** Returns true only the first time a world is completed. */
    complete(id) {
      if (!PLANET_IDS.includes(id) || isCompleted(id)) return false;
      update((d) => d.completed.push(id), { completed: id });
      return true;
    },
    /** Add a value to one of the persisted lists; returns true if it was new. */
    addToList(key, value) {
      if (!LIST_KEYS.includes(key) || data[key].includes(value)) return false;
      update((d) => d[key].push(value), { list: key, value });
      return true;
    },
    /** Replay: wipe progress, keep the sound preference. */
    reset() {
      const soundOn = data.soundOn;
      data = { ...defaults(), soundOn };
      save();
      notify({ reset: true });
    },
  };
}
