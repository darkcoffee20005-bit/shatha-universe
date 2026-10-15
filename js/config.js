/**
 * Validates and normalizes the raw personalization data from data.js so the
 * rest of the app can rely on well-formed values (no undefined, no bad types).
 */
import { CONFIG, UI_STRINGS } from './data.js';

const str = (value, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);
const strList = (value) =>
  (Array.isArray(value) ? value : [value]).map((v) => str(v)).filter(Boolean);

const isPercent = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;

function warn(message) {
  console.warn(`[her-universe] ${message}`);
}

function normalizeMemories(list) {
  if (!Array.isArray(list) || list.length === 0) {
    warn('MEMORIES is empty — add at least one memory in js/data.js.');
    return [{ id: 'memory-1', title: '[…]', date: '', text: '', image: '', imageAlt: '', position: null }];
  }
  return list.map((m, i) => {
    const pos = m?.position;
    return {
      id: str(m?.id) || `memory-${i + 1}`,
      title: str(m?.title, `#${i + 1}`),
      date: str(m?.date),
      text: str(m?.text),
      image: str(m?.image),
      imageAlt: str(m?.imageAlt) || str(m?.title),
      position: pos && isPercent(pos.x) && isPercent(pos.y) ? { x: pos.x, y: pos.y } : null,
    };
  });
}

function normalizeThings(list) {
  const items = Array.isArray(list) ? list : [];
  if (!items.length) warn('LITTLE_THINGS is empty.');
  return items.map((t, i) => ({
    id: str(t?.id) || `thing-${i + 1}`,
    icon: str(t?.icon, '✦') || '✦',
    label: str(t?.label),
    text: str(t?.text),
  }));
}

function normalizeLetters(list) {
  const items = Array.isArray(list) ? list : [];
  if (!items.length) warn('SECRET_LETTERS is empty.');
  return items.map((l, i) => ({
    id: str(l?.id) || `letter-${i + 1}`,
    label: str(l?.label),
    title: str(l?.title) || str(l?.label),
    paragraphs: strList(l?.paragraphs),
  }));
}

export function resolveConfig(raw = CONFIG) {
  const language = UI_STRINGS[raw.language] ? raw.language : 'ar';
  if (raw.language !== language) warn(`Unknown LANGUAGE "${raw.language}", falling back to "ar".`);

  const herName = str(raw.herName) || '[ENTER HER NAME]';
  const planets = {};
  for (const id of ['memories', 'littleThings', 'letters', 'game', 'final']) {
    planets[id] = {
      title: str(raw.planets?.[id]?.title) || id,
      description: str(raw.planets?.[id]?.description),
    };
  }

  const volume = Number(raw.music?.volume);
  return Object.freeze({
    language,
    herName,
    herNameLatin: str(raw.herNameLatin),
    galaxyName: str(raw.galaxyName) || herName,
    nickname: str(raw.nickname) || herName,
    signature: str(raw.signature),
    welcomeMessage: str(raw.welcomeMessage),
    loveMessage: strList(raw.loveMessage),
    finalMessage: str(raw.finalMessage),
    finalLetter: strList(raw.finalLetter),
    memories: normalizeMemories(raw.memories),
    littleThings: normalizeThings(raw.littleThings),
    letters: normalizeLetters(raw.letters),
    photos: { final: str(raw.photos?.final), finalAlt: str(raw.photos?.finalAlt) },
    music: {
      src: str(raw.music?.src),
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.45,
    },
    planets,
  });
}

/** Build a translator bound to the configured language (falls back to Arabic). */
export function createTranslator(language) {
  const table = UI_STRINGS[language] ?? UI_STRINGS.ar;
  const fallback = UI_STRINGS.ar;
  const t = (key) => table[key] ?? fallback[key] ?? key;
  let numberFormat;
  try {
    numberFormat = new Intl.NumberFormat(table.locale);
  } catch {
    numberFormat = null;
  }
  return {
    t,
    dir: table.dir === 'ltr' ? 'ltr' : 'rtl',
    lang: language,
    num: (n) => (numberFormat ? numberFormat.format(n) : String(n)),
  };
}
