/**
 * The 金牛 mark (owner, 2026-11-02 and 03): the brush 牛 in glossy white, like porcelain, on a soft grey
 * tile ("jangan koin emas, yang putih aja logonya"; "putih aja": white everywhere). The 牛 outline is the
 * brush glyph already in the app (apps/web/src/components/markPaths.ts, NIU: Ma Shan Zheng, SIL OFL 1.1),
 * so no font is needed anywhere.
 *
 * Writes, from the repo root:
 *   brand/jinniu/mark.svg           the mark, rounded tile, with the porcelain bevel and soft shadow
 *   brand/jinniu/mark-square.svg    the same on a full square tile (profile photos, the PlatformConfig picture)
 *   brand/jinniu/mark-small.svg     for 16 to 48 px: a deeper tile, a bolder 牛, a crisp shadow, no filters
 *   brand/jinniu/mark-flat.svg      no filters, for renderers without them (next/og)
 *   brand/jinniu/png/*.png          1024, 512 and 256 px, the square 1024, favicons 16/32/48, apple icon 180
 *   brand/jinniu/sheet.png          the brand sheet
 *   apps/web/src/components/jinniuMark.ts            the 牛 outline placed in the 200 box, and the flat SVG
 *   apps/web/src/app/icon.svg, apple-icon.png        the site's favicon and Apple touch icon
 *   apps/web/public/favicon.png                      the PNG favicon
 *   apps/web/public/brand/jinniu-mark-512.png        the mark for the PlatformConfig picture
 *   apps/web/public/brand/hwai-mark-512.png          the same, at the URL hwai's PlatformConfig points to
 *
 * Run: node brand/jinniu/src/mark.cjs   (needs Playwright with Chromium for the PNGs and the sheet)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.join(ROOT, "brand/jinniu");
const APP = path.join(ROOT, "apps/web");

const src = fs.readFileSync(path.join(APP, "src/components/markPaths.ts"), "utf8");
const NIU = src.match(/export const NIU = "([^"]+)"/)[1];

/** Moves the 100-box outline into the 200 box, `h` tall and centred on (cx, cy). Every number in the
 *  outline is an absolute x, y pair (M, L and Q commands), so they scale and shift in pairs. */
function place(d, h, cx = 100, cy = 100) {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = h / (y1 - y0), tx = cx - ((x0 + x1) / 2) * s, ty = cy - ((y0 + y1) / 2) * s;
  let i = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (m) => {
    const v = Number(m) * s + (i++ % 2 === 0 ? tx : ty);
    return String(Math.round(v * 100) / 100);
  });
}

const GLYPH = place(NIU, 124, 100, 101);
const GLYPH_SMALL = place(NIU, 142, 100, 99);

const TILE = (full, fill) => (full ? `<rect width="200" height="200" fill="${fill}"/>` : `<rect x="4" y="4" width="192" height="192" rx="46" fill="${fill}"/>`);
const HAIRLINE = (full) => (full ? "" : `<rect x="4.5" y="4.5" width="191" height="191" rx="45.5" fill="none" stroke="#000" stroke-opacity=".06"/>`);
const svg = (body, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${size ? ` width="${size}" height="${size}"` : ""}>${body}</svg>`;

/** The porcelain look: a specular bevel lit from the top left, a darker lower edge, a soft lifted shadow. */
const premiumDefs = (p) => `<defs>
<linearGradient id="${p}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F3F1"/><stop offset="1" stop-color="#DADAD6"/></linearGradient>
<linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FAFAFA"/><stop offset="1" stop-color="#E2E2E0"/></linearGradient>
<filter id="${p}p" x="-25%" y="-25%" width="150%" height="150%">
<feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/>
<feSpecularLighting in="b" surfaceScale="4.5" specularConstant=".85" specularExponent="26" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting>
<feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
<feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="eb"/>
<feOffset in="eb" dx="0" dy="1.2" result="eo"/>
<feComposite in="SourceAlpha" in2="eo" operator="out" result="edge"/>
<feFlood flood-color="#000" flood-opacity=".22"/><feComposite in2="edge" operator="in" result="edgeC"/>
<feMerge><feMergeNode in="lit"/><feMergeNode in="edgeC"/></feMerge>
</filter>
<filter id="${p}l" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#2A2A26" flood-opacity=".30"/></filter>
</defs>`;

const premium = (full = false, p = "jn") =>
  svg(`${premiumDefs(p)}${TILE(full, `url(#${p}t)`)}${HAIRLINE(full)}<g filter="url(#${p}l)"><path d="${GLYPH}" fill="url(#${p}g)" filter="url(#${p}p)"/></g>`);

const small = (size) =>
  svg(`<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9D9D5"/><stop offset="1" stop-color="#B9B9B4"/></linearGradient></defs>${TILE(false, "url(#t)")}<path d="${GLYPH_SMALL}" transform="translate(0 6)" fill="#1E1E1B" fill-opacity=".38"/><path d="${GLYPH_SMALL}" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`, size);

const flat = (full = false) =>
  svg(`<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F3F1"/><stop offset="1" stop-color="#D6D6D2"/></linearGradient></defs>${TILE(full, "url(#t)")}<path d="${GLYPH}" transform="translate(0 5)" fill="#2A2A26" fill-opacity=".2"/><path d="${GLYPH}" fill="#fff" stroke="#000" stroke-opacity=".08" stroke-width="1"/>`);

function write(rel, data) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
  console.log("wrote", rel);
}

write("brand/jinniu/mark.svg", premium(false) + "\n");
write("brand/jinniu/mark-square.svg", premium(true) + "\n");
write("brand/jinniu/mark-small.svg", small() + "\n");
write("brand/jinniu/mark-flat.svg", flat(false) + "\n");
write("apps/web/src/app/icon.svg", small(32) + "\n");
write(
  "apps/web/src/components/jinniuMark.ts",
  `/* Generated by brand/jinniu/src/mark.cjs from the brush 牛 in markPaths.ts (Ma Shan Zheng, SIL OFL 1.1). Don't edit. */
/** The 牛 outline in a 200 x 200 box, 124 tall and centred: the glossy white glyph of the mark. */
export const GLYPH = "${GLYPH}";
/** The mark without SVG filters, for renderers that don't have them (next/og): tile, shadow, white 牛. */
export const MARK_FLAT_SVG = ${JSON.stringify(flat(false))};
`,
);

async function render() {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch {
    console.log("Playwright isn't installed: SVGs written, PNGs skipped.");
    return;
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  async function png(svgText, size, rel, opaque = false) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:${opaque ? "#fff" : "transparent"}">${svgText.replace("<svg ", `<svg width="${size}" height="${size}" style="display:block" `)}</body></html>`);
    const f = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    await page.screenshot({ path: f, omitBackground: !opaque, clip: { x: 0, y: 0, width: size, height: size } });
    console.log("wrote", rel);
  }
  await png(premium(false), 1024, "brand/jinniu/png/mark-1024.png");
  await png(premium(false), 512, "brand/jinniu/png/mark-512.png");
  await png(premium(false), 256, "brand/jinniu/png/mark-256.png");
  await png(premium(true), 1024, "brand/jinniu/png/mark-square-1024.png", true);
  await png(premium(true), 180, "brand/jinniu/png/apple-icon-180.png", true);
  for (const s of [16, 32, 48]) await png(small(), s, `brand/jinniu/png/favicon-${s}.png`);
  fs.copyFileSync(path.join(OUT, "png/apple-icon-180.png"), path.join(APP, "src/app/apple-icon.png"));
  fs.copyFileSync(path.join(OUT, "png/favicon-32.png"), path.join(APP, "public/favicon.png"));
  await png(premium(true), 512, "apps/web/public/brand/jinniu-mark-512.png", true);
  fs.copyFileSync(path.join(APP, "public/brand/jinniu-mark-512.png"), path.join(APP, "public/brand/hwai-mark-512.png"));
  console.log("copied the apple icon, the favicon and the PlatformConfig picture into apps/web");

  // the brand sheet
  await page.setViewportSize({ width: 1600, height: 780 });
  const mk = (s, full = false, p) => premium(full, p).replace("<svg ", `<svg width="${s}" height="${s}" style="display:block" `);
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Noto+Sans+SC:wght@500;700;800;900&display=swap">
<style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#0E0E0E;font:16px/1.5 "Inter Tight","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.s{width:1600px;height:780px;padding:56px 64px;display:grid;grid-template-columns:620px 1fr;gap:56px}
.hero{display:grid;place-items:center;border-radius:40px;background:radial-gradient(circle at 50% 38%,#FFFFFF,#F1F1EE 70%);box-shadow:inset 0 0 0 1px #ECECE8}
.r{display:flex;flex-direction:column;gap:22px}
h1{margin:0;font:900 64px/1 "Noto Sans SC";letter-spacing:.04em}h1 small{font:600 20px "Inter Tight";color:#9A968D;letter-spacing:.08em;margin-left:14px}
p{margin:0;color:#5E5C57;font-size:17px;max-width:720px}
.row{display:flex;gap:22px;align-items:center;padding:22px 26px;border-radius:28px;box-shadow:inset 0 0 0 1px #ECECE8}
.lock{display:flex;align-items:center;gap:14px;font:800 30px "Noto Sans SC";letter-spacing:.02em}.lock small{font:600 15px "Inter Tight";color:#9A968D;letter-spacing:.06em}
.btn{margin-left:auto;background:#FFC21A;border-radius:999px;padding:11px 22px;font:700 17px "Noto Sans SC"}
.cap{font:600 12px "Inter Tight";color:#9A968D;text-align:center;margin-top:6px}
.av{width:120px;height:120px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1px #ECECE8}
.sw{display:flex;gap:10px}.sw i{width:120px;height:56px;border-radius:14px;display:flex;align-items:flex-end;padding:8px 10px;font:600 11.5px "Inter Tight";font-style:normal;color:#5E5C57;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
</style></head><body><div class="s">
<div class="hero">${mk(420, false, "a")}</div>
<div class="r">
<h1>金牛<small>jinniu</small></h1>
<p>The brush 牛 in glossy white, like porcelain, on a soft grey tile. 牛 is the bull of 牛市; 金牛 is the golden bull, and 现金牛 a cash cow. White everywhere; gold only for the one button and for what holders are paid.</p>
<div class="row"><span class="lock">${mk(56, false, "b")}金牛<small>jinniu</small></span><span class="btn">创建代币</span></div>
<div class="row">
<div>${mk(120, false, "c")}<div class="cap">App icon</div></div>
<div><div class="av">${mk(120, true, "d")}</div><div class="cap">Profile photo</div></div>
<div>${small(64).replace("<svg ", '<svg style="display:block" ')}<div class="cap">64</div></div>
<div>${small(32).replace("<svg ", '<svg style="display:block;margin:0 auto" ')}<div class="cap">32</div></div>
<div>${small(16).replace("<svg ", '<svg style="display:block;margin:0 auto" ')}<div class="cap">16</div></div>
</div>
<div class="sw"><i style="background:#FFFFFF">#FFFFFF</i><i style="background:linear-gradient(#F3F3F1,#DADAD6)">#F3F3F1 · #DADAD6</i><i style="background:#0E0E0E;color:#fff">#0E0E0E</i><i style="background:#FFC21A">#FFC21A</i><i style="background:#FFF8E6;color:#9A6A00">#9A6A00</i></div>
</div></div></body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "sheet.png") });
  console.log("wrote brand/jinniu/sheet.png");
  await browser.close();
}

render().catch((e) => {
  console.error(e);
  process.exit(1);
});
