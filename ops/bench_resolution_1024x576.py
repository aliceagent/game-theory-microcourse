#!/usr/bin/env python3
"""Timed extra-fast H3 I2V bench: 1024x576 vs measured 1344x768 production cadence.

Does not spend xAI. Uses a dedicated scaled still (not a production first-frame).
If a GTM renderer or h3-native is live, exit 0 without work.
Runs 3 shots at 1024x576, writes ops/bench/resolution-1024x576.json.
"""
from __future__ import annotations

import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
BENCH = ROOT / "ops/bench"
OUT_JSON = BENCH / "resolution-1024x576.json"
H3 = "/home/nvidia/bin/h3-native.py"
STILL_SRC = ROOT / "ops/out/lesson-03/v3/still-s1.jpg"
STILL = BENCH / "still-1024x576.png"
PROMPT = (
    "papercraft cut-paper diorama, cream background #F6F1E8, slate and teal accents, "
    "soft top light, visible paper fibers. Slow unique camera drift, no loop, no text."
)
BASELINE = {
    "resolution": "1344x768",
    "quality": "extra-fast",
    "duration_s": 5.167,
    "mean_intershot_s": {
        "L1": 290.7,
        "L2": 287.0,
        "L3": 305.3,
        "L4_partial": 298.8,
    },
    "pooled_mean_s": 294.0,
    "n_intervals_approx": 53,
    "source": "mtime deltas of production unique shots 2026-09-09",
}


def busy() -> bool:
    r = subprocess.run(
        ["pgrep", "-f", r"h3-native\.py|game-theory-microcourse/ops/render_lesson.*_shots\.py"],
        capture_output=True,
        text=True,
    )
    return bool((r.stdout or "").strip())


def main() -> int:
    if OUT_JSON.exists():
        print("BENCH_ALREADY", OUT_JSON)
        return 0
    if busy():
        print("BENCH_SKIP_GPU_BUSY")
        return 0
    BENCH.mkdir(parents=True, exist_ok=True)
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-v", "error", "-i", str(STILL_SRC),
            "-vf", "scale=1024:576:force_original_aspect_ratio=decrease,pad=1024:576:(ow-iw)/2:(oh-ih)/2:color=0xF6F1E8",
            str(STILL),
        ]
    )
    runs = []
    for i in range(1, 4):
        out = BENCH / f"shot-{i:02d}.mp4"
        result = BENCH / f"shot-{i:02d}.json"
        t0 = time.perf_counter()
        subprocess.check_call(
            [
                H3, "--mode", "i2v", "--quality", "extra-fast",
                "--duration", "5.167", "--resolution", "1024x576",
                "--first-frame", str(STILL), "--prompt", PROMPT,
                "--audio-mode", "native", "--lock-wait", "300", "--timeout", "1200",
                "--out", str(out), "--result-json", str(result),
            ]
        )
        wall = time.perf_counter() - t0
        meta = json.loads(result.read_text()) if result.exists() else {}
        runs.append({
            "i": i,
            "wall_s": round(wall, 2),
            "out": str(out),
            "width": meta.get("width"),
            "height": meta.get("height"),
            "snapped_duration_s": meta.get("snapped_duration_s"),
            "quality": meta.get("quality"),
        })
        print(f"BENCH_SHOT {i} {wall:.1f}s")
    walls = [r["wall_s"] for r in runs]
    mean = sum(walls) / len(walls)
    report = {
        "at": datetime.now(timezone.utc).isoformat(),
        "candidate": "1024x576",
        "n": len(runs),
        "walls_s": walls,
        "mean_s": round(mean, 1),
        "min_s": min(walls),
        "max_s": max(walls),
        "baseline_1344x768_mean_s": BASELINE["pooled_mean_s"],
        "speedup": round(BASELINE["pooled_mean_s"] / mean, 3) if mean else None,
        "delta_s": round(BASELINE["pooled_mean_s"] - mean, 1),
        "pixel_ratio": 0.571,
        "runs": runs,
        "baseline": BASELINE,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2) + "\n")
    print("BENCH_DONE", json.dumps({k: report[k] for k in ("mean_s", "baseline_1344x768_mean_s", "speedup", "delta_s")}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
