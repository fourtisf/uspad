"""Extracts the outlines the hwai brand uses from Ma Shan Zheng into glyphs.json, so the logo needs no font file.

Ma Shan Zheng (马善政毛笔楷书) is a brush script by Ma Shan Zheng, SIL Open Font License 1.1
(name table: "Copyright 2018 The MaShanZheng Project Authors (https://github.com/googlefonts/mashanzheng)",
licence URL https://openfontlicense.org). Logo artwork drawn from its outlines is allowed by the OFL; the font
itself isn't redistributed here.

Get the subset from Google Fonts (only these five characters) and run:
  curl -fsS -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&text=%E7%89%9Bhwai"
  # download the url(...) it prints to mz.ttf
  pip install --user fonttools && python3 brand/hwai/src/glyphs.py mz.ttf brand/hwai/src/glyphs.json
Paths are in font units (1000 per em), y up, baseline at 0, as the font draws them.
"""
import json
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
data = {"source": "Ma Shan Zheng, SIL OFL 1.1, via Google Fonts", "upm": font["head"].unitsPerEm, "glyphs": {}}
for ch in "牛hwai":
    g = glyphs[cmap[ord(ch)]]
    pen, bounds = SVGPathPen(glyphs), BoundsPen(glyphs)
    g.draw(pen)
    g.draw(bounds)
    data["glyphs"][ch] = {"adv": g.width, "bounds": [round(v, 1) for v in bounds.bounds], "d": pen.getCommands()}
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print(out, {k: v["adv"] for k, v in data["glyphs"].items()})
