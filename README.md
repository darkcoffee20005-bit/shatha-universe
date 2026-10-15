# ✦ A Universe Named After You — كون باسمج

A small, interactive universe made for one person: a cinematic entrance, a galaxy of five worlds, a mini-game, memories, secret letters and a final reveal.

Built with plain **HTML, CSS and vanilla JavaScript (ES modules)**. There's no framework, no build step and no backend.

---

## 1. Personalize it (edit one file)

Everything personal lives in **`js/data.js`**. You never need to touch the other files.

| Constant | What it is |
|---|---|
| `LANGUAGE` | `'ar'` (RTL, Iraqi-dialect UI) or `'en'` |
| `HER_NAME` / `HER_NAME_LATIN` | Her name (already set to **شذى / Shatha**) |
| `GALAXY_NAME` | The galaxy title on the map |
| `SPECIAL_NICKNAME` | Used in the final letter greeting (empty = her name) |
| `SIGNATURE` | How letters are signed |
| `WELCOME_MESSAGE` | Opening screen text |
| `LOVE_MESSAGE` | Lines revealed after winning Catch-a-Star |
| `FINAL_MESSAGE` | Shown under her name in the finale |
| `FINAL_LETTER` | The "اقري آخر رسالة ✦" letter (one string per paragraph) |
| `MEMORIES` | Memory stars: `title`, `date`, `text`, optional `image`, optional `position` |
| `LITTLE_THINGS` | Small revealable details (`icon`, `label`, `text`) |
| `SECRET_LETTERS` | The three "open when…" envelopes |
| `PHOTO_PATHS.final` | Optional photo for the finale |
| `MUSIC.src` | Optional MP3 (off by default) |
| `PLANETS` | Planet titles and descriptions |

Text inside **[square brackets]** is a placeholder. Replace it with your own words. No real memories were invented.

**Photos:** put files in `assets/images/` and reference them like `'assets/images/first-trip.jpg'`. Missing or broken images show an illustrated placeholder instead.

**Music:** put an MP3 at `assets/audio/ambient.mp3`. Without it, the sound button plays a soft generated ambient tone instead.

## 2. Run locally

ES modules need a local server; opening `index.html` directly from disk won't work.

```bash
cd her-universe
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, the VS Code Live Server extension, and so on).

## 3. Deploy

The site is fully static and uses only relative paths plus hash routing (`#/galaxy`). It works from any sub-directory.

- **GitHub Pages:** push the folder and enable Pages for the branch.
- **Netlify / Vercel / Cloudflare Pages:** drag-and-drop the folder, or deploy it with no build command and the folder as the output directory.

The page has `noindex` set so search engines don't list it. The link itself isn't secret, though. localStorage is used only to save progress and is **not** a security mechanism.

## 4. The journey

1. **Cosmic Entrance:** the portal opens, the stars streak, and the galaxy appears (skippable).
2. **Her Galaxy:** five planets with locked, available and completed states, glowing constellation lines, and a progress counter.
3. **Planet of Memories:** a constellation of memory cards with previous/next navigation.
4. **Planet of Little Things:** glowing lights that reveal short messages.
5. **Planet of Secret Letters:** three envelopes with a flap-opening animation.
6. **Catch-a-Star:** catch 5 stars in 15 seconds. Winning forms a constellation and reveals `LOVE_MESSAGE` line by line.
7. **The Final Star:** the galaxy dims, stars gather into a heart, then her name, the message and the final letter appear. **Replay** resets everything after a confirmation.

Worlds unlock in order (`UNLOCK_RULES` in `js/state.js`). Progress survives a refresh. To start over from the browser console: `localStorage.removeItem('her-universe:progress:v1')`.

## 5. Project structure

```
her-universe/
├── index.html            semantic skeleton + dialogs
├── css/
│   ├── main.css          tokens, layout, components (mobile-first)
│   ├── animations.css    keyframes + reduced-motion overrides
│   └── responsive.css    breakpoints
├── js/
│   ├── data.js           ✎ ALL personal content + UI strings
│   ├── config.js         validates / normalizes data.js
│   ├── state.js          central store, unlock rules, safe localStorage
│   ├── app.js            bootstrapping + hash router
│   ├── entrance.js       section 1
│   ├── galaxy.js         section 2
│   ├── memories.js       planet of memories
│   ├── little-things.js  planet of little things
│   ├── letters.js        secret letters
│   ├── game.js           Catch-a-Star
│   ├── finale.js         the final star
│   ├── starfield.js      canvas star background
│   ├── fx.js             capped particle bursts
│   ├── sound.js          optional music / chimes
│   ├── dialogs.js        native <dialog> helpers
│   ├── ui.js             toast, announcements, completion banners
│   └── utils.js
└── assets/{images,audio}/
```

## 6. Accessibility and comfort

- Real buttons everywhere, with visible focus rings. Every interaction works by keyboard, touch or mouse, and none depends on hover.
- Escape closes dialogs. Focus returns to the element that opened them.
- Game results and world completions are announced to screen readers.
- Planet states always show text ("مقفول 🔒", "اكتشفتيه ✓"), never color alone.
- `prefers-reduced-motion` turns off the warp, drifting and stagger effects, and the finale appears instantly.
- Uses safe-area insets, `100svh` with a fallback, touch targets of 44px or more, and no horizontal scroll down to 320px.

## 7. Known limitations

- Placeholder memories, little things and parts of the letters must be filled in by you.
- Google Fonts load from the network. Offline, the site falls back to system fonts.
- Progress is saved per browser and device. Opening the site on another phone starts fresh.
- Browsers without native `<dialog>` support (very old ones) get a basic fallback without a backdrop.
