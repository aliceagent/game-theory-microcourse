# MEDIA_MAP

Every file shipped from `public/media/` and `public/share/` is listed here with the hash of the exact bytes
that ship. `npm run qa:media` (`scripts/check-media.mjs`) enforces it and fails closed.

## Rules

1. **No unlisted media.** A file under `public/media/` or `public/share/` with no row here fails the check.
   Adding art is a two-step act: produce the file, then record it.
2. **Hash-bound.** Every row carries the `sha256` of the shipped bytes. Re-encode, re-crop or re-render an
   asset and the row must be updated in the same change — drift fails the check, it is never auto-healed.
3. **Source authority.** Each row says where the asset came from and under whose authority it exists: a local
   generation run, a deterministic script in this repo, or an approved pipeline stage. Nothing is "just there".
4. **Teaching purpose.** Each row says what the asset teaches or carries. An asset with no teaching job does
   not belong in the course.
5. **Approval state.** One of:
   - `deterministic` — produced by code in this repo, reproducible byte-for-byte, no human approval needed.
   - `provisional` — generated, hashed, and in the tree, but not yet approved for the shipped course.
   - `approved` — explicitly approved (lesson 1 gate).
   - `approved-pipeline` — produced by the pipeline that was approved at the lesson-1 gate.
6. **Paid stills are capped, not forbidden.** I2V first frames are xAI `grok-imagine-image` at $0.02 each. Hard series cap **$5**. xAI video API is prohibited. Posters may be extracted from the approved film at $0.
7. **The original lecture video is never re-hosted** (decision 13b). No row here may point at a copy of it.

## Assets

| File | Source authority | Teaching purpose | Approval state | sha256 |
| --- | --- | --- | --- | --- |
| `public/media/placeholder-poster.svg` | Deterministic paper-craft SVG authored in this repo (sprint 1) | Stands in for the lesson film on every lesson that has no MP4 yet, under the honest "Video in production" label | `deterministic` | `3fcd1236b014009c2e9c75980ecdb94c847530b1298ad3b5171b952d1bd5516c` |
| `public/media/lesson-01.mp4` | Lesson 1 v3 unique H3 chain + Eve + locked jazz mix; Jonathan 2026-09-09 picture pass + jazz volume lock | Marshmallow-test lecture film | `approved` | `5033278752930901606ed4d35ab039e1b6b7ccd2e58cb2f82b8b00d47cb0e9d0` |
| `public/media/lesson-01-poster.webp` | Frame extract from approved lesson-01.mp4 | Lesson 1 poster | `approved` | `bb31a0599b9a09f6418b96f2f3c405179a023419a77b6920f6176dbcb5c481c8` |
| `public/media/lesson-02.mp4` | Lesson 2 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Delayed gratification and self-control lecture film | `approved` | `75ae84a3bbded9152ee89dd7cf2473b1cac9f6bb8847711e4a143abebd3522ca` |
| `public/media/lesson-02-poster.webp` | Frame extract from lesson-02.mp4 | Lesson 2 poster | `approved` | `42719cc31f3a999acd8d834f0963b32c6876dba76243352b6a8e0b2bcf6d166d` |
| `public/media/lesson-03.mp4` | Lesson 3 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Growth mindset and resilience lecture film | `approved` | `ff7b7349c874092866e7649112c68371463b8f4b850181b520a308f7e5e42adc` |
| `public/media/lesson-03-poster.webp` | Frame extract from lesson-03.mp4 | Lesson 3 poster | `approved` | `bb050d5bdbb9205a4bd54c6659c85e27786c00d58fda9660e96fca792095a347` |
| `public/media/lesson-04.mp4` | Lesson 4 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Deliberate practice and self-assessment lecture film | `approved` | `97fc453ea47127529b3a1eb8083cc22e985e248f5349345a0d3c4bd9ec326941` |
| `public/media/lesson-04-poster.webp` | Frame extract from lesson-04.mp4 | Lesson 4 poster | `approved` | `96a174de8732bf74b1a7f51a6fb63a687c807705598632b9626bb98d88cd1ca6` |
| `public/media/lesson-05.mp4` | Lesson 5 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768 redo after 1024 rejected; plaque QA pass max_w 1055 | Misjudging your own performance lecture film | `approved` | `a74c7b6f1ed75e870b96e5de4697f66d3e89aee946c23356b2159cda42a4ac89` |
| `public/media/lesson-05-poster.webp` | Frame extract from approved lesson-05.mp4 | Lesson 5 poster | `approved` | `55b4a887b4e70fbadd2e3022cf032480c3f3040cb15226dab1e41ac790ada0c9` |
| `public/media/lesson-06.mp4` | Lesson 6 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768 redo after 1024 rejected; plaque QA pass max_w 1089 | Correlation is not causation lecture film | `approved` | `249612737e8e40fb98dadc2674d16f103db4b12b76166ba64ce6979b6756799f` |
| `public/media/lesson-06-poster.webp` | Frame extract from approved lesson-06.mp4 | Lesson 6 poster | `approved` | `05fb9e037e9befeac8166c92e6d0bde897cca3e0a546430d79382e951ffb0be7` |

## Not yet present

These land in later sprints and get their rows when the bytes exist — not before:

- `public/media/lesson-NN.mp4`, `lesson-NN-poster.webp`, `lesson-NN-narration.mp3` (sprints 6–7).
- `public/share/unit-N.png`, `public/share/course.png` (sprint 8).

`public/content/lesson-NN.json` and `src/content/course.ts` are **generated content, not media**: they are
built from `content/course.v2.json` by `scripts/build-content.mjs` on every build, so they are validated by
that script rather than hashed here.
