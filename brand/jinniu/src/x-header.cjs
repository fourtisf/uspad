/**
 * 金牛's X header (owner, 2026-11-04: "buatkan header banner X premium"): 1500 x 500, X's size, and a 2x copy.
 * White like the site. On the right, the mark's brush 牛 large and porcelain-light, with stock tokens on an
 * orbit and a gold arc for the hour; in the middle, the hero line with 美股 marked in gold, the English
 * line and the domain. The bottom left stays empty: X puts the profile photo there.
 *
 *   node brand/jinniu/src/x-header.cjs      → brand/jinniu/social/x-header-1500x500.png and x-header-3000x1000.png
 *
 * Needs Playwright with Chromium and Google Fonts (Noto Sans SC, Inter Tight). The 牛 is the GLYPH outline
 * that mark.cjs writes (Ma Shan Zheng, SIL OFL 1.1); the stock logos are the site's (apps/web/public/stocks).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const GLYPH = fs.readFileSync(path.join(ROOT, "apps/web/src/components/jinniuMark.ts"), "utf8").match(/export const GLYPH = "([^"]+)"/)[1];
const stock = (s) => "data:image/png;base64," + fs.readFileSync(path.join(ROOT, "apps/web/public/stocks", s + ".png")).toString("base64");

// The orbit: an ellipse around the 牛, tilted a little; the tokens sit on it at these angles (degrees).
const O = { cx: 1172, cy: 258, rx: 262, ry: 110, tilt: -12 };
// The xStocks logos as they are (the dark corner marks are part of them).
const TOKENS = [["NVDAx", 214, 66], ["SPYx", 262, 52], ["TSLAx", 322, 60], ["AAPLx", 18, 52], ["GOOGLx", 72, 48], ["QQQx", 128, 56]];
function onOrbit(deg) {
  const a = (deg * Math.PI) / 180, t = (O.tilt * Math.PI) / 180;
  const x = O.rx * Math.cos(a), y = O.ry * Math.sin(a);
  return { x: O.cx + x * Math.cos(t) - y * Math.sin(t), y: O.cy + x * Math.sin(t) + y * Math.cos(t), front: Math.sin(a) > 0 };
}
const tokens = TOKENS.map(([s, deg, size]) => {
  const p = onOrbit(deg);
  return `<img class="tok${p.front ? " front" : ""}" src="${stock(s)}" style="left:${(p.x - size / 2).toFixed(1)}px;top:${(p.y - size / 2).toFixed(1)}px;width:${size}px;height:${size}px" alt="">`;
}).join("");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Noto+Sans+SC:wght@500;700;900&display=block">
<style>
*{box-sizing:border-box;margin:0}
body{width:1500px;height:500px;overflow:hidden;background:#fff;color:#0A0A0A;font-family:"Inter Tight","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.c{position:relative;width:1500px;height:500px;overflow:hidden}
.glow{position:absolute;left:742px;top:-180px;width:860px;height:860px;border-radius:50%;background:radial-gradient(circle,#FFF6DD 0%,rgba(255,246,221,.55) 32%,rgba(255,255,255,0) 66%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(#E6E6E2 1.1px,transparent 1.3px);background-size:22px 22px;
  -webkit-mask-image:radial-gradient(600px 360px at 1172px 250px,#000 0%,rgba(0,0,0,.5) 45%,transparent 75%)}
svg.art{position:absolute;left:0;top:0}
.tok{position:absolute;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #fff,0 0 0 5px #EDEDEA,0 18px 30px -14px rgba(0,0,0,.35)}
.tok:not(.front){filter:saturate(.9)}
.txt{position:absolute;left:430px;top:84px}
.pill{display:inline-flex;align-items:center;gap:10px;height:36px;padding:0 16px;border-radius:999px;background:#FFF8E6;color:#9A6A00;font:700 16px/1 "Noto Sans SC"}
.pill i{width:9px;height:9px;border-radius:50%;background:#FFC21A;box-shadow:0 0 0 4px rgba(255,194,26,.22)}
.pill span{font:600 15px/1 "Inter Tight";color:#B08A2E}
h1{margin-top:22px;font:900 74px/1.1 "Noto Sans SC";letter-spacing:.01em;white-space:nowrap}
h1 em{font-style:normal;background:linear-gradient(transparent 60%,#FFD465 60% 90%,transparent 90%)}
p{margin-top:16px;font:500 24px/1.3 "Inter Tight";color:#5E5C57;white-space:nowrap}
.foot{display:flex;align-items:center;gap:12px;margin-top:22px;font:800 24px/1 "Inter Tight";letter-spacing:-.01em}
.foot i{width:10px;height:10px;border-radius:50%;background:#FFC21A}
.foot span{font:600 17px/1 "Inter Tight";color:#A3A3A3;letter-spacing:0}
</style></head><body><div class="c">
<div class="glow"></div><div class="dots"></div>
<svg class="art" width="1500" height="500" viewBox="0 0 1500 500">
  <defs>
    <linearGradient id="por" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBFBFA"/><stop offset="0.55" stop-color="#EFEFEC"/><stop offset="1" stop-color="#E2E2DE"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFC21A" stop-opacity="0"/><stop offset="0.35" stop-color="#FFC21A"/><stop offset="1" stop-color="#FFB000"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="14"/><feOffset dy="22" result="b"/>
      <feFlood flood-color="#2A2A26" flood-opacity=".14"/><feComposite in2="b" operator="in" result="s"/>
      <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- the orbit, behind the 牛 -->
  <g transform="rotate(${O.tilt} ${O.cx} ${O.cy})">
    <ellipse cx="${O.cx}" cy="${O.cy}" rx="${O.rx}" ry="${O.ry}" fill="none" stroke="#E4E4E0" stroke-width="2"/>
    <ellipse cx="${O.cx}" cy="${O.cy}" rx="${O.rx}" ry="${O.ry}" fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round"
      pathLength="100" stroke-dasharray="34 66" stroke-dashoffset="-58"/>
  </g>
  <!-- the brush 牛, porcelain-light -->
  <g filter="url(#soft)" transform="translate(${O.cx - 100 * 4.1} ${O.cy - 101 * 4.1}) scale(4.1)">
    <path d="${GLYPH}" fill="url(#por)" stroke="#FFFFFF" stroke-width="0.9" stroke-opacity=".9"/>
  </g>
  <!-- the orbit's front half, over the 牛 -->
  <g transform="rotate(${O.tilt} ${O.cx} ${O.cy})">
    <path d="M ${O.cx - O.rx} ${O.cy} A ${O.rx} ${O.ry} 0 0 0 ${O.cx + O.rx} ${O.cy}" fill="none" stroke="#E4E4E0" stroke-width="2"/>
  </g>
</svg>
${tokens}
<div class="txt">
  <div class="pill"><i></i>每小时发放<span>· Paid every hour</span></div>
  <h1>土狗也分红，<br>分的是<em>美股</em></h1>
  <p>Memecoins that pay you real stock dividends</p>
  <div class="foot"><i></i>jinniu.fun<span>on Solana</span></div>
</div>
</div></body></html>`;

(async () => {
  const out = path.join(ROOT, "brand/jinniu/social");
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const [dsf, name] of [[1, "x-header-1500x500.png"], [2, "x-header-3000x1000.png"]]) {
    const p = await b.newPage({ viewport: { width: 1500, height: 500 }, deviceScaleFactor: dsf });
    await p.setContent(html, { waitUntil: "networkidle" });
    await p.evaluate(async () => {
      const t = document.body.innerText;
      await Promise.all(["500", "700", "900"].map((w) => document.fonts.load(`${w} 40px "Noto Sans SC"`, t)));
      await document.fonts.ready;
    });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, name) });
    await p.close();
    console.log("wrote", path.join("brand/jinniu/social", name));
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
