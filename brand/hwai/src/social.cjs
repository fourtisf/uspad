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

// ---------- X profile photo and header (premium, owner 2026-11-01) ----------
// Depth without new motifs: a film grain, a vignette, a grid that fades out, the seal casting a shadow as if
// stamped on the page, and (header) a rising chart drawn like the site's live card, gold dots for the hourly
// payouts. Everything decorative is generated here; nothing is a real price.
const grain = (w, h, op) => `<svg width="${w}" height="${h}" style="position:absolute;inset:0;opacity:${op};mix-blend-mode:overlay;pointer-events:none">
  <filter id="g${w}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="100%" height="100%" filter="url(#g${w})"/></svg>`;
const fadeGrid = (cx, cy, r, cell, op) => `<div style="position:absolute;inset:0;
  background:linear-gradient(rgba(255,255,255,${op}) 1px,transparent 1px) 0 0/100% ${cell}px,linear-gradient(90deg,rgba(255,255,255,${op}) 1px,transparent 1px) 0 0/${cell}px 100%;
  -webkit-mask-image:radial-gradient(${r}px ${r}px at ${cx}px ${cy}px,#000,transparent 75%);mask-image:radial-gradient(${r}px ${r}px at ${cx}px ${cy}px,#000,transparent 75%)"></div>`;
// The seal, stamped: a soft contact shadow under it, a lime bloom behind it.
const stamped = (cx, cy, size) => `
  <div style="position:absolute;left:${cx}px;top:${cy}px;width:${size * 1.5}px;height:${size * 1.5}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(195,255,60,.30),rgba(46,240,138,.10) 55%,transparent)"></div>
  <div style="position:absolute;left:${cx}px;top:${cy + size * 0.42}px;width:${size * 0.9}px;height:${size * 0.16}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.75),transparent);filter:blur(6px)"></div>
  <div style="position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);filter:drop-shadow(0 ${size * 0.05}px ${size * 0.08}px rgba(0,0,0,.55)) drop-shadow(0 0 ${size * 0.12}px rgba(195,255,60,.22))">${sized(read("mark.svg"), size)}</div>`;
const vignette = (op) => `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,${op}))"></div>`;

// A coin's milled edge in gold: a fine ring with ticks, the one gold thing besides the payouts.
const rim = (cx, cy, r) => {
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, r0 = r - (i % 10 === 0 ? 16 : 9);
    ticks += `M${(cx + r0 * Math.cos(a)).toFixed(1)} ${(cy + r0 * Math.sin(a)).toFixed(1)}L${(cx + (r - 3) * Math.cos(a)).toFixed(1)} ${(cy + (r - 3) * Math.sin(a)).toFixed(1)}`;
  }
  return `<svg width="${cx * 2}" height="${cy * 2}" style="position:absolute;left:0;top:0;overflow:visible">
    <defs><linearGradient id="gold${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFC84A"/><stop offset="1" stop-color="#9A6B12"/></linearGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#gold${r})" stroke-opacity=".55" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 24}" fill="none" stroke="url(#gold${r})" stroke-opacity=".22" stroke-width="1.5"/>
    <path d="${ticks}" stroke="url(#gold${r})" stroke-opacity=".38" stroke-width="2" stroke-linecap="round"/></svg>`;
};

// X shows the photo as a circle: the seal sits well inside it, ringed like the rim of a coin.
const profile = `<div style="width:1000px;height:1000px;position:relative;overflow:hidden;background:radial-gradient(700px 700px at 50% 46%,#0F1D15,#070A08 62%,#040605)">
  ${fadeGrid(500, 470, 520, 50, 0.045)}
  ${rim(500, 500, 452)}
  ${stamped(500, 486, 560)}
  ${vignette(0.55)}
  ${grain(1000, 1000, 0.09)}
</div>`;

// A rising market drawn across the banner: an area line that fades in from the left, candles under its last
// stretch, and gold dots where hourly payouts land.
function chart(w, h, x0, seed) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const n = 64;
  const pts = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.3) * 1.0 + (i > n * 0.55 ? 0.35 : 0);
    pts.push(v);
  }
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const X = (i) => x0 + (i / (n - 1)) * (w - x0);
  const Y = (v) => h * 0.86 - ((v - lo) / (hi - lo)) * h * 0.62;
  const d = pts.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join("");
  let candles = "";
  const cw = (w - x0) / n;
  for (let i = Math.floor(n * 0.5); i < n; i++) {
    const o = pts[i - 1], c = pts[i], up = c >= o;
    const top = Y(Math.max(o, c)), bot = Y(Math.min(o, c));
    const col = up ? "#2EF08A" : "#FF4D61";
    candles += `<line x1="${X(i)}" x2="${X(i)}" y1="${top - 6 - rnd() * 8}" y2="${bot + 6 + rnd() * 8}" stroke="${col}" stroke-opacity=".55" stroke-width="1.6"/>`;
    candles += `<rect x="${X(i) - cw * 0.3}" y="${top}" width="${cw * 0.6}" height="${Math.max(2, bot - top)}" rx="1.5" fill="${col}" fill-opacity=".55"/>`;
  }
  let dots = "";
  for (let i = 8; i < n; i += 9) dots += `<circle cx="${X(i)}" cy="${Y(pts[i]) + 26}" r="4.5" fill="#FFC84A" fill-opacity=".9"/>`;
  return `<svg width="${w}" height="${h}" style="position:absolute;inset:0">
    <defs>
      <linearGradient id="ar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2EF08A" stop-opacity=".22"/><stop offset="1" stop-color="#2EF08A" stop-opacity="0"/></linearGradient>
      <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <mask id="mk"><rect width="${w}" height="${h}" fill="url(#fadeL)"/></mask>
      <filter id="glw"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <g mask="url(#mk)">
      <path d="${d}L${w} ${h}L${x0} ${h}Z" fill="url(#ar)"/>
      ${candles}
      <path d="${d}" fill="none" stroke="#2EF08A" stroke-width="5" stroke-opacity=".35" filter="url(#glw)"/>
      <path d="${d}" fill="none" stroke="#2EF08A" stroke-width="2.2"/>
      ${dots}
    </g></svg>`;
}

// X lays the profile photo over the lower left of the header (about x 40 to 375, y 330 down at this size),
// and phones crop the top and bottom a little: the text starts at x = 470 inside the middle band.
const header = `<div style="width:1500px;height:500px;position:relative;overflow:hidden;background:radial-gradient(900px 520px at 78% 40%,#0E1A13,#060807 60%,#040605)">
  ${fadeGrid(1150, 240, 700, 44, 0.04)}
  ${chart(1500, 500, 380, 11)}
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#050706 26%,rgba(5,7,6,.55) 52%,transparent 74%)"></div>
  <div style="position:absolute;left:1300px;top:236px;width:0;height:0">${rim(0, 0, 200).replace('width="0" height="0"', 'width="1" height="1"')}</div>
  ${stamped(1300, 236, 236)}
  <div style="position:absolute;left:470px;top:246px;transform:translateY(-50%)">
    <div style="display:inline-flex;align-items:center;gap:10px;height:34px;padding:0 15px;border-radius:999px;background:rgba(46,240,138,.10);border:1px solid rgba(46,240,138,.35);color:#2EF08A;font-weight:700;font-size:16px;margin-bottom:20px">
      <span style="width:9px;height:9px;border-radius:50%;background:#2EF08A;box-shadow:0 0 0 5px rgba(46,240,138,.18)"></span>Solana · 每小时美股分红</div>
    ${line(66)}
    <p style="margin:18px 0 0;font-size:22px;font-weight:500;color:#9DB0A6">Memecoins that pay you real stock dividends, every hour.</p>
    <div style="display:flex;align-items:center;gap:12px;margin-top:20px">
      <span style="color:#ECF5EF">${sized(read("wordmark-dark.svg"), 74)}</span>
      <span style="width:1px;height:20px;background:#27352E"></span>
      <span style="font-size:18px;font-weight:700;color:#C3FF3C;letter-spacing:.02em">hwai.ai</span>
    </div>
  </div>
  ${vignette(0.5)}
  ${grain(1500, 500, 0.08)}
</div>`;

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
