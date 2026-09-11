#!/usr/bin/env python3
"""Project-local xAI image/TTS lane. Never calls xAI video. Persists then hashes."""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path("/home/nvidia/generated/game-theory-microcourse")
COST = ROOT / "ops/cost_log.json"
ENV_FILE = Path.home() / ".hermes/.env"
BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1").rstrip("/")
IMAGE_USD = 0.02


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def api_key() -> str:
    key = os.getenv("XAI_API_KEY", "").strip()
    if key:
        return key
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*XAI_API_KEY\s*=\s*(.+?)\s*$", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    sys.exit("missing XAI_API_KEY")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def log_entry(entry: dict) -> None:
    data = json.loads(COST.read_text())
    data.setdefault("entries", []).append(entry)
    if entry.get("usd") is not None:
        data["spent_usd"] = round(float(data.get("spent_usd") or 0) + float(entry["usd"]), 2)
    tmp = COST.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n")
    os.replace(tmp, COST)


def gen_image(prompt: str, out: Path, lesson: int, status: str) -> Path:
    spent = float(json.loads(COST.read_text()).get("spent_usd") or 0)
    if spent + IMAGE_USD > 5.0:
        sys.exit(f"budget cap: spent={spent} + {IMAGE_USD} > 5")
    r = requests.post(
        f"{BASE_URL}/images/generations",
        headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"},
        json={"model": "grok-imagine-image", "prompt": prompt, "n": 1, "response_format": "b64_json"},
        timeout=180,
    )
    r.raise_for_status()
    item = r.json()["data"][0]
    b64 = item.get("b64_json")
    if b64:
        b64 = b64.split(",", 1)[1] if b64.startswith("data:") else b64
        data = base64.b64decode(b64)
    elif item.get("url"):
        img = requests.get(item["url"], timeout=180)
        img.raise_for_status()
        data = img.content
    else:
        sys.exit(f"unexpected image keys: {list(item)}")
    if data[:3] == b"\xff\xd8\xff":
        out = out.with_suffix(".jpg")
    elif data[:8] == b"\x89PNG\r\n\x1a\n":
        out = out.with_suffix(".png")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(data)
    log_entry(
        {
            "ts": now(),
            "modality": "xai_image",
            "model": "grok-imagine-image",
            "lesson": lesson,
            "usd": IMAGE_USD,
            "path": str(out),
            "sha256": sha256(out),
            "status": status,
        }
    )
    print(out)
    return out


def gen_audio(text: str, out: Path, lesson: int) -> Path:
    payload = {"text": text, "voice_id": "eve", "language": "en"}
    if out.suffix.lower() == ".wav":
        payload["output_format"] = {"codec": "wav"}
    r = requests.post(
        f"{BASE_URL}/tts",
        headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    r.raise_for_status()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(r.content)
    log_entry(
        {
            "ts": now(),
            "modality": "xai_tts",
            "model": "xai eve en",
            "lesson": lesson,
            "usd": None,
            "path": str(out),
            "sha256": sha256(out),
            "status": "generated_cost_unknown",
        }
    )
    print(out)
    return out


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    pi = sub.add_parser("image")
    pi.add_argument("--prompt", required=True)
    pi.add_argument("--out", required=True)
    pi.add_argument("--lesson", type=int, required=True)
    pi.add_argument("--status", default="v3_anchor")
    pa = sub.add_parser("audio")
    pa.add_argument("--text-file", required=True)
    pa.add_argument("--out", required=True)
    pa.add_argument("--lesson", type=int, required=True)
    a = p.parse_args()
    if a.cmd == "image":
        gen_image(a.prompt, Path(a.out), a.lesson, a.status)
    else:
        gen_audio(Path(a.text_file).read_text(), Path(a.out), a.lesson)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
