#!/usr/bin/env python3
"""Lesson 1 v2: papercraft style-card title + large one-line speech-synced plaques."""
from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
L01 = ROOT / "ops/out/lesson-01"
TTS = L01 / "tts"
WORK = L01 / "assemble_v2"
WORK.mkdir(parents=True, exist_ok=True)
PLAQUES = WORK / "plaques"
PLAQUES.mkdir(exist_ok=True)
JAZZ = Path("/home/nvidia/generated/paper-cut-video-instructional-site/public/media/happy-jazz-sample.mp3")
STYLE = L01 / "title/style-card.jpg"
I2V = L01 / "i2v.mp4"
OUT = L01 / "lesson-01-review-v2.mp4"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
W, H = 1344, 768
CREAM = (246, 241, 232, 255)
SLATE = (36, 51, 59, 255)
TEAL = (107, 156, 148, 255)
PAPER = (255, 253, 252, 255)
TITLE_S = 4.0


def run(cmd):
    subprocess.check_call(cmd)


def dur(path: Path) -> float:
    return float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", str(path)],
            text=True,
        ).strip()
    )


def ink_center(draw, font, text, box):
    x0, y0, x1, y1 = box
    l, t, r, b = font.getbbox(text)
    tw, th = r - l, b - t
    x = x0 + (x1 - x0 - tw) / 2 - l
    y = y0 + (y1 - y0 - (t + b)) / 2
    return x, y


def make_title() -> Path:
    src = Image.open(STYLE).convert("RGB")
    src = src.resize((W, H), Image.Resampling.LANCZOS)
    img = src.convert("RGBA")
    draw = ImageDraw.Draw(img)
    fb = ImageFont.truetype(FONT_B, 36)
    ft = ImageFont.truetype(FONT_B, 52)
    # mustard/teal tab for LESSON 01 — upper-middle blank tab
    tab = (520, 268, 820, 338)
    # big cream plate lower right-center
    plate = (430, 455, 1120, 690)
    # paper shadow tabs
    def tab_fill(box, fill):
        x0, y0, x1, y1 = box
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle((x0 + 6, y0 + 8, x1 + 6, y1 + 8), 10, fill=(36, 51, 59, 50))
        img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(4)))
        ImageDraw.Draw(img).rounded_rectangle(box, 10, fill=fill)

    tab_fill((118, 96, 430, 168), TEAL)
    x, y = ink_center(draw, fb, "LESSON 01", (118, 96, 430, 168))
    ImageDraw.Draw(img).text((x, y), "LESSON 01", font=fb, fill=PAPER)

    tab_fill(plate, PAPER)
    ImageDraw.Draw(img).rounded_rectangle(plate, 12, outline=(36, 51, 59, 40), width=2)
    t1 = "The marshmallow test"
    t2 = "the choice"
    mid = (plate[1] + plate[3]) / 2
    x, y = ink_center(draw, ft, t1, (plate[0], plate[1] + 16, plate[2], mid + 8))
    ImageDraw.Draw(img).text((x, y), t1, font=ft, fill=SLATE)
    fs = ImageFont.truetype(FONT_R, 40)
    x, y = ink_center(draw, fs, t2, (plate[0], mid - 8, plate[2], plate[3] - 20))
    ImageDraw.Draw(img).text((x, y), t2, font=fs, fill=TEAL)
    out = WORK / "title-card.png"
    img.convert("RGB").save(out, quality=95)
    return out


def phrases_from_whisper(path: Path):
    data = json.loads(path.read_text())
    words = []
    for seg in data["segments"]:
        for w in seg.get("words") or []:
            tok = w["word"].strip()
            if not tok:
                continue
            words.append({"text": tok, "start": float(w["start"]), "end": float(w["end"])})
    phrases = []
    cur = []

    def flush():
        if not cur:
            return
        phrases.append(
            {
                "text": " ".join(x["text"] for x in cur),
                "start": cur[0]["start"],
                "end": cur[-1]["end"],
            }
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
    x = pad_x - l
    y = (ph - (t + b)) / 2
    draw.text((x, y), text, font=font, fill=SLATE)
    out = PLAQUES / f"p{idx:03d}.png"
    img.save(out)
    return out


def main():
    title_png = make_title()
    phrases = phrases_from_whisper(TTS / "voice.json")
    (WORK / "phrases.json").write_text(json.dumps(phrases, indent=2))
    voice_dur = dur(TTS / "voice.wav")
    plaque_paths = [make_plaque(p["text"], i) for i, p in enumerate(phrases)]

    # title video 4s, gentle push
    title_mp4 = WORK / "title.mp4"
    run(
        [
            "ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", str(title_png),
            "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
            "-vf", "scale=1344:768,zoompan=z='min(1.06,1+0.012*on/24)':d=96:s=1344x768:fps=24",
            "-t", str(TITLE_S), "-r", "24", "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-shortest", str(title_mp4),
        ]
    )

    # looped i2v silent to voice duration
    body_v = WORK / "body_v.mp4"
    i2v_d = dur(I2V)
    loops = int(voice_dur / i2v_d) + 2
    run(
        [
            "ffmpeg", "-y", "-v", "error", "-stream_loop", str(loops), "-i", str(I2V),
            "-an", "-t", f"{voice_dur:.3f}", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "24",
            str(body_v),
        ]
    )

    # overlay plaques — batch in groups of 12 to keep filter graphs sane
    current = body_v
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
            start = TITLE_S + ph["start"]  # not used on body-only overlay
            # body timeline starts at 0 = voice 0
            a, b = ph["start"], max(ph["end"], ph["start"] + 0.35)
            in_idx = j + 1
            out = f"v{j}"
            fc.append(
                f"[{last}][{in_idx}:v]overlay=x=(W-w)/2:y=H-h-36:enable='between(t,{a:.3f},{b:.3f})'[{out}]"
            )
            last = out
        nxt = WORK / f"body_ov_{g:03d}.mp4"
        run(
            [
                "ffmpeg", "-y", "-v", "error", *inputs,
                "-filter_complex", ";".join(fc),
                "-map", f"[{last}]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "24",
                str(nxt),
            ]
        )
        current = nxt

    # mix audio: voice + ducked jazz
    mix = WORK / "mix.wav"
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(TTS / "voice.wav"),
            "-stream_loop", "-1", "-i", str(JAZZ),
            "-filter_complex",
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.16,atrim=0:{voice_dur:.3f},asetpts=PTS-STARTPTS[j];"
            f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[v][side];"
            f"[j][side]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[jd];"
            f"[v][jd]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.97[a]",
            "-map", "[a]", str(mix),
        ]
    )
    full_a = WORK / "full_a.wav"
    run(
        [
            "ffmpeg", "-y", "-v", "error", "-i", str(mix),
            "-filter_complex", f"anullsrc=r=48000:cl=stereo:d={TITLE_S}[s];[s][0:a]concat=n=2:v=0:a=1[a]",
            "-map", "[a]", str(full_a),
        ]
    )

    concat = WORK / "list.txt"
    concat.write_text(f"file '{title_mp4}'\nfile '{current}'\n")
    joined = WORK / "joined.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(joined)])
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(joined), "-i", str(full_a),
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "22",
            "-c:a", "aac", "-b:a", "160k", "-shortest",
            "-movflags", "+faststart", str(OUT),
        ]
    )
    print(OUT, "phrases", len(phrases), "dur", dur(OUT))


if __name__ == "__main__":
    main()
