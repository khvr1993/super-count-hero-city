# 🦸 Super Count: Hero City

A visual counting game made for **Avyan** (age 5). Captain Avyan rescues Hero City by counting kittens, power cells, pizzas, robots, stars, and balloons before the gate timer runs out.

**Play:** https://khvr1993.github.io/super-count-hero-city/

Built as an installable PWA and tuned for iPad. No accounts, no ads, no network calls, no data leaves the device. There is **no voice narration** anywhere in the app.

---

## How it plays

1. Pick a cape.
2. Tap the **LEVEL** pill to choose a level — **Rookie** (count to 5), **Hero** (to 7), **Super** (to 8), or **Turbo** (to 10). Tapping a level starts the race right away. Or just tap **RACE!** to play the current level.
3. Tap each object — it hops into the **Power Core**, which teaches one-to-one correspondence. Tap the same object twice and it wiggles ("already counted").
4. Tap the number to launch to the next rooftop.
5. Four rooftops per race, then a medal, power bolts, and a new hero badge.

**Forgiving by design**

- Running out of time is never a loss. The hero helper counts along, then hands the question back.
- Wrong answers trigger a gentle count-along and a retry; after two misses the correct choice glows.
- Slow but careful counters get **more time**, not easier math.

**Adaptive difficulty**

Four tiers adjust count range (3→10), counted-object numbering, the power-core tray, answer choices (3→4), and time. The level picker lets a grown-up (or the hero) choose a starting tier; during play the game still adapts — two clean gates in a row moves up a tier, two helped gates moves down one.

**Silent by design** — no voice narration at all. The question appears in large text beside the object icon, so a grown-up can read it aloud if needed. Mutable sound effects still celebrate correct answers and gently signal mistakes.

---

## Grown-ups

Hold the small ⚙️ button on the home screen for ~1.6 seconds:

- Hero name
- Sound effects / countdown timer toggles
- Manual challenge tier (1–4)
- Reset progress

Progress is stored in `localStorage` on the device.

### iPad setup

1. Open the site in Safari.
2. Share → **Add to Home Screen** for a fullscreen, chromeless app.
3. Optional: enable **Guided Access** (Settings → Accessibility → Guided Access, triple-click the side button) so the game can't be left accidentally.

---

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview
```

Regenerate the PWA icons at any time:

```bash
node scripts/gen-icons.mjs
```

`vite.config.ts` uses the `/super-count-hero-city/` base path when `GITHUB_ACTIONS` is set; local dev is served from `/`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, builds, and publishes `dist` to GitHub Pages.

To deploy somewhere else, upload the contents of `dist/` — it is a fully static site.

---

Made with ❤️ for Avyan.
