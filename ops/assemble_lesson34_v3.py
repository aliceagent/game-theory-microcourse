#!/usr/bin/env python3
"""Assemble lesson 34 v3: unique monotonic shots, no picture loop, duration = narration."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import sys
sys.path.insert(0, str(Path("/home/nvidia/generated/game-theory-microcourse/ops")))

from title_card import render_title_card

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
L34 = ROOT / "ops/out/lesson-34"
V3 = L34 / "v3"
TTS = L34 / "tts"
WORK = V3 / "assemble"
WORK.mkdir(parents=True, exist_ok=True)
JAZZ = Path("/home/nvidia/generated/paper-cut-video-instructional-site/public/media/happy-jazz-sample.mp3")
STYLE = L34 / "title/style-card.jpg"
TITLE_PNG = WORK / "title-card.png"
OUT = L34 / "lesson-34-review-v3.mp4"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
W, H = 1344, 768
TITLE_S = 4.0
SLATE = (36, 51, 59, 255)
TEAL = (107, 156, 148, 255)
PAPER = (255, 253, 252, 255)


def run(cmd):
    subprocess.check_call(cmd)


def dur(path: Path) -> float:
    return float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=nk=1:nw=1",
                str(path),
            ],
            text=True,
        ).strip()
    )


def ink_center(font, text, box):
    x0, y0, x1, y1 = box
    l, t, r, b = font.getbbox(text)
    tw, th = r - l, b - t
    x = x0 + (x1 - x0 - tw) / 2 - l
    y = y0 + (y1 - y0 - (t + b)) / 2
    return x, y


def make_title() -> Path:
    return render_title_card(
        STYLE,
        TITLE_PNG,
        34,
        ["Debt cancellation and", "the power of a ruler"],
    )


def phrases_from_whisper(path: Path):
    data = json.loads(path.read_text())
    words = []
    for seg in data["segments"]:
        for w in seg.get("words") or []:
            tok = w["word"].strip()
            if tok:
                words.append({"text": tok, "start": float(w["start"]), "end": float(w["end"])})
    phrases, cur = [], []

    def flush():
        if cur:
            phrases.append(
                {"text": " ".join(x["text"] for x in cur), "start": cur[0]["start"], "end": cur[-1]["end"]}
            )

    for w in words:
        trial = cur + [w]
        line = " ".join(x["text"] for x in trial)
        punct = w["text"].endswith((".", "?", "!", ","))
        if len(line) > 32 or len(trial) >= 6:
            if cur:
                flush()
                cur = [w]
            else:
                cur = trial
                flush()
                cur = []
            continue
        cur.append(w)
        if punct and len(cur) >= 3:
            flush()
            cur = []
    flush()
    return phrases


def make_plaque(text: str, idx: int) -> Path:
    from film_plaques import make_plaque as _mp
    return _mp(text, idx, WORK / "plaques", W)


def unique_body(beats, voice_s: float) -> Path:
    """Concat full unique shots, then trim the tail to voice length. NEVER loop."""
    parts = []
    for ch in beats["chapters"]:
        for beat in ch["beats"]:
            src = V3 / f"shot-{beat['id']:02d}.mp4"
            if not src.exists():
                raise SystemExit(f"missing unique shot {src}")
            silent = WORK / f"v-{beat['id']:02d}.mp4"
            run(
                [
                    "ffmpeg",
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    str(src),
                    "-an",
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    "-r",
                    "24",
                    str(silent),
                ]
            )
            parts.append(silent)
    lst = WORK / "body.txt"
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    body = WORK / "body_unique.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(body)])
    bd = dur(body)
    if bd + 0.08 < voice_s:
        raise SystemExit(f"unique picture {bd:.3f}s < voice {voice_s:.3f}s — refuse to loop")
    if bd > voice_s + 0.05:
        fit = WORK / "body_fit.mp4"
        run(
            [
                "ffmpeg",
                "-y",
                "-v",
                "error",
                "-i",
                str(body),
                "-t",
                f"{voice_s:.4f}",
                "-an",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-r",
                "24",
                str(fit),
            ]
        )
        return fit
    return body


def overlay_plaques(body: Path, phrases) -> Path:
    plaque_paths = [make_plaque(p["text"], i) for i, p in enumerate(phrases)]
    current = body
    group = 12
    for g in range(0, len(phrases), group):
        chunk = list(range(g, min(g + group, len(phrases))))
        inputs = ["-i", str(current)]
        for i in chunk:
            inputs += ["-i", str(plaque_paths[i])]
        fc = []
        last = "0:v"
        for j, i in enumerate(chunk):
            ph = phrases[i]
            a, b = ph["start"], max(ph["end"], ph["start"] + 0.35)
            out = f"v{j}"
            fc.append(
                f"[{last}][{j+1}:v]overlay=x=(W-w)/2:y=H-h-36:enable='between(t,{a:.3f},{b:.3f})'[{out}]"
            )
            last = out
        nxt = WORK / f"ov_{g:03d}.mp4"
        run(
            [
                "ffmpeg",
                "-y",
                "-v",
                "error",
                *inputs,
                "-filter_complex",
                ";".join(fc),
                "-map",
                f"[{last}]",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-r",
                "24",
                str(nxt),
            ]
        )
        current = nxt
    return current


def main():
    if not STYLE.exists():
        raise SystemExit(f"missing title style-card {STYLE}")
    beats = json.loads((V3 / "beats.json").read_text())
    voice_s = dur(TTS / "voice.wav")
    title_png = make_title()
    body = unique_body(beats, voice_s)
    phrases = phrases_from_whisper(TTS / "voice.json")
    (WORK / "phrases.json").write_text(json.dumps(phrases, indent=2))
    pictured = overlay_plaques(body, phrases)
    from film_plaques import qa_plaques
    qa_plaques(WORK / "plaques", W)

    title = WORK / "title.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-loop",
            "1",
            "-i",
            str(title_png),
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=48000:cl=stereo",
            "-vf",
            "scale=1344:768,zoompan=z='1+0.02*on/96':d=96:s=1344x768:fps=24",
            "-t",
            str(TITLE_S),
            "-r",
            "24",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            str(title),
        ]
    )

    mix = WORK / "mix.wav"
    run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(TTS / "voice.wav"),
            "-stream_loop",
            "-1",
            "-i",
            str(JAZZ),
            "-filter_complex",
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.22,atrim=0:{voice_s:.3f},asetpts=PTS-STARTPTS[j];"
            f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[v][side];"
            f"[j][side]sidechaincompress=threshold=0.05:ratio=7:attack=15:release=380[jd];"
            f"[v][jd]amix=inputs=2:weights=1 0.5:duration=first:dropout_transition=0,alimiter=limit=0.95[a]",
            "-map",
            "[a]",
            str(mix),
        ]
    )
    full_a = WORK / "full_a.wav"
    run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-stream_loop",
            "-1",
            "-i",
            str(JAZZ),
            "-i",
            str(mix),
            "-filter_complex",
            f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.22,atrim=0:{TITLE_S:.3f},asetpts=PTS-STARTPTS[tj];"
            "[tj][1:a]concat=n=2:v=0:a=1[a]",
            "-map",
            "[a]",
            str(full_a),
        ]
    )
    p1 = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(full_a),
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    import re

    m1 = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p1.stderr, re.S)
    if not m1:
        raise SystemExit("loudnorm pass1 produced no json")
    meas = json.loads(m1.group(0))
    ln = (
        "loudnorm=I=-16:TP=-1.5:LRA=11"
        f":measured_I={meas['input_i']}:measured_LRA={meas['input_lra']}"
        f":measured_TP={meas['input_tp']}:measured_thresh={meas['input_thresh']}"
        f":offset={meas['target_offset']}:linear=true:print_format=json"
    )
    full_ln = WORK / "full_a_loudnorm.wav"
    p2 = subprocess.run(
        ["ffmpeg", "-y", "-i", str(full_a), "-af", ln, str(full_ln)],
        capture_output=True,
        text=True,
        check=True,
    )
    meas2 = {}
    m2 = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p2.stderr, re.S)
    if m2:
        meas2 = json.loads(m2.group(0))
    (WORK / "loudnorm-lock.json").write_text(json.dumps({"pass1": meas, "pass2": meas2}, indent=2) + "\n")
    concat = WORK / "list.txt"
    concat.write_text(f"file '{title}'\nfile '{pictured}'\n")
    joined = WORK / "joined.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(joined)])
    run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(joined),
            "-i",
            str(full_ln),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "fast",
            "-crf",
            "22",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(OUT),
        ]
    )
    print(OUT, "dur", dur(OUT), "voice", voice_s, "phrases", len(phrases))


if __name__ == "__main__":
    main()
