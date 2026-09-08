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
   - `approved` — explicitly approved (lesson 1 gate, decision 6b).
   - `approved-pipeline` — produced by the pipeline that was approved at the lesson-1 gate.
6. **No paid image spend.** All stills, posters and share cards are produced locally at $0 (plan §2.1). The
   $0.02-per-image cap is satisfied by never buying an image, not by shopping carefully.
7. **The original lecture video is never re-hosted** (decision 13b). No row here may point at a copy of it.

## Assets

| File | Source authority | Teaching purpose | Approval state | sha256 |
| --- | --- | --- | --- | --- |
| `public/media/placeholder-poster.svg` | Deterministic paper-craft SVG authored in this repo (sprint 1) | Stands in for the lesson film on every lesson that has no MP4 yet, under the honest "Video in production" label | `deterministic` | `3fcd1236b014009c2e9c75980ecdb94c847530b1298ad3b5171b952d1bd5516c` |

## Not yet present

These land in later sprints and get their rows when the bytes exist — not before:

- `public/media/lesson-NN.mp4`, `lesson-NN-poster.webp`, `lesson-NN-narration.mp3` (sprints 6–7).
- `public/share/unit-N.png`, `public/share/course.png` (sprint 8).

`public/content/lesson-NN.json` and `src/content/course.ts` are **generated content, not media**: they are
built from `content/course.v2.json` by `scripts/build-content.mjs` on every build, so they are validated by
that script rather than hashed here.
