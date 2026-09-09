# Lesson Film Methodology — Game Theory Microcourse

**Status:** LOCKED. Jonathan (2026-09-09): Lesson 1 v3 PASSED. This methodology applies at the same quality bar to the entire 40-lesson series. **1344x768 is LOCKED — do not re-ask resolution.**

**Canonical copy:** this file. Pointer copy: `/home/nvidia/.hermes/plans/2026-09-09-game-theory-film-methodology-fable.md`.

- Site: https://game-theory-microcourse.vercel.app
- Repo: https://github.com/aliceagent/game-theory-microcourse
- Passed reference artifact: `/home/nvidia/generated/game-theory-microcourse/ops/out/lesson-01/lesson-01-review-v3.mp4`

This is an executable production manual. Sections are marked **[NORMATIVE]** (standing rules — violating one fails the lesson), **[EVIDENCE, dated 2026-09-09]** (what actually happened on Lesson 1 — measured, not aspirational), or **[PITFALLS]** (rejected approaches — do not repeat).

---

## 1. Standing rules [NORMATIVE]

These are locked by Jonathan as of the Lesson 1 v3 pass. They are not suggestions.

### 1.1 Uniqueness of picture (the loop ban)
1. **No video, frame, or animation is ever played more than once.** No loop, no reverse, no ping-pong, no freeze-hold of a short clip stretched under long audio.
2. **Unique picture duration must be >= narration duration.** If picture comes up short, **FAIL LOUDLY** — never paper over it. Never use `-stream_loop` on video input. (Looping the background-music *audio* file is fine.)
3. Duration reconciliation: if picture is slightly **long**, trim the picture **TAIL**. If picture is slightly **short**, pad the **AUDIO** with silence. Never stretch, loop, or freeze picture to cover audio.

### 1.2 Shot legality (MiniMax H3 constraints)
4. **Max single clip: 7 seconds.** H3 legal frame counts at 24 fps satisfy `n % 17 == 5`. Default shot: **5.167 s (124 frames)**. Longest legal shot ≤ 7 s: **6.583 s**. **Never request 11 s+** (measured timeout — see Pitfalls).

### 1.3 Still/frame provenance (one-still-one-video)
5. **A still (identified by its first-frame SHA-256) may seed exactly one I2V generation. Ever.** Do not reuse a hash that has already seeded a video — including stills used in earlier rejected versions (still-v2 is burned).
6. **Continuation shots chain from the previous shot's LAST FRAME** — extract it as a new image (new hash), and seed the next I2V from that. Never go back to the original still for shot 2, 3, ….

### 1.4 Visual quality bar
7. Every visual must be **unique, papercraft-consistent, relevant to the narration at that moment, and duration-matched**.
8. **Papercraft style constants:** cream `#F6F1E8` base, slate/teal accents, visible paper fibers, fold shadows. No CGI gloss. **No generated text in pixels** — all lettering (titles, labels, subtitles) is deterministic type rendered in Pillow, never asked of the image model.
9. **Subtitles:** one large papercraft plaque line at a time, speech-aligned via Whisper word timestamps. Never a tiny paragraph dump, never default unstyled captions.
10. **Title:** a stylistic papercraft style-card with deterministic type, shown exactly once at the top of the lesson. A monotonic, unique zoom over it is fine (no plateau, no freeze-loop).
11. **Jazz BGM is added only to FINAL assembled lesson MP4s**, sidechain-ducked quieter than the voice. Intermediate artifacts stay music-free.

### 1.5 Cost and tooling
12. **First frames:** xAI `grok-imagine-image`, $0.02/image. **Motion:** local MiniMax H3 only. The **xAI video API is prohibited.** **Hard series spend cap: $5.**
13. **GPU discipline:** one heavy job at a time on this host. Use `h3-native.py --lock-wait` / the gpu_hold mechanism. `extra-fast` is the fastest preset and still costs ~4.7 min per 5.17 s shot at 1344x768 — plan around it; do not attempt to parallelize heavies.

### 1.6 Autonomy and operations
14. **Overnight conveyor:** cron worker every 12 minutes (job id `3b8548510eb6`) plus a stall watchdog. A Telegram turn ending is **not** a stop signal. **Waiver in force:** no per-artifact human gates after the methodology lock. The Lesson 1 v3 pass locks quality, resolution, and method for the series — do not wait for per-lesson approval.
15. Opus coding sprints may hit max-turns; salvage the working tree, and Hermes verifies lint/build afterward.
16. **Vercel:** the *first* deploy of a project is production even without `--prod`; subsequent deploys are previews unless `--prod` is passed. Lesson media updates go out as **preview** deploys.

### 1.7 Assembly
17. Assemble with the ffmpeg **concat demuxer** over full unique shots. **Strip native H3 audio** from every shot. Mux the approved Eve voice + ducked jazz at final assembly only.

---

## 2. Lesson 1 production record [EVIDENCE, dated 2026-09-09]

Everything in this section was measured on the passed Lesson 1 v3 run. Use it as the calibration baseline, not as a spec to re-derive.

### 2.1 Passed artifact
`/home/nvidia/generated/game-theory-microcourse/ops/out/lesson-01/lesson-01-review-v3.mp4`

- Total **90.538 s** = 4 s title card + **86.538 s** voice.
- **1344x768**, ~20 MB.
- Picture: **17 unique** extra-fast H3 I2V shots × 5.167 s, concatenated in full, then **tail-trimmed** to the voice length. Never looped.

### 2.2 Voice (TTS)
- Engine: **xAI Eve**. Lesson 1 used two transcript blocks, synthesized separately and concatenated into `voice.wav` at **86.538 s**.
- Alignment: **Whisper `small`** with word timestamps, driving the subtitle plaques.

### 2.3 Subtitle plaques
- One line at a time, speech-aligned to Whisper words.
- Rendered deterministically: **large cream strip, teal tab, DejaVu Bold 54**, visible-ink centered. (This is the "papercraft plaque" style; it replaced rejected ASS captions — see Pitfalls.)

### 2.4 Music
- Track: `/home/nvidia/generated/paper-cut-video-instructional-site/public/media/happy-jazz-sample.mp3`
- Sidechain-ducked under the Eve voice. Native H3 audio stripped before mux.

### 2.5 Stills
- xAI `grok-imagine-image` at $0.02 each; prompts specify **no baked-in text**.
- Lesson 1 used a title style-card still plus chapter stills.
- The "LESSON 01" numeral and title were typeset deterministically in **Pillow** onto the style card — never generated as pixels.

### 2.6 Motion — the exact command shape

```bash
/home/nvidia/bin/h3-native.py \
  --mode i2v \
  --quality extra-fast \
  --duration 5.167 \
  --resolution 1344x768 \
  --audio-mode native \
  --lock-wait 300
```

- `extra-fast` = 4-step turbo4 LoRA (faster than `turbo`, which is 8 steps). The 20-step `quality` preset is **not** used for this series.
- Measured first-frame similarity to the seed image: **~0.995–0.997** — last-frame chaining is visually seamless.
- `--audio-mode native` generates audio we then discard. That is a known speed cost; **keep it** until a measured silent path exists (see Pitfalls).

### 2.7 Measured cadence
- **~282–293 s wall time per 5.17 s shot** (~4.7 min) at 1344x768 extra-fast.
- An 11.542 s extra-fast attempt **timed out at 900 s**. Long shots are not viable; the unique 5.167 s chain is the method.

### 2.8 Spend
- Images at the Lesson 1 pass: ~$0.20; ledger later ~$0.26. Cap remains **$5** for the series.

---

## 3. Per-lesson procedure for Lessons 2–40 [NORMATIVE]

Execute this end-to-end per lesson N. **Do not wait for per-lesson approval** (waiver in §1.6). Fail loudly on any rule violation instead of improvising.

1. **TTS.** Synthesize xAI Eve from lesson N's `transcript_blocks`; concat blocks into `voice.wav`. Record exact voice duration.
2. **Align.** Whisper `small` word timestamps over `voice.wav`. Plaques follow the *audio as spoken* (see Whisper-mishear pitfall).
3. **Beat plan.** Divide the voice duration into 5.167 s beats; the shot count is `ceil(voice / 5.167)` so unique picture ≥ narration. (Lesson 1: 86.538 s → 17 shots = 87.839 s of picture, tail-trimmed.)
4. **Stills.** Generate ~3 **new, unused** xAI stills per lesson at chapter cut points (plus title style-card treatment). Verify each first-frame SHA-256 has never seeded an I2V. Deterministic Pillow type for all lettering.
5. **Motion.** For each chapter: seed the first shot from the fresh still, then chain — extract last frame → new image → next I2V. `--quality extra-fast`, 1344x768, shots ≤ 7 s (default 5.167 s), `--lock-wait` respected, one heavy at a time.
6. **Assemble.** Concat demuxer over **full** unique shots (no per-shot frame drops — see seam pitfall), strip native H3 audio, prepend the title card (once, monotonic zoom OK), burn plaques, tail-trim picture to voice, mux Eve + sidechain-ducked jazz.
7. **QA (automated).** Check: total duration = title + voice (±1 frame); `freezedetect` finds no held frames; no `-stream_loop` anywhere in the assembly command history; picture-vs-voice reconciliation followed §1.1 rule 3.
8. **Publish.** Copy the final MP4 to `public/media/`; deploy as a **preview** (not `--prod`).
9. Move to lesson N+1.

### Overnight conveyor behavior
- Cron worker every 12 min (`3b8548510eb6`) resumes the pipeline; stall watchdog restarts hung shots.
- A cron tick that finds the GPU busy must **stay silent and exit** — no log spam, and critically **no duplicate xAI spend** (do not re-generate stills on a busy tick).

---

## 4. Scale math for the series [EVIDENCE + PLANNING]

- 40 lessons, `duration_seconds` sum **3142 s** (individual lessons 51–163 s).
- Picture: ~3142 s ÷ 5.167 s ≈ **608 unique shots** × ~4.7 min ≈ **~48 h of serial GPU time**. The conveyor must run unattended (hence §1.6 and the cron worker).
- Stills: ~3 new xAI stills/lesson × 40 × $0.02 = **$2.40** plus retries — comfortably under the $5 cap, but retries count; track the ledger.
- The old 5 s looping `i2v.mp4` files for lessons 2–4 are **dead ends** for finals. They may not appear in any assembled lesson (loop ban + burned hashes).

---

## 5. Pitfalls — rejected approaches and measured traps [PITFALLS]

Each of these cost real time on Lesson 1. Do not rediscover them.

1. **Looped bumper (v2).** One 5 s clip × 17 under 86 s of voice — **REJECTED** by Jonathan. This is what produced standing rule §1.1.
2. **Tiny unstyled ASS captions — REJECTED.** Papercraft plaques (§2.3) are the required subtitle form.
3. **Flat title card — REJECTED.** The title must be a papercraft *style-card* with deterministic type.
4. **11.5 s extra-fast shot timed out at 900 s.** Long clips are not a shortcut; the pivot to the unique 5.167 s chain is permanent (and now legal-max-bounded at 6.583 s anyway).
5. **Seam-frame skipping.** Dropping 1/24 s at each of 14 seams made the picture 0.54 s shorter than the voice — a silent rule-2 violation. The assembler must concat **full** unique shots and reconcile only by tail-trimming at the end.
6. **Still hash reuse.** still-v2 seeded both the old bumper I2V and (nearly) a new chapter I2V — that violates one-still-one-video. Check the used-hash ledger before every I2V.
7. **Native H3 audio waste.** We generate native audio and discard it — a known speed cost. Keep `--audio-mode native` until a *measured* silent path exists; do not switch on an untested flag mid-series.
8. **Preset confusion.** `extra-fast` (4 steps) is faster than `turbo` (8 steps). The 20-step `quality` preset is not for this series.
9. **No parallel heavies.** Two concurrent H3 jobs on this host do not work. Serial only, with `--lock-wait`.
10. **Whisper mishears** (e.g., "Aussie"/"easy", "Michel"/"Mischel"). Plaques must sync to the TTS **audio as spoken**, not the idealized transcript, when the two disagree — alignment beats orthography.
11. **Cron double-spend.** A tick arriving while the GPU is busy must exit silently without triggering new xAI image calls.
12. **Vercel deploy semantics.** The first deploy of a project is production even without `--prod`. Already true for this project — all subsequent lesson deploys are previews unless `--prod` is passed, which is the desired behavior.

---

## 6. Quick reference card

| Parameter | Locked value |
|---|---|
| Resolution | **1344x768** (do not re-ask) |
| Default shot | 5.167 s (124 frames @ 24 fps) |
| Legal frames | `n % 17 == 5`, clip ≤ 7 s (max legal 6.583 s) |
| Motion | `/home/nvidia/bin/h3-native.py --mode i2v --quality extra-fast` |
| Cadence | ~4.7 min wall per shot |
| Voice | xAI Eve, blocks → concat `voice.wav` |
| Alignment | Whisper `small`, word timestamps |
| Subs | Papercraft plaque: cream strip, teal tab, DejaVu Bold 54 |
| Music | `happy-jazz-sample.mp3`, sidechain-ducked, finals only |
| Stills | xAI `grok-imagine-image` $0.02, no baked text, one-still-one-video |
| Spend cap | $5 series total (at ~$0.26 as of 2026-09-09) |
| Assembly | concat demuxer, strip H3 audio, tail-trim picture, pad audio silence |
| Deploys | preview (first-ever deploy was production) |
| Approval | None per lesson — L1 v3 pass locks the series |
