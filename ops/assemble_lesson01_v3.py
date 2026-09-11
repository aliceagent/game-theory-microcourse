#!/usr/bin/env python3
"""Assemble lesson 1 v3: unique monotonic shots, no picture loop, duration = narration."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
L01 = ROOT / "ops/out/lesson-01"
V3 = L01 / "v3"
TTS = L01 / "tts"
WORK = V3 / "assemble"
WORK.mkdir(parents=True, exist_ok=True)
JAZZ = Path("/home/nvidia/generated/paper-cut-video-instructional-site/public/media/happy-jazz-sample.mp3")
TITLE_PNG = L01 / "assemble_v2" / "title-card.png"
OUT = L01 / "lesson-01-review-v3.mp4"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
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
        if len(line) > 38 or len(trial) >= 7:
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
    font = ImageFont.truetype(FONT_B, 54)
    l, t, r, b = font.getbbox(text)
    tw, th = r - l, b - t
    pad_x, pad_y = 36, 22
    pw, ph = int(tw + pad_x * 2), int(th + pad_y * 2)
    img = Image.new("RGBA", (pw + 16, ph + 16), (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((8, 10, 8 + pw, 10 + ph), 18, fill=(36, 51, 59, 55))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(5)))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, pw, ph), 18, fill=PAPER)
    draw.rounded_rectangle((0, 0, 14, ph), 6, fill=TEAL)
    draw.text((pad_x - l, (ph - (t + b)) / 2), text, font=font, fill=SLATE)
    out = WORK / "plaques"
    out.mkdir(exist_ok=True)
    p = out / f"p{idx:03d}.png"
    img.save(p)
    return p


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
    beats = json.loads((V3 / "beats.json").read_text())
    voice_s = dur(TTS / "voice.wav")
    body = unique_body(beats, voice_s)
    phrases = phrases_from_whisper(TTS / "voice.json")
    pictured = overlay_plaques(body, phrases)

    title = WORK / "title.mp4"
    src_title = TITLE_PNG if TITLE_PNG.exists() else V3 / "still-s1-h3.png"
    run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-loop",
            "1",
            "-i",
            str(src_title),
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
    # title still is a unique style card shown once (static title is not a looped clip)

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
            "-i",
            str(mix),
            "-filter_complex",
            f"anullsrc=r=48000:cl=stereo:d={TITLE_S}[s];[s][0:a]concat=n=2:v=0:a=1[a]",
            "-map",
            "[a]",
            str(full_a),
        ]
    )
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
            str(full_a),
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
    print(OUT, "dur", dur(OUT), "voice", voice_s)


if __name__ == "__main__":
    main()
