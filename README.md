# Game Theory, Success and Social Mobility

A paper-craft microcourse player: 40 lessons across 6 units, each with a lesson video stage, five multiple-choice
questions with forced correction, a section summary, and the transcript window it was built from.

> This course teaches one lecturer's argument about success, game theory and social mobility, reconstructed from
> a public talk. It presents his claims so you can understand them — not as endorsed or independently verified
> fact.

**Source lecture:** shared by [@Dhruvkumar16797 on X](https://x.com/Dhruvkumar16797/status/2096827603508469947)
(~53 min). The original video is not re-hosted here; the course only reconstructs and teaches it.

## Requirements

- Node.js 20+ (developed on 24)
- Chromium at `/snap/bin/chromium` for the QA harness, or any Chromium binary via `PUPPETEER_EXECUTABLE_PATH`

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

`dev` and `build` both run `scripts/build-content.mjs` first, which validates `content/course.v2.json` (the
source of truth) and emits `src/content/course.ts` plus `public/content/lesson-NN.json`. A lesson missing an
id, title, summary, transcript excerpt, or five questions with exactly one correct option fails the build.

```bash
npm run lint         # oxlint
npm run build        # content build + tsc -b + vite build
npm run preview      # serves dist/ on http://127.0.0.1:4173
```

## QA

Both checks fail closed and exit non-zero. Run them against a served build, not the dev server.

```bash
npm run build
npm run preview &            # http://127.0.0.1:4173
npm run qa                   # browser flows
npm run qa:media             # hash-bound media manifest
```

### `npm run qa` — `scripts/qa.mjs`

Headless Chromium (`puppeteer-core`) drives the real learner flows and asserts:

- home loads with hero, disclaimer, source card, unit map, and a working CTA;
- zero console errors and zero failed non-media requests across the whole run;
- lesson 1: submit is blocked until all five questions are answered, wrong answers enter the forced-correction
  loop with the rejected option struck out and disabled, explanations render only once every question is
  correct, and the progress bar tracks 0% → 60% → 100%;
- progress survives a refresh and the home CTA advances to the next lesson;
- lesson 40 is reachable and plays the shipped `lesson-40.mp4` (no production stub);
- the transcript disclosure opens and closes;
- disclaimer and source card appear on both home and lesson pages;
- no horizontal overflow at 1440 or 390 px, and the mobile CTA and quiz options fit the viewport;
- the dark-mode toggle repaints and returns to light.

Screenshots and `report.json` are written to `qa/`: `desktop-home`, `desktop-home-dark`, `lesson-quiz`,
`lesson-correction`, `celebration-unit-1`, `mobile-home`, `mobile-lesson`.

Point it at any deployment:

```bash
BASE_URL=https://<preview-url> npm run qa
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium npm run qa   # non-snap Chromium
```

### `npm run qa:media` — `scripts/check-media.mjs`

Every file under `public/media/` and `public/share/` must have a row in [`MEDIA_MAP.md`](MEDIA_MAP.md) with a
source authority, teaching purpose, approval state, and the sha256 of the shipped bytes. Unlisted files,
missing files, and hash drift all fail. Regenerating a row is a deliberate human edit — the script never
rewrites the map.

## Layout

```
content/course.v2.json     source-of-truth bundle (40 lessons, 200 MCQs, transcript windows)
scripts/                   build-content.mjs, qa.mjs, check-media.mjs
src/                       routes/, components/, strings.ts (single copy-swap point), styles/
public/media/              posters and films; hash-bound by MEDIA_MAP.md
qa/                        QA screenshots and report.json (generated)
DESIGN.md                  paper-craft design tokens and rules
```

Progress is stored in `localStorage` under `gt-course-progress-v1`. There is no backend and no account.

## Deploy

Public GitHub. **Pushes to `main` deploy production** (`https://game-theory-microcourse.vercel.app`). The first Vercel deploy of a new project is production even without `--prod`. See `docs/RELEASE-PROCESS.md`.

Site source is MIT. Course content is reconstructed from the public lecture linked above. Generated media remains copyright Jonathan Caras unless separately licensed.
