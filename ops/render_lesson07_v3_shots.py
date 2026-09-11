#!/usr/bin/env python3
"""Render unique non-repeating H3 I2V shots for lesson 7 v3. One GPU at a time."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
V3 = ROOT / "ops/out/lesson-07/v3"
BEATS = json.loads((V3 / "beats.json").read_text())
H3 = "/home/nvidia/bin/h3-native.py"
MAX_CLIP_S = 7.0
USED = V3 / "used-first-frames.json"
GLOBAL_USED = ROOT / "ops/used-first-frames.json"

ANCHORS = {
    "s1": V3 / "still-s1-h3.png",
    "s2": V3 / "still-s2-h3.png",
    "s3": V3 / "still-s3-h3.png",
}


def h3_legal_duration(seconds: float) -> float:
    cap = min(float(seconds), MAX_CLIP_S)
    best = 5.167
    n = 5
    while True:
        d = n / 24.0
        if d > cap + 1e-9:
            break
        if n % 17 == 5:
            best = d
        n += 17
    return round(best, 3)


def sha256(path: Path) -> str:
    import hashlib

    return hashlib.sha256(path.read_bytes()).hexdigest()


def _load_used(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {"used": {}}


def claim_first_frame(path: Path, shot_id: int) -> None:
    h = sha256(path)
    for store_path in (USED, GLOBAL_USED):
        data = _load_used(store_path)
        prev = data["used"].get(h)
        if prev and prev.get("shot") != shot_id:
            raise SystemExit(f"REFUSE: first-frame {path} hash already used for {prev}")
        data["used"][h] = {"shot": shot_id, "path": str(path), "lesson": 2}
        store_path.parent.mkdir(parents=True, exist_ok=True)
        store_path.write_text(json.dumps(data, indent=2) + "\n")


def run(cmd):
    print("+", " ".join(str(c) for c in cmd[:8]), "...")
    subprocess.check_call(cmd)


def last_frame(mp4: Path, png: Path) -> None:
    run(["ffmpeg", "-y", "-v", "error", "-sseof", "-0.05", "-i", str(mp4), "-frames:v", "1", str(png)])


def main():
    prev_last = None
    for ch in BEATS["chapters"]:
        first = True
        for beat in ch["beats"]:
            bid = beat["id"]
            out = V3 / f"shot-{bid:02d}.mp4"
            result = V3 / f"shot-{bid:02d}.json"
            if out.exists() and out.stat().st_size > 10000:
                print("skip existing", out)
                last = V3 / f"shot-{bid:02d}-last.png"
                if not last.exists():
                    last_frame(out, last)
                prev_last = last
                first = False
                continue
            if first:
                first_frame = ANCHORS[ch["anchor"]]
            else:
                if prev_last is None:
                    raise SystemExit(f"missing previous last frame before shot {bid}")
                first_frame = prev_last
            if not first_frame.exists():
                raise SystemExit(f"missing first frame {first_frame}")
            claim_first_frame(first_frame, bid)
            prompt = (
                BEATS["style"]
                + ". "
                + beat["motion"]
                + " No text, no letters, no looping motion, no reverse."
            )
            run(
                [
                    H3,
                    "--mode",
                    "i2v",
                    "--quality",
                    "extra-fast",
                    "--duration",
                    str(h3_legal_duration(beat["h3_s"])),
                    "--resolution",
                    "1344x768",
                    "--first-frame",
                    str(first_frame),
                    "--prompt",
                    prompt,
                    "--audio-mode",
                    "native",
                    "--lock-wait",
                    "300",
                    "--timeout",
                    "1200",
                    "--out",
                    str(out),
                    "--result-json",
                    str(result),
                ]
            )
            last = V3 / f"shot-{bid:02d}-last.png"
            last_frame(out, last)
            prev_last = last
            first = False
            print("done shot", bid)
    print("ALL_SHOTS_DONE")


if __name__ == "__main__":
    main()
