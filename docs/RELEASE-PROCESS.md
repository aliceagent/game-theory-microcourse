# Release process — observed, then locked

This file records **what actually happened** on the Game Theory series and the gates that apply going forward. Do not copy aspirational “preview forever” language over production facts.

## Destinations

- **Site:** https://game-theory-microcourse.vercel.app
- **Repo:** https://github.com/aliceagent/game-theory-microcourse
- **YouTube channel:** Jonathan Caras `@jonathancaras` `UCIH9lesjd48E6GPkzXmOV4g`
- **Game Theory playlist:** **The Marshmallow Experiment** `PLR-9qisXHS88`  
  https://www.youtube.com/playlist?list=PLR-9qisXHS88  
  Verified live 2026-09-11: public, 39 items. Lesson 26 film is on the site and was **not** on this playlist at verification time.

## Deploy semantics (site)

1. The **first** Vercel deploy of a new project is production even without `--prod`.
2. Subsequent **pushes to `main` auto-deploy production**. That is how lessons 1–40 actually shipped.
3. “Preview only / never promote until asked” was written in `README.md` and **did not match** this project’s live behavior. Treat production deploys as the default for this repo unless Jonathan says otherwise for a specific change.
4. After a media ship, verify the production URL with `Content-Type: video/mp4` and the exact `Content-Length` of the hash-matched file. A 200 HTML SPA response is **not** a successful media deploy.

## Film / YouTube gates

Record these **separately**. Do not collapse them:

| Gate | Meaning |
|---|---|
| Local QA | hash match to the approved review MP4; plaque QA; 1344×768; unique picture |
| Site | production `GET /media/lesson-NN.mp4` is `video/mp4` at the expected byte size |
| Uploaded | YouTube `videos.insert` returned an ID |
| Processed | `uploadStatus=processed` |
| Thumbnail | custom thumbnail set, or automatic thumbnail visually accepted |
| Playlist-linked | the video ID is in the series playlist (read-back, not just the add call) |
| Public | privacy is public **and** Jonathan approved that lesson film |

YouTube uploads remain **after Jonathan approves that lesson film**. Site media may already be on production from a `main` push; that does not by itself authorize YouTube.

## Approval sequence for a **new** series

1. Creative-gate keyframes (3–4 stills, no generated text) → Jonathan verdict.
2. One end-to-end **pilot lesson** (film + quiz) → Jonathan verdict. That locks the series method.
3. Series production may then proceed under a recorded waiver.
4. Per-lesson YouTube still requires the requested approval stage unless a later waiver explicitly covers it.

## Source of truth

- Live YouTube API (`channels.list(mine=true)`, `playlists.list`, `playlistItems.list`, `videos.list`) beats `ops/campaign-state.json`.
- Production HTTP headers beat git commit messages.
- `MEDIA_MAP.md` + `npm run qa:media` beat “the file is in `public/media/`”.

If campaign-state and the API disagree, **fix campaign-state**. Do not invent a second playlist ID.
