# Subtitle Plaque QA — Normative Rules & Gates

**Status:** BINDING for all lesson assembly from 2026-09-09 onward.
**Trigger:** Jonathan rejected the Lesson 7 review MP4 — "the subtitles are often cut off" — and rejected the 1024×576 canvas — "go back to the larger size for the videos."
**Canvas lock:** ALL films are 1344×768. No exceptions. L5–L7 masters at 1024×576 are not publishable. The L8 1024 render in flight must be stopped.

---

## 1. Root cause

Four failures stacked:

1. **Canvas shrink.** Lessons 5–7 were rendered at 1024×576 instead of the 1344×768 used for L1–L4. The plaque pipeline was never re-tuned for the smaller frame.
2. **Fixed font size 54.** Plaque PNGs are generated with Pillow at font 54 regardless of line length or canvas width. Font size was chosen for 1344-wide frames and never made canvas-aware.
3. **No width cap.** Nothing in the plaque generator compares plaque width to video width. At 1024×576, 20 of Lesson 7's 49 plaques exceeded 1024 px (max 1270). The ffmpeg overlay `x=(W-w)/2` centers an oversized plaque, so it clips symmetrically on **both** sides — exactly the "cut off" Jonathan saw.
4. **No QA gate.** The assembly script overlays whatever PNGs exist and produces an MP4. A review file went out with 20/49 clipped plaques because no automated check stood between generation and delivery.

Note: returning to 1344×768 does **not** fix this by itself. Lesson 7's widest plaque was 1270 px at font 54 — only 74 px of headroom on a 1344 frame, with zero margin. Any slightly longer line clips again. The width cap and shrink-to-fit below are mandatory even at the full canvas size.

## 2. Normative plaque rules (1344×768 canvas)

These are the only acceptable parameters. Hard-code them as constants in the plaque generator.

| Constant | Value | Rationale |
|---|---|---|
| `CANVAS_W × CANVAS_H` | 1344 × 768 | Locked canvas. |
| `SIDE_MARGIN` | 40 px per side | Visual breathing room; nothing touches the frame edge. |
| `MAX_PLAQUE_W` | **1264 px** (= 1344 − 2×40) | Hard cap on rendered PNG width. |
| `FONT_START` | 54 | Standing "relatively large, easy to read" size — the default, used whenever it fits. |
| `FONT_FLOOR` | **44** | Below this the line is no longer "easy to read" at 1344 wide. Never render smaller. |
| `BOTTOM_MARGIN` | 36 px | Overlay stays `overlay=x=(W-w)/2:y=H-h-36`. |
| Lines per plaque | **1** | Standing rule. Never wrap. Never switch to multi-line ASS. |

**Shrink-to-fit algorithm (the only permitted adaptation):**

```
font = 54
while measured_text_width(line, font) + plaque_padding > 1264:
    font -= 2
    if font < 44:
        raise PlaqueOverflowError(line)   # fail closed — see §3
```

- Measure with Pillow's `draw.textbbox()` / `font.getbbox()` on the **actual font file used for rendering**, including any stroke/outline width and the plaque's internal padding. Measuring bare text and then adding decoration is how off-by-40px clips happen.
- Step by 2 pt; do not binary-search to fractional sizes (Papercraft styling renders poorly at odd sizes).
- If the line cannot fit at font 44, the correct fix is **editing the narration/subtitle text to be shorter** (or splitting it into two sequential plaques aligned to speech, each its own overlay window) — a content decision, not something the renderer silently does. The generator must stop and report the offending line.
- Log every plaque that rendered below 54 (`lesson, plaque #, final font, width`) so shrinks are visible in the build output even when they pass.

Style is otherwise unchanged: one line, Papercraft styling, timed to speech, bottom-center.

## 3. Automated QA gates — must pass before any review MP4 is sent

Add a `qa_plaques` step to the assembly pipeline. **Assembly does not run — and no MP4 is produced or delivered — unless every gate passes.** Exit nonzero on any failure; never warn-and-continue.

**Gate A — per-plaque PNG checks (before overlay):**
1. `png.width <= 1264` for every plaque. Report every violator with lesson, plaque index, width, and the text line.
2. `png.width <= CANVAS_W` is *not* a substitute for A1 — the cap is 1264, not 1344.
3. Recorded final font size `>= 44` and `<= 54`.
4. Subtitle text contains no `\n` and the generator emitted exactly one text line (assert on the generator's own line count, not just the string).
5. `png.height + 36 <= 768` (plaque plus bottom margin fits vertically).

**Gate B — manifest completeness:**
6. Plaque count in the render manifest equals the subtitle-cue count for the lesson (no silently skipped/failed plaques).

**Gate C — master/canvas checks (after assembly, before delivery):**
7. `ffprobe` the output MP4: `width=1344, height=768` exactly. A 1024×576 master fails here no matter what the plaques did.
8. Source footage fed to the overlay is natively 1344×768 — assert on the input stream's dimensions, not just the output's, so an accidental `scale=1344:768` upscale of 1024 footage is caught (see §5).
9. Spot-check frames: extract one frame at the midpoint of each subtitle cue (or minimum 10 evenly sampled cues), and assert the plaque's known bounding box `[(1344−w)/2, 768−h−36] → [(1344+w)/2, 768−36]` lies fully inside the frame using the widths recorded in the manifest. This catches manifest/overlay drift (e.g. stale PNGs from a previous render).

**Gate D — fail-closed wiring:**
10. The QA step is invoked *by* the assembly script (not a separate optional command), and the "send review MP4" step refuses to run without the QA pass artifact (e.g. a `qa-pass.json` stamped with the master's checksum). If the checksum doesn't match the MP4 being sent, refuse.

## 4. Disposition of L5–L7 and L8

- **L5, L6, L7 (1024×576 masters):** scrap the masters. Re-render all source footage at 1344×768 from the original generation pipeline (same shots/prompts/seeds where reproducible). Regenerate **all** plaques under §2 — do not reuse any 1024-era plaque PNGs, even ones that happened to fit; font-54 metrics against the new canvas must be re-measured and re-gated. Then assemble through the full §3 gate. L7's 49 lines are the known stress test: expect some of its 20 former violators to shrink below 54, and expect possibly a few to hit the font-44 floor and require line edits.
- **L8 (1024 render in flight):** stop it now. Kill the running job, quarantine (don't delete yet) any partial 1024 outputs into an `_abandoned-1024/` directory so nothing downstream picks them up, and restart L8 at 1344×768 under §2/§3 from the beginning.
- **L1–L4:** already 1344×768 — no re-render. But before any of them is ever re-sent or re-cut, run their existing plaques through Gate A retroactively to confirm none was silently near the edge.
- Do not send Jonathan any review MP4 for L5–L8 until it has a matching `qa-pass.json`.

## 5. Pitfalls — explicitly forbidden shortcuts

1. **Shrinking until unreadable.** Shrink-to-fit without the font-44 floor "solves" every overflow by making a 200-character line microscopic. The floor exists so overflow surfaces as a content problem (shorten the line) instead of a readability problem Jonathan will reject next.
2. **Wrapping to 2+ lines without being asked.** The standing rule is one line of large Papercraft subtitles. Auto-wrapping (or quietly switching to a multi-line ASS subtitle track) violates it and is a different look Jonathan hasn't approved. If a line can't fit at font 44, that's a stop-and-edit-the-script event, not a wrap event.
3. **Upscaling 1024 picture to 1344.** Re-encoding the existing L5–L7 1024×576 masters with `scale=1344:768` produces the right ffprobe numbers and soft, degraded picture — it would pass a naive Gate C7, which is exactly why Gate C8 asserts on the *input* footage dimensions. The fix is re-rendering at native 1344, never rescaling.
4. **Reusing old plaque PNGs across canvas changes.** A plaque that "fit before" carries no information after a canvas or font-rule change. Plaque PNGs are derived artifacts: regenerate from text + current constants every assembly.
5. **Measuring text without decoration.** Gate A checks the final PNG width precisely because text-metric math (forgetting stroke width, padding, or shadow) is the classic way a "fits by calculation" plaque still clips on screen.
