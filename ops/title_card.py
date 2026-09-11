#!/usr/bin/env python3
"""Packed papercraft title cards: large ExtraBold type, plate hugs the text."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1344, 768
SLATE = (36, 51, 59, 255)
TEAL = (107, 156, 148, 255)
PAPER = (255, 253, 252, 255)
FONT_XB = "/usr/share/fonts/opentype/cantarell/Cantarell-ExtraBold.otf"
FONT_B = "/usr/share/fonts/opentype/cantarell/Cantarell-Bold.otf"
TITLE_SIZE = 80
TITLE_MIN = 64
TAB_SIZE = 48
GAP = 10
PAD_X = 36
PAD_Y = 28
SIDE = 40


def _bbox(font, text):
    l, t, r, b = font.getbbox(text)
    return r - l, b - t, l, t


def _tab_fill(img, box, fill, radius=10):
    x0, y0, x1, y1 = box
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (x0 + 6, y0 + 8, x1 + 6, y1 + 8), radius, fill=(36, 51, 59, 50)
    )
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(4)))
    ImageDraw.Draw(img).rounded_rectangle(box, radius, fill=fill)


def render_title_card(
    style_path: Path,
    out_path: Path,
    lesson_n: int,
    lines: list[str],
    *,
    w: int = W,
    h: int = H,
) -> Path:
    """Draw a cream plate that hugs large ExtraBold title lines. Fail-closed on clip."""
    src = Image.open(style_path).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
    img = src.convert("RGBA")
    max_inner = w - 2 * SIDE - 2 * PAD_X

    size = TITLE_SIZE
    font = None
    measured = []
    while size >= TITLE_MIN:
        font = ImageFont.truetype(FONT_XB, size)
        measured = []
        ok = True
        for text in lines:
            tw, th, _, _ = _bbox(font, text)
            if tw > max_inner:
                ok = False
                break
            measured.append((text, tw, th))
        if ok:
            break
        size -= 2
    else:
        raise SystemExit(f"TITLE_CLIP: lines too wide even at {TITLE_MIN}: {lines!r}")

    block_w = max(tw for _, tw, _ in measured)
    block_h = sum(th for _, _, th in measured) + GAP * (len(lines) - 1)

    plate_w = block_w + 2 * PAD_X
    plate_h = block_h + 2 * PAD_Y
    plate_x0 = max(SIDE, w - SIDE - plate_w)
    # Keep a little air under the LESSON tab.
    plate_y0 = 236
    plate_x1 = plate_x0 + plate_w
    plate_y1 = plate_y0 + plate_h
    if plate_x1 > w - SIDE:
        plate_x0 = SIDE
        plate_x1 = plate_x0 + plate_w
    if plate_y1 > h - 40:
        raise SystemExit(f"TITLE_CLIP: plate height {plate_h} overflows canvas")

    tab_font = ImageFont.truetype(FONT_XB, TAB_SIZE)
    tab_text = f"LESSON {lesson_n}"
    tw, th, _, _ = _bbox(tab_font, tab_text)
    tab = (290, 88, 290 + tw + 48, 88 + th + 36)
    _tab_fill(img, tab, TEAL, radius=10)
    draw = ImageDraw.Draw(img)
    tl, tt, _, _ = tab_font.getbbox(tab_text)
    draw.text(
        (tab[0] + (tab[2] - tab[0] - tw) / 2 - tl, tab[1] + (tab[3] - tab[1] - th) / 2 - tt),
        tab_text,
        font=tab_font,
        fill=PAPER,
    )

    plate = (plate_x0, plate_y0, plate_x1, plate_y1)
    _tab_fill(img, plate, PAPER, radius=18)
    draw.rounded_rectangle(plate, 18, outline=(36, 51, 59, 40), width=2)

    y = plate_y0 + PAD_Y
    for i, (text, tw, th) in enumerate(measured):
        fill = SLATE if i == 0 else TEAL
        l, t, _, _ = font.getbbox(text)
        x = plate_x0 + (plate_w - tw) / 2 - l
        draw.text((x, y - t), text, font=font, fill=fill)
        y += th + GAP

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, quality=95)
    return out_path
