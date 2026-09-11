#!/usr/bin/env python3
"""Assemble lesson 1 review master: title + looped H3 + Eve TTS + jazz bed + captions."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
L01 = ROOT / "ops/out/lesson-01"
TTS = L01 / "tts"
WORK = L01 / "assemble"
WORK.mkdir(parents=True, exist_ok=True)
JAZZ = Path("/home/nvidia/generated/paper-cut-video-instructional-site/public/media/happy-jazz-sample.mp3")
STILL = L01 / "still-v2-h3.png"
I2V = L01 / "i2v.mp4"
OUT = L01 / "lesson-01-review.mp4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT2 = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def run(cmd: list[str]) -> None:
    subprocess.check_call(cmd)


def dur(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", str(path)],
        text=True,
    ).strip()
    return float(out)


def main() -> None:
    d1, d2 = dur(TTS / "block_01.mp3"), dur(TTS / "block_02.mp3")
    gap = 0.45
    voice_dur = d1 + gap + d2
    title_dur = 3.0
    total = title_dur + voice_dur + 0.8

    # voice concat
    voice = WORK / "voice.wav"
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(TTS / "block_01.mp3"),
            "-i", str(TTS / "block_02.mp3"),
            "-filter_complex",
            f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=pad_dur={gap}[a0];"
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo[a1];"
            f"[a0][a1]concat=n=2:v=0:a=1,alimiter=limit=0.95[a]",
            "-map", "[a]", "-c:a", "pcm_s16le", str(voice),
        ]
    )

    # jazz looped + ducked under voice
    mix = WORK / "mix.wav"
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(voice),
            "-stream_loop", "-1", "-i", str(JAZZ),
            "-filter_complex",
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.18,atrim=0:{voice_dur:.3f},asetpts=PTS-STARTPTS[j];"
            f"[0:a]asplit=2[v][side];"
            f"[j][side]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400:makeup=1[jd];"
            f"[v][jd]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.97[a]",
            "-map", "[a]", "-c:a", "pcm_s16le", str(mix),
        ]
    )

    # title card
    title = WORK / "title.mp4"
    run(
        [
            "ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", str(STILL),
            "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo",
            "-vf",
            "scale=1344:768,"
            f"drawtext=fontfile={FONT}:text='LESSON 01':fontsize=42:fontcolor=0x24333B:"
            "x=(w-text_w)/2:y=h*0.78:shadowcolor=0xFFFDFC:shadowx=1:shadowy=1,"
            f"drawtext=fontfile={FONT}:text='The marshmallow test\\: the choice':fontsize=28:fontcolor=0x24333B:"
            "x=(w-text_w)/2:y=h*0.86:shadowcolor=0xFFFDFC:shadowx=1:shadowy=1",
            "-t", str(title_dur), "-r", "24", "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-shortest", str(title),
        ]
    )

    # loop i2v (strip native audio) to voice duration
    body = WORK / "body.mp4"
    i2v_d = dur(I2V)
    loops = int(voice_dur / i2v_d) + 2
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-stream_loop", str(loops), "-i", str(I2V),
            "-i", str(mix),
            "-t", f"{voice_dur:.3f}",
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "24",
            "-c:a", "aac", "-b:a", "160k",
            str(body),
        ]
    )

    # pad mix for title silence then concat
    full_a = WORK / "full_a.wav"
    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(mix),
            "-filter_complex",
            f"anullsrc=r=48000:cl=stereo:d={title_dur}[s];[s][0:a]concat=n=2:v=0:a=1[a]",
            "-map", "[a]", str(full_a),
        ]
    )

    # ASS captions
    def ts(sec: float) -> str:
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = sec % 60
        return f"{h}:{m:02d}:{s:05.2f}"

    t0 = title_dur
    t1 = title_dur + d1
    t2 = title_dur + d1 + gap
    t3 = title_dur + voice_dur
    txt1 = Path(TTS / "block_01.txt").read_text().strip()
    txt2 = Path(TTS / "block_02.txt").read_text().strip()

    def wrap(text: str, n=90) -> str:
        words = text.split()
        lines, cur = [], ""
        for w in words:
            trial = (cur + " " + w).strip()
            if len(trial) > n and cur:
                lines.append(cur)
                cur = w
            else:
                cur = trial
        if cur:
            lines.append(cur)
        # keep 2-line chunks as separate events of ~2 lines
        events = []
        for i in range(0, len(lines), 2):
            events.append("\\N".join(lines[i : i + 2]))
        return events

    ass = WORK / "captions.ass"
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1344
PlayResY: 768
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,28,&H00FCFDFF,&H000000FF,&H0024333B,&H99000000,-1,0,3,0,0,2,48,48,42,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    # split each block across its duration equally by wrapped pairs
    lines = [header]
    for start, end, text in ((t0, t1, txt1), (t2, t3, txt2)):
        chunks = wrap(text, 78)
        if not chunks:
            continue
        span = (end - start) / len(chunks)
        for i, ch in enumerate(chunks):
            a = start + i * span
            b = start + (i + 1) * span
            safe = ch.replace("{", "\\{")
            lines.append(f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{safe}\n")
    ass.write_text("".join(lines))

    # concat title+body then burn subs + full audio
    concat = WORK / "concat.txt"
    concat.write_text(f"file '{title}'\nfile '{body}'\n")
    joined = WORK / "joined.mp4"
    run(
        [
            "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(concat),
            "-c", "copy", str(joined),
        ]
    )

    run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(joined),
            "-i", str(full_a),
            "-vf", f"ass={ass}",
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "22",
            "-c:a", "aac", "-b:a", "160k", "-shortest",
            "-movflags", "+faststart",
            str(OUT),
        ]
    )
    print(OUT)
    print("duration", dur(OUT))
    print(json.dumps({"title_s": title_dur, "voice_s": voice_dur, "total_s": dur(OUT), "out": str(OUT)}))


if __name__ == "__main__":
    main()
