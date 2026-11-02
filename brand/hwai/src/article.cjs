// Header image for the X article "Meet hwai" (5:2, as X recommends): social/article-meet-hwai-3000x1200.png and a
// 1500 x 600 copy. The copy itself is social/article-meet-hwai.md.
// Usage (repo root): node brand/hwai/src/article.cjs brand/hwai
// Same premium language as the X header: grain, vignette, a fading grid, the seal inside a gold milled ring, a
// rising chart (decorative, not a price) with gold payout dots, and stock tokens floating at three depths.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const DIR = process.argv[2];
const ROOT = path.resolve(DIR, "../..");
const OUT = path.join(DIR, "social");
const read = (f) => fs.readFileSync(path.join(DIR, f), "utf8");
const sized = (s, w) => s.replace(/ width="[^"]*" height="[^"]*"/, "").replace("<svg ", `<svg width="${w}" `);
const stock = (s) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "apps/web/public/stocks", `${s}.png`)).toString("base64")}`;
const W = 1500, H = 600;

function rim(r) {
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, r0 = r - (i % 10 === 0 ? 16 : 9);
    ticks += `M${(r + r0 * Math.cos(a)).toFixed(1)} ${(r + r0 * Math.sin(a)).toFixed(1)}L${(r + (r - 3) * Math.cos(a)).toFixed(1)} ${(r + (r - 3) * Math.sin(a)).toFixed(1)}`;
  }
  return `<svg width="${r * 2}" height="${r * 2}"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFC84A"/><stop offset="1" stop-color="#9A6B12"/></linearGradient></defs>
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="none" stroke="url(#gd)" stroke-opacity=".6" stroke-width="2.5"/>
    <circle cx="${r}" cy="${r}" r="${r - 24}" fill="none" stroke="url(#gd)" stroke-opacity=".22" stroke-width="1.5"/>
    <path d="${ticks}" stroke="url(#gd)" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function chart(x0, seed) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const n = 70, pts = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.32) * 1.0 + (i > n * 0.5 ? 0.3 : 0);
    pts.push(v);
  }
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const X = (i) => x0 + (i / (n - 1)) * (W - x0), Y = (v) => H * 0.88 - ((v - lo) / (hi - lo)) * H * 0.64;
  const d = pts.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join("");
  let dots = "";
  for (let i = 9; i < n; i += 10) dots += `<circle cx="${X(i)}" cy="${Y(pts[i]) + 24}" r="4.5" fill="#FFC84A" fill-opacity=".9"/>`;
  return `<svg width="${W}" height="${H}" style="position:absolute;inset:0"><defs>
    <linearGradient id="ar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2EF08A" stop-opacity=".2"/><stop offset="1" stop-color="#2EF08A" stop-opacity="0"/></linearGradient>
    <linearGradient id="fl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="mk"><rect width="${W}" height="${H}" fill="url(#fl)"/></mask><filter id="gl"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <g mask="url(#mk)"><path d="${d}L${W} ${H}L${x0} ${H}Z" fill="url(#ar)"/>
    <path d="${d}" fill="none" stroke="#2EF08A" stroke-width="5" stroke-opacity=".35" filter="url(#gl)"/><path d="${d}" fill="none" stroke="#2EF08A" stroke-width="2.2"/>${dots}</g></svg>`;
}

// Stock tokens around the seal at three depths: the far ones small, dim and soft.
const tokens = [
  ["NVDAx", 1010, 150, 74, 0],
  ["SPYx", 1385, 120, 58, 1],
  ["TSLAx", 1420, 455, 70, 0],
  ["AAPLx", 985, 470, 52, 2],
  ["QQQx", 1290, 520, 44, 2],
  ["GOOGLx", 1120, 70, 40, 2],
]
  .map(([s, x, y, size, far]) => `<img src="${stock(s)}" style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;transform:translate(-50%,-50%);border-radius:50%;
    opacity:${[1, 0.85, 0.5][far]};filter:blur(${[0, 0.6, 1.6][far]}px);box-shadow:0 0 0 2px rgba(255,255,255,.18),0 14px 30px -10px rgba(0,0,0,.8),0 0 24px -6px rgba(195,255,60,.4)">`)
  .join("");

const SX = 1205, SY = 300; // the seal
const html = `<div style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:radial-gradient(900px 600px at 78% 46%,#0F1C14,#060807 60%,#040605)">
  <div style="position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/100% 44px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/44px 100%;
    -webkit-mask-image:radial-gradient(760px 520px at 72% 46%,#000,transparent 76%)"></div>
  <div style="position:absolute;left:${SX - 420}px;top:${SY - 420}px;width:840px;height:840px;border-radius:50%;background:repeating-conic-gradient(from 8deg,rgba(195,255,60,.09) 0deg 4deg,transparent 4deg 15deg);-webkit-mask-image:radial-gradient(closest-side,#000 12%,transparent 70%)"></div>
  ${chart(420, 23)}
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#050706 30%,rgba(5,7,6,.6) 52%,transparent 70%)"></div>
  <div style="position:absolute;left:${SX}px;top:${SY}px;width:520px;height:520px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(195,255,60,.28),rgba(46,240,138,.08) 55%,transparent)"></div>
  <div style="position:absolute;left:${SX}px;top:${SY}px;transform:translate(-50%,-50%)">${rim(205)}</div>
  ${tokens}
  <div style="position:absolute;left:${SX}px;top:${SY + 100}px;width:210px;height:36px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.75),transparent);filter:blur(6px)"></div>
  <div style="position:absolute;left:${SX}px;top:${SY}px;transform:translate(-50%,-50%);filter:drop-shadow(0 14px 22px rgba(0,0,0,.55)) drop-shadow(0 0 30px rgba(195,255,60,.25))">${sized(read("mark.svg"), 240)}</div>
  <div style="position:absolute;left:96px;top:300px;transform:translateY(-50%)">
    <div style="display:inline-flex;align-items:center;gap:10px;height:36px;padding:0 16px;border-radius:999px;background:rgba(46,240,138,.10);border:1px solid rgba(46,240,138,.35);color:#2EF08A;font-weight:700;font-size:17px;margin-bottom:24px">
      <span style="width:9px;height:9px;border-radius:50%;background:#2EF08A;box-shadow:0 0 0 5px rgba(46,240,138,.18)"></span>Solana · 每小时美股分红</div>
    <div style="display:flex;align-items:center;gap:22px;margin-bottom:18px">
      <span style="font:900 92px/1 'Noto Sans SC';letter-spacing:-.03em;color:#ECF5EF">Meet</span>
      <span style="color:#ECF5EF;margin-top:10px">${sized(read("wordmark-dark.svg"), 210)}</span>
    </div>
    <p style="margin:0;font:900 46px/1.2 'Noto Sans SC';color:#ECF5EF">土狗也分红，分的是<span style="position:relative;color:#061006;padding:0 .1em;z-index:0">美股<span style="position:absolute;inset:.1em -.02em .02em;background:#C3FF3C;border-radius:.14em;transform:rotate(-1.5deg);z-index:-1"></span></span><span style="color:#2EF08A">↗</span></p>
    <p style="margin:16px 0 0;font:500 23px/1.4 'Noto Sans SC';color:#9DB0A6">Memecoins that pay you real stock dividends, every hour.</p>
    <p style="margin:26px 0 0;font:700 19px 'Noto Sans SC';color:#C3FF3C;letter-spacing:.02em">hwai.ai <span style="color:#27352E;margin:0 10px">|</span><span style="color:#9DB0A6">@HwaiPad</span></p>
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5))"></div>
  <svg width="${W}" height="${H}" style="position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay"><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gr)"/></svg>
</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await p.setContent(`<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;900&display=block"><style>html,body{margin:0;background:#060807;font-family:'Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased}</style>${html}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const big = path.join(OUT, "article-meet-hwai-3000x1200.png");
  await p.screenshot({ path: big });
  const s = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await s.setContent(`<body style="margin:0"><img src="data:image/png;base64,${fs.readFileSync(big).toString("base64")}" style="width:${W}px;height:${H}px;display:block">`);
  await s.screenshot({ path: path.join(OUT, "article-meet-hwai-1500x600.png") });
  await b.close();
  console.log(big);
})();
