#!/usr/bin/env python3
"""Papercraft one-line plaque renderer + fail-closed width QA.

Jonathan 2026-09-09: L7 rejected — plaques clipped at 1024×576. Canvas back to 1344×768.
One line, large, papercraft. If a line cannot fit at MIN_FONT, FAIL (do not clip, do not wrap).
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SLATE = (36, 51, 59, 255)
TEAL = (107, 156, 148, 255)
PAPER = (255, 253, 252, 255)
MAX_FONT = 54
MIN_FONT = 44  # Fable 2026-09-09: below this is no longer easy to read
SIDE_MARGIN = 40
TAB_W = 14
PAD_X = 28
PAD_Y = 18
MAX_PLAQUE_W = 1264  # 1344 - 2*40; hard cap even on full canvas


def max_plaque_inner_width(canvas_w: int) -> int:
    return int(min(MAX_PLAQUE_W, canvas_w - 2 * SIDE_MARGIN) - TAB_W - PAD_X * 2)


def fit_font(text: str, canvas_w: int) -> ImageFont.FreeTypeFont:
    inner = max_plaque_inner_width(canvas_w)
    for size in range(MAX_FONT, MIN_FONT - 1, -1):
        font = ImageFont.truetype(FONT_B, size)
        l, t, r, b = font.getbbox(text)
        if (r - l) <= inner:
            return font
    raise SystemExit(
        f"PLAQUE_TOO_LONG: {text!r} does not fit one line at {MIN_FONT}px on canvas {canvas_w}"
    )


def make_plaque(text: str, idx: int, out_dir: Path, canvas_w: int) -> Path:
    text = " ".join(text.split())
    font = fit_font(text, canvas_w)
    l, t, r, b = font.getbbox(text)
    tw, th = r - l, b - t
    pw, ph = int(tw + PAD_X * 2 + TAB_W), int(th + PAD_Y * 2)
    if pw > MAX_PLAQUE_W or pw > canvas_w - 2 * SIDE_MARGIN:
        raise SystemExit(f"PLAQUE_CLIP: idx={idx} width {pw} > cap {MAX_PLAQUE_W} text={text!r}")
    img = Image.new("RGBA", (pw + 16, ph + 16), (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((8, 10, 8 + pw, 10 + ph), 18, fill=(36, 51, 59, 55))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(5)))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, pw, ph), 18, fill=PAPER)
    draw.rounded_rectangle((0, 0, TAB_W, ph), 6, fill=TEAL)
    draw.text((TAB_W + PAD_X - l, (ph - (t + b)) / 2), text, font=font, fill=SLATE)
    out_dir.mkdir(parents=True, exist_ok=True)
    p = out_dir / f"p{idx:03d}.png"
    img.save(p)
    return p


def qa_plaques(plaque_dir: Path, canvas_w: int) -> dict:
    rows = []
    bad = []
    for p in sorted(plaque_dir.glob("p*.png")):
        im = Image.open(p)
        w, h = im.size
        clip = w > MAX_PLAQUE_W or w > canvas_w - 2 * SIDE_MARGIN
        rows.append({"file": p.name, "w": w, "h": h, "clip": clip})
        if clip:
            bad.append(p.name)
    report = {
        "canvas_w": canvas_w,
        "n": len(rows),
        "max_w": max((r["w"] for r in rows), default=0),
        "clipped": bad,
        "ok": not bad,
    }
    (plaque_dir / "qa.json").write_text(json.dumps({"report": report, "rows": rows}, indent=2) + "\n")
    if bad:
        raise SystemExit(f"PLAQUE_QA_FAIL canvas={canvas_w} clipped={bad} max_w={report['max_w']}")
    return report
