"""hwai brand, design 牛 (owner, 2026-11-01): the character 牛 brushed in a hand-stamped seal (印章), and "hwai" in the
same brush. 牛 is the bull of 牛市, a bull market, and slang for "great". The owner found the earlier geometric
logos "too AI" and picked this one.

Usage (repo root): python3 -I brand/hwai/src/niu.py brand/hwai
Outlines come from glyphs.json (Ma Shan Zheng, SIL OFL 1.1; see glyphs.py), so no font file is needed. The seal's
rough edge is a fixed random wobble (seeded), the same on every run.
"""
import json
import math
import os
import random
import re
import sys

OUT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(os.path.join(HERE, "glyphs.json"), encoding="utf-8"))

BG, LIME, INK, TEXT = "#060807", "#C3FF3C", "#061006", "#ECF5EF"
TILT = -5  # degrees: a stamp is never quite straight


def f(n):
    s = f"{n:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def glyph(ch, scale, x0, baseline):
    """The glyph's outline in SVG units: font units times `scale`, origin at (x0, baseline), y down."""
    out, nums = [], re.findall(r"[MLHVQCZ]|-?\d+(?:\.\d+)?(?:e-?\d+)?", G["glyphs"][ch]["d"])
    cmd, args = None, []

    def flush():
        if cmd is None:
            return
        if cmd in "MLQC":
            pts = [f(x0 + float(args[i]) * scale) + " " + f(baseline - float(args[i + 1]) * scale) for i in range(0, len(args), 2)]
            out.append(cmd + " ".join(pts))
        elif cmd == "H":
            out.append("H" + " ".join(f(x0 + float(a) * scale) for a in args))
        elif cmd == "V":
            out.append("V" + " ".join(f(baseline - float(a) * scale) for a in args))
        elif cmd == "Z":
            out.append("Z")

    for t in nums:
        if t in "MLHVQCZ":
            flush()
            cmd, args = t, []
        else:
            args.append(t)
    flush()
    return "".join(out)


def word(text, scale, x0, baseline, track=10):
    """A row of glyphs; returns (path, right edge)."""
    d, x = "", x0
    for ch in text:
        d += glyph(ch, scale, x, baseline)
        x += (G["glyphs"][ch]["adv"] + track) * scale
    return d, x


def seal_path(x0=8, y0=8, size=84, r=9, amp=1.15, seed=7):
    """A rounded square whose edge wobbles like a hand-stamped seal."""
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 2 * math.pi) for _ in range(4)]
    side = size - 2 * r
    per = 4 * side + 2 * math.pi * r
    n = 260
    pts = []
    for k in range(n):
        s = per * k / n
        # Walk the rounded square: sides and quarter circles, clockwise from the top left straight.
        seg = [side, math.pi * r / 2] * 4
        i, rem = 0, s
        while rem > seg[i]:
            rem -= seg[i]
            i += 1
        q = i // 2
        if i % 2 == 0:  # straight side
            dirs = [(1, 0), (0, 1), (-1, 0), (0, -1)]
            starts = [(x0 + r, y0), (x0 + size, y0 + r), (x0 + size - r, y0 + size), (x0, y0 + size - r)]
            (sx, sy), (dx, dy) = starts[q], dirs[q]
            x, y, nx, ny = sx + dx * rem, sy + dy * rem, dy, -dx
        else:  # corner
            centres = [(x0 + size - r, y0 + r), (x0 + size - r, y0 + size - r), (x0 + r, y0 + size - r), (x0 + r, y0 + r)]
            cx, cy = centres[q]
            a = -math.pi / 2 + q * math.pi / 2 + rem / r
            x, y, nx, ny = cx + r * math.cos(a), cy + r * math.sin(a), math.cos(a), math.sin(a)
        t = 2 * math.pi * s / per
        w = amp * (0.55 * math.sin(7 * t + ph[0]) + 0.3 * math.sin(19 * t + ph[1]) + 0.25 * math.sin(43 * t + ph[2])) + rnd.uniform(-0.28, 0.28) * amp
        if rnd.random() < 0.025:  # the odd nick where the ink didn't take
            w -= amp * 1.6
        pts.append((x + nx * w, y + ny * w))
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z"


def specks(seed=11):
    """A few small spots where the stamp missed, as holes."""
    rnd = random.Random(seed)
    d = ""
    for cx, cy, rr in [(17, 83, 1.6), (85, 22, 1.2), (80, 86, 2.1), (14, 30, 1.0), (52, 89, 1.1), (88, 60, 0.9)]:
        n = 9
        pts = []
        for k in range(n):
            a = 2 * math.pi * k / n
            r = rr * rnd.uniform(0.6, 1.25)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        d += "M" + "L".join(f"{f(x)} {f(y)}" for x, y in reversed(pts)) + "Z"
    return d


SEAL = seal_path() + specks()
_NS = 0.078  # the brushed 牛 fills most of the seal, centred on its bounds (142..858.5 by -120..827 font units)
NIU = glyph("牛", _NS, 50 - 500.25 * _NS, 50 + 353.5 * _NS)


def mark(seal_fill, glyph_fill=None):
    """The seal with 牛 in it, tilted. Without glyph_fill the character is knocked out (one colour)."""
    if glyph_fill is None:
        body = f'<path d="{SEAL}{NIU}" fill="{seal_fill}" fill-rule="evenodd"/>'
    else:
        body = f'<path d="{SEAL}" fill="{seal_fill}" fill-rule="evenodd"/><path d="{NIU}" fill="{glyph_fill}"/>'
    return f'<g transform="rotate({TILT} 50 50)">{body}</g>'


def svg(w, h, body, title="hwai.ai", px=None):
    size = f' width="{f(px)}" height="{f(px * h / w)}"' if px else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}"{size} role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'


# The wordmark: brush "hwai" at 62 units per em next to the 100 unit seal, so the h is about 49 units tall.
WS = 0.062
WORD, WEND = word("hwai", WS, 0, 72)
WTOP, WBOT = 72 - 788 * WS, 72 - 42 * WS


def wordmark(fill):
    pad = 2
    return svg(WEND + 2 * pad, WBOT - WTOP + 2 * pad, f'<path d="{WORD}" fill="{fill}" transform="translate({f(pad)} {f(pad - WTOP)})"/>')


def lockup(seal_fill, glyph_fill, text_fill):
    gap = 16
    w = 100 + gap + WEND
    return svg(w, 100, mark(seal_fill, glyph_fill) + f'<path d="{WORD}" fill="{text_fill}" transform="translate({f(100 + gap)} 0)"/>')


files = {
    "mark.svg": svg(100, 100, mark(LIME, INK), px=512),
    "mark-ink.svg": svg(100, 100, mark(INK, LIME), px=512),  # on light backgrounds
    "mark-mono.svg": svg(100, 100, mark(INK), px=512),  # one colour, 牛 knocked out
    "app-icon.svg": svg(100, 100, f'<rect width="100" height="100" fill="{BG}"/><g transform="translate(11 11) scale(.78)">{mark(LIME, INK)}</g>', px=512),
    "wordmark-dark.svg": wordmark(TEXT),  # on dark backgrounds
    "wordmark-light.svg": wordmark(INK),
    "lockup-dark.svg": lockup(LIME, INK, TEXT),
    "lockup-light.svg": lockup(INK, LIME, INK),
}
for name, body in files.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        fh.write(body)
for old in ("mark-light.svg", "lockup-ai-dark.svg", "lockup-ai-light.svg"):
    p = os.path.join(OUT, old)
    if os.path.exists(p):
        os.remove(p)
# For apps/web/src/components/Mark.tsx: the two paths, in a 100 unit box, before the tilt.
with open(os.path.join(HERE, "mark-paths.json"), "w", encoding="utf-8") as fh:
    json.dump({"tilt": TILT, "seal": SEAL, "niu": NIU, "word": WORD, "wordBox": [0, f(WTOP), f(WEND), f(WBOT - WTOP)]}, fh)
print("wrote", ", ".join(files), "and src/mark-paths.json")
