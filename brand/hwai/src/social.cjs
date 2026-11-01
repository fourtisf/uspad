// hwai.ai share image (the site's opengraph-image.png and twitter-image.png), X profile photo, X header,
// and the PNG icons: mark-512.png, app-icon-512.png, apple-icon-180.png and favicon-32.png.
// Usage (repo root): python3 -I brand/hwai/src/niu.py brand/hwai && node brand/hwai/src/social.cjs brand/hwai
// Design 牛 (owner, 2026-11-01): near black with a faint grid, green and lime glow, the brush-seal mark, and the
// hero line with 美股 on a lime marker stroke, as on the site. Noto Sans SC comes from Google Fonts (network).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const DIR = process.argv[2];
const OUT = path.join(DIR, "social");
fs.mkdirSync(OUT, { recursive: true });
const read = (f) => fs.readFileSync(path.join(DIR, f), "utf8");
const sized = (s, w) => s.replace(/ width="[^"]*" height="[^"]*"/, "").replace("<svg ", `<svg width="${w}" `);

const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;900&display=block">`;
const base = `*{box-sizing:border-box}html,body{margin:0}body{background:#060807;color:#ECF5EF;font-family:"Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.h{font-weight:900;letter-spacing:-.01em;line-height:1.08;margin:0}
.hl{position:relative;color:#061006;padding:0 .1em;z-index:0}
.hl::before{content:"";position:absolute;inset:.1em -.02em .02em;background:#C3FF3C;border-radius:.14em;transform:rotate(-1.5deg);z-index:-1}
.up{color:#2EF08A}`;
const bg = (cx, cy) => `background:radial-gradient(560px 420px at ${cx}px ${cy}px,rgba(46,240,138,.20),transparent 70%),
  radial-gradient(520px 360px at 6% 30%,rgba(195,255,60,.07),transparent 70%),
  linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px) 0 0/100% 48px,
  linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px) 0 0/48px 100%,#060807`;
const seal = (cx, cy, size) => `<div style="position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);filter:drop-shadow(0 30px 50px rgba(0,0,0,.6)) drop-shadow(0 0 40px rgba(195,255,60,.28))">${sized(read("mark.svg"), size)}</div>`;
const line = (size) => `<p class="h" style="font-size:${size}px">土狗也分红，<br>分的是<span class="hl">美股</span><span class="up">↗</span></p>`;

const profile = `<div style="width:1000px;height:1000px;position:relative;overflow:hidden;${bg(500, 470)}">${seal(500, 500, 640)}</div>`;

// X lays the profile photo over the lower left of the header, so the text starts at x = 470.
const header = `<div style="width:1500px;height:500px;position:relative;overflow:hidden;${bg(1290, 250)}">
  ${seal(1300, 250, 250)}
  <div style="position:absolute;left:470px;top:250px;transform:translateY(-50%)">
    ${line(70)}
    <p style="margin:18px 0 0;font-size:24px;font-weight:500;color:#9DB0A6">Memecoins that pay you real stock dividends, every hour.</p>
  </div></div>`;

const og = `<div style="width:1200px;height:630px;position:relative;overflow:hidden;${bg(940, 330)}">
  ${seal(950, 330, 300)}
  <div style="position:absolute;left:72px;top:62px">${sized(read("lockup-dark.svg"), 230)}</div>
  <div style="position:absolute;left:72px;top:196px;width:680px">
    ${line(84)}
    <p style="margin:26px 0 0;font-size:30px;font-weight:700">Memecoins that pay you real stock dividends.</p>
    <p style="margin:10px 0 0;font-weight:500;font-size:22px;color:#9DB0A6">Solana 发币 · 每小时美股分红</p>
  </div></div>`;

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ deviceScaleFactor: 2 });
  const shot = async (html, w, h, file) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<!doctype html><meta charset="utf-8">${FONTS}<style>${base}</style>${html}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: w, height: h } });
  };
  await shot(profile, 1000, 1000, "x-profile-2000.png");
  await shot(header, 1500, 500, "x-header-3000x1000.png");
  await shot(og, 1200, 630, "og-2400x1260.png");
  // 1x copies, scaled down by the browser.
  const down = async (src, w, h, file) => {
    const data = fs.readFileSync(path.join(OUT, src)).toString("base64");
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(`<body style="margin:0"><img src="data:image/png;base64,${data}" style="width:${w}px;height:${h}px;display:block">`);
    await p.screenshot({ path: path.join(OUT, file) });
    await p.close();
  };
  await down("x-profile-2000.png", 1000, 1000, "x-profile-1000.png");
  await down("x-profile-2000.png", 400, 400, "x-profile-400.png");
  await down("x-header-3000x1000.png", 1500, 500, "x-header-1500x500.png");
  await down("og-2400x1260.png", 1200, 630, "og-1200x630.png");
  // Icons, transparent where the SVG is.
  const png = async (svgFile, file, size) => {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(`<style>html,body{margin:0;background:transparent}</style>${sized(read(svgFile), size)}`);
    await p.screenshot({ path: path.join(DIR, file), omitBackground: true });
    await p.close();
  };
  await png("mark.svg", "mark-512.png", 512);
  await png("app-icon.svg", "app-icon-512.png", 512);
  await png("app-icon.svg", "apple-icon-180.png", 180);
  await png("mark.svg", "favicon-32.png", 32);
  await b.close();
})();
