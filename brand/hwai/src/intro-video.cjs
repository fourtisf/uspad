// hwai intro video for X (16:9, 1920 x 1080, 60 fps, H.264), design 牛, premium cut (owner, 2026-11-01):
// a camera that pushes in and moves in 3D, light sweeping across the seal, bokeh with depth, letters that rise
// one by one, numbers that count, zoom-through transitions, floating devices with reflections, a letterbox to
// close. Chinese headlines with the English under them, as on the site. Every fact matches the site's How it
// works page (fees, $10 snapshot floor, 85 SOL graduation, Jito bundles, dev buys shown, locked liquidity);
// the product shots are the approved prototype's demo data and say so on screen.
// Usage (repo root): node brand/hwai/src/intro-video.cjs brand/hwai [--stills <dir> | --bench]
// then:              python3 brand/hwai/src/intro-music.py brand/hwai
// Frames are seeked (Web Animations API for CSS, update(t) for what JS draws), so every frame is exact.
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const DIR = process.argv[2];
const OUT = path.join(DIR, "social", "hwai-intro-1920x1080.mp4");
const ROOT = path.resolve(DIR, "../..");
const read = (f) => fs.readFileSync(path.join(DIR, f), "utf8");
const sized = (svg, w) => svg.replace(/ width="[^"]*" height="[^"]*"/, "").replace("<svg ", `<svg width="${w}" `);
const stock = (s) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "apps/web/public/stocks", `${s}.png`)).toString("base64")}`;
const W = 1920;
const H = 1080;
const FPS = 60;

// Scenes: [start, length] in seconds. 120 BPM, a bar is 2 s; intro-music.py follows these times.
const S = { open: [0, 6], zero: [6, 6], meet: [12, 8], fee: [20, 6], hourly: [26, 6], fair: [32, 6], product: [38, 6], cta: [44, 8] };
const DURATION = S.cta[0] + S.cta[1];
const STAMP = 1.95; // the seal lands (music: impact and gong)
const PAYOUTS = [27.2, 28.8, 30.4]; // hourly scene: a payout lands (music: coin dings)
const LAND = 44.5; // the closing lockup lands
const scene = (k, inner, cls = "") => `<section class="scene ${cls}" style="--s:${S[k][0]}s;--d:${S[k][1]}s"><div class="cam">${inner}</div></section>`;
const at = (o) => `--o:${o}s`;

/** Letters that rise one by one. segs: strings, or [text, class] to style a run, or {html} to drop in as is. */
function kin(segs, o, step = 0.045) {
  let i = 0;
  const one = (c) => (c === " " ? " " : `<span class="ch" style="${at(o + step * i++)}">${c}</span>`);
  return segs
    .map((sg) => {
      if (typeof sg === "string") return [...sg].map(one).join("");
      if (sg.html) {
        const h = `<span class="ch" style="${at(o + step * i)}">${sg.html}</span>`;
        i += 2;
        return h;
      }
      return `<span class="${sg[1]}">${[...sg[0]].map(one).join("")}</span>`;
    })
    .join("");
}
const zh = (segs, top, o, size = 92) => `<p class="center zh" style="top:${top}px;font-size:${size}px">${kin(segs, o)}</p>`;
const en = (t, top, o) => `<p class="center en track" style="top:${top}px;${at(o)}">${t}</p>`;
/** A number that counts up (update() writes it). `at` is absolute time in seconds. */
const cnt = (from, to, dec, atS, dur, pre = "", suf = "") =>
  `<span class="cnt" data-from="${from}" data-to="${to}" data-dec="${dec}" data-at="${atS}" data-dur="${dur}" data-pre="${pre}" data-suf="${suf}">${pre}${from.toFixed(dec)}${suf}</span>`;

const sealSvg = read("mark.svg");
const seal = (size) => sized(sealSvg, size);
const sealMask = `url("data:image/svg+xml;base64,${Buffer.from(sealSvg).toString("base64")}")`;
const word = (w) => sized(read("wordmark-dark.svg"), w);
/** Light sweeping across the seal, clipped to its shape. */
const shine = (size, o) => `<div class="shine" style="width:${size}px;height:${size}px;${at(o)}"></div>`;

// A coin's milled edge in gold (as on the X photo).
function rim(r) {
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, r0 = r - (i % 10 === 0 ? 18 : 10);
    ticks += `M${(r + r0 * Math.cos(a)).toFixed(1)} ${(r + r0 * Math.sin(a)).toFixed(1)}L${(r + (r - 3) * Math.cos(a)).toFixed(1)} ${(r + (r - 3) * Math.sin(a)).toFixed(1)}`;
  }
  return `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}"><defs><linearGradient id="gd${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFC84A"/><stop offset="1" stop-color="#9A6B12"/></linearGradient></defs>
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="none" stroke="url(#gd${r})" stroke-opacity=".65" stroke-width="2.5"/>
    <circle cx="${r}" cy="${r}" r="${r - 26}" fill="none" stroke="url(#gd${r})" stroke-opacity=".22" stroke-width="1.5"/>
    <path d="${ticks}" stroke="url(#gd${r})" stroke-opacity=".42" stroke-width="2" stroke-linecap="round"/></svg>`;
}

// A fixed random source, so the video is the same on every render.
function rand(seed) {
  let r = seed;
  return () => ((r = (r * 9301 + 49297) % 233280) / 233280);
}
// Soft bokeh at three depths, drifting up through the whole video.
function bokeh(n, seed) {
  const rnd = rand(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const depth = rnd(), size = 20 + depth * 150, cols = ["195,255,60", "46,240,138", "255,200,74"], c = cols[Math.floor(rnd() * 3)];
    s += `<i class="bk" style="left:${rnd() * W}px;top:${rnd() * H + 200}px;width:${size}px;height:${size}px;background:radial-gradient(closest-side,rgba(${c},${0.05 + (1 - depth) * 0.1}),transparent);--rise:${120 + depth * 260}px"></i>`;
  }
  return s;
}
// Gold motes drifting up (dividends).
function motes(n, seed, x0, x1, y0, y1) {
  const rnd = rand(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const size = 3 + rnd() * 6;
    s += `<i class="mote" style="left:${x0 + rnd() * (x1 - x0)}px;top:${y0 + rnd() * (y1 - y0)}px;width:${size}px;height:${size}px;${at(rnd() * 3)};--dur:${3 + rnd() * 3}s"></i>`;
  }
  return s;
}
// Ink specks flung out by the stamp.
function specks(n, seed, t) {
  const rnd = rand(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = 180 + rnd() * 320, size = 4 + rnd() * 10;
    s += `<i class="speck" style="width:${size}px;height:${size}px;--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;animation-delay:${t}s"></i>`;
  }
  return s;
}
// God rays: a slow turning fan of light behind something.
const rays = (x, y, size, o) => `<div class="rays" style="left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;${at(o)}"></div>`;

// Scene 3: the six featured stocks orbit the seal on a tilted ring (update() places them).
const orbit = ["NVDAx", "SPYx", "TSLAx", "AAPLx", "QQQx", "GOOGLx"]
  .map((s, i) => `<div class="orb" data-a="${(i / 6) * Math.PI * 2}"><div class="pop2" style="${at(0.4 + i * 0.1)}"><img src="${stock(s)}"><span>${s}</span></div></div>`)
  .join("");

// Scene 4: the 1.25% on the curve, as the site splits it. Widths out of 1400 px.
const split = [
  [0.5, "持有人", "holders", 560, "linear-gradient(180deg,#E2FF7A,#C3FF3C 55%,#9BD62A)", "#C3FF3C"],
  [0.15, "创建者", "creator", 168, "linear-gradient(180deg,#2BD17E,#13B864 55%,#0E8E4D)", "#ECF5EF"],
  [0.35, "hwai", "", 392, "linear-gradient(180deg,#FFE7A8,#FFC84A 55%,#D49A22)", "#FFC84A"],
  [0.25, "Raydium", "", 280, "linear-gradient(180deg,#34453C,#27352E 55%,#1C2622)", "#ECF5EF"],
];
let x = 0;
const segs = [], labels = [];
split.forEach(([v, who, sub, w, bg, col], i) => {
  const t0 = S.fee[0] + 1.1 + i * 0.4;
  segs.push(`<div class="seg" style="left:${x}px;width:${w}px;background:${bg};${at(1.1 + i * 0.4)}"></div>`);
  labels.push(`<div class="segl rise" style="left:${x}px;width:${w}px;${at(1.3 + i * 0.4)}"><b style="color:${col}">${cnt(0, v, 2, t0 + 0.2, 0.9, "", "%")}</b><span>${who}</span>${sub ? `<small>${sub}</small>` : ""}</div>`);
  x += w;
});

// Scene 5: three payouts land in a wallet (update() flies the coins and adds up the balance).
const nvda = stock("NVDAx");
const AMOUNTS = [0.0213, 0.0391, 0.0127];
const rows = PAYOUTS.map((t, i) => {
  const h = ["14:00", "15:00", "16:00"][i];
  return `<div class="row rise" style="${at(t - S.hourly[0] + 0.45)}"><img src="${nvda}"><div><b>NVDAx</b><span>${h} 这一轮 · round</span></div><em>+${AMOUNTS[i]}</em><i class="ok">已到账</i></div>`;
}).join("");
const flyers = PAYOUTS.map((t) => `<img class="fly" data-t="${t}" src="${nvda}">`).join("");

// Scene 6: fair from the first block.
const icon = {
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
};
const cards = [
  ["shield", "0 号区块无狙击", "No snipers in block 0", "每个代币都用 Jito 私有捆绑创建，上链前没人知道合约地址。"],
  ["eye", "开发者首买公开", "Dev buys shown", "首买包含在创建交易里，每个代币页面都公开显示。"],
  ["lock", "流动性永久锁定", "Liquidity locked for good", "满 85 SOL 毕业进入 Raydium，流动性通过 Burn & Earn 永久锁定。"],
]
  .map(
    ([ic, t, e, d], k) =>
      `<div class="card flip" style="${at(0.7 + k * 0.35)}"><span class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#061006" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${icon[ic]}</svg></span><b>${t}</b><em>${e}</em><p>${d}</p><i class="sweep2" style="${at(1.4 + k * 0.35)}"></i></div>`,
  )
  .join("");

const css = (shots) => `
*{box-sizing:border-box}html,body{margin:0;background:#060807}
body{font-family:"Noto Sans SC",sans-serif;color:#ECF5EF;-webkit-font-smoothing:antialiased}
.stage{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:radial-gradient(1300px 900px at 50% 42%,#0D1711,#060807 62%,#030504)}
.shake{position:absolute;inset:0;animation:shake .5s linear ${STAMP}s both,shake .5s linear ${LAND}s}
@keyframes shake{0%{transform:none}12%{transform:translate(-11px,7px)}26%{transform:translate(9px,-6px)}40%{transform:translate(-6px,-5px)}56%{transform:translate(4px,3px)}75%{transform:translate(-2px,1px)}100%{transform:none}}
.grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px) 0 0/100% 64px,linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px) 0 0/64px 100%;
  -webkit-mask-image:radial-gradient(1000px 640px at 50% 45%,#000,transparent 78%);animation:gridpan ${DURATION}s linear both}
@keyframes gridpan{to{background-position:0 128px,128px 0}}
.glow{position:absolute;width:1600px;height:1200px;left:160px;top:-80px;background:radial-gradient(closest-side,rgba(46,240,138,.15),transparent);animation:drift ${DURATION}s ease-in-out both}
@keyframes drift{0%{transform:translate(-220px,-40px)}35%{transform:translate(200px,60px)}70%{transform:translate(-120px,40px)}100%{transform:translate(0,0)}}
.bk{position:absolute;border-radius:50%;animation:bk ${DURATION}s linear both}
@keyframes bk{to{transform:translateY(calc(var(--rise) * -1))}}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.66));pointer-events:none}
.grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:overlay;pointer-events:none}
.lb{position:absolute;left:0;right:0;height:96px;background:#000;z-index:90}
.lb.t{top:0;animation:lbT 1.2s cubic-bezier(.7,0,.2,1) ${S.cta[0] + 0.2}s both}.lb.b{bottom:0;animation:lbB 1.2s cubic-bezier(.7,0,.2,1) ${S.cta[0] + 0.2}s both}
@keyframes lbT{from{transform:translateY(-100%)}to{transform:none}}@keyframes lbB{from{transform:translateY(100%)}to{transform:none}}
/* scenes: zoom-through in and out, and a camera that keeps pushing in */
.scene{position:absolute;inset:0;opacity:0;animation:sc var(--d) linear var(--s) both}
@keyframes sc{0%{opacity:0;transform:scale(1.16);filter:blur(18px)}7%{opacity:1;transform:scale(1);filter:none}93%{opacity:1;transform:scale(1);filter:none}100%{opacity:0;transform:scale(.9);filter:blur(14px)}}
.scene.last{animation-name:scLast}
@keyframes scLast{0%{opacity:0;transform:scale(1.16);filter:blur(18px)}6%{opacity:1;transform:scale(1);filter:none}100%{opacity:1;transform:scale(1);filter:none}}
.cam{position:absolute;inset:0;animation:push var(--d) cubic-bezier(.3,0,.7,1) var(--s) both;perspective:1600px}
@keyframes push{from{transform:scale(1) translateY(6px)}to{transform:scale(1.06) translateY(-6px)}}
.center{position:absolute;left:0;right:0;text-align:center;margin:0}
.zh{font-weight:900;letter-spacing:-.01em;line-height:1.14;perspective:800px}
.ch{display:inline-block;animation:charUp 1s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o)) both;transform-origin:50% 100%}
@keyframes charUp{from{opacity:0;transform:translateY(.55em) rotateX(-75deg);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}
.en{font-weight:500;font-size:34px;color:#9DB0A6}
.track{animation:track 1.4s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o)) both}
@keyframes track{from{opacity:0;letter-spacing:.42em;filter:blur(6px)}to{opacity:1;letter-spacing:.01em;filter:none}}
.rise{animation:rise 1s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o,0s)) both}
@keyframes rise{from{opacity:0;transform:translateY(40px);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
.hl{position:relative;color:#061006;padding:0 .1em;z-index:0;white-space:nowrap;display:inline-block}
.hl::before{content:"";position:absolute;inset:.1em -.02em .02em;background:#C3FF3C;border-radius:.14em;transform:rotate(-1.5deg) scaleX(0);transform-origin:left;z-index:-1;animation:mark .7s cubic-bezier(.7,0,.2,1) calc(var(--s) + var(--hlo,.8s)) both;box-shadow:0 0 40px rgba(195,255,60,.35)}
@keyframes mark{to{transform:rotate(-1.5deg) scaleX(1)}}
.up{color:#2EF08A}.gold{color:#FFC84A}.lime{color:#C3FF3C}
.mono{font-family:"JetBrains Mono",monospace;font-variant-numeric:tabular-nums}
.pill{display:inline-flex;align-items:center;gap:12px;height:54px;padding:0 26px;border-radius:999px;background:rgba(46,240,138,.1);border:1px solid rgba(46,240,138,.35);color:#2EF08A;font-weight:700;font-size:24px}
.pill i{width:12px;height:12px;border-radius:50%;background:#2EF08A;box-shadow:0 0 0 7px rgba(46,240,138,.18)}
.rays{position:absolute;border-radius:50%;opacity:0;
  background:repeating-conic-gradient(from 0deg,rgba(195,255,60,.11) 0deg 4deg,transparent 4deg 15deg);
  -webkit-mask-image:radial-gradient(closest-side,#000 10%,transparent 72%);animation:raysIn 1.6s ease calc(var(--s) + var(--o)) both,raysSpin 40s linear 0s infinite}
@keyframes raysIn{to{opacity:1}}@keyframes raysSpin{from{rotate:0deg}to{rotate:360deg}}
.shine{position:absolute;left:0;top:0;transform:translate(-50%,-50%);pointer-events:none;-webkit-mask:${sealMask} center/contain no-repeat;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.75) 48%,rgba(255,255,255,0) 60%) no-repeat;background-size:300% 100%;background-position:120% 0;
  mix-blend-mode:soft-light;animation:sh 1.3s cubic-bezier(.5,0,.3,1) calc(var(--s) + var(--o)) both}
@keyframes sh{to{background-position:-20% 0}}
/* scene 1 */
.hero{position:absolute;left:960px;top:340px;perspective:1200px}
.seal3d{position:absolute;left:0;top:0;animation:sealIn 2s cubic-bezier(.2,.8,.2,1) .55s both;filter:drop-shadow(0 34px 60px rgba(0,0,0,.65)) drop-shadow(0 0 60px rgba(195,255,60,.3))}
@keyframes sealIn{0%{opacity:0;transform:translate(-50%,-50%) rotateY(78deg) rotateX(24deg) scale(1.7)}70%{opacity:1;transform:translate(-50%,-50%) rotateY(0) rotateX(0) scale(.93)}85%{transform:translate(-50%,-50%) scale(1.035)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.burst{position:absolute;left:0;top:0;width:340px;height:340px;border-radius:50%;border:3px solid rgba(195,255,60,.75);animation:burst 1.2s cubic-bezier(.16,1,.3,1) ${STAMP}s both}
.burst.b2{border-color:rgba(255,200,74,.55);animation-delay:${STAMP + 0.1}s}
@keyframes burst{from{opacity:.95;transform:translate(-50%,-50%) scale(.6)}to{opacity:0;transform:translate(-50%,-50%) scale(2.9)}}
.flash{position:absolute;left:960px;top:340px;width:900px;height:900px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(214,255,79,.35),transparent);opacity:0;animation:flash .9s ease-out ${STAMP}s both}
@keyframes flash{0%{opacity:0}10%{opacity:1}100%{opacity:0}}
.speck{position:absolute;left:0;top:0;border-radius:40%;background:#C3FF3C;opacity:0;animation:speck .9s cubic-bezier(.1,.8,.3,1) both}
@keyframes speck{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.4)}}
.wipe{position:absolute;left:960px;top:575px;transform:translateX(-50%);animation:wipe 1.1s cubic-bezier(.6,0,.2,1) 2.55s both}
@keyframes wipe{from{clip-path:inset(0 100% 0 0);filter:blur(8px)}to{clip-path:inset(0 0 0 0);filter:none}}
/* scene 2 */
.zero{position:absolute;left:0;right:0;top:330px;text-align:center;font:700 260px/1 "JetBrains Mono",monospace;color:#1A2420;letter-spacing:-.04em;
  transform:rotateX(16deg);animation:zeroIn 1.4s cubic-bezier(.16,1,.3,1) calc(var(--s) + .2s) both,recede 3.6s linear calc(var(--s) + 1.6s) both}
@keyframes zeroIn{from{opacity:0;transform:rotateX(60deg) translateY(80px);filter:blur(12px)}to{opacity:1;transform:rotateX(16deg);filter:none}}
@keyframes recede{to{transform:rotateX(16deg) translateZ(-260px)}}
.flat{position:absolute;left:560px;top:640px;width:800px;height:4px;background:#27352E;transform-origin:left;animation:draw 1.2s cubic-bezier(.7,0,.2,1) calc(var(--s) + 1s) both}
@keyframes draw{from{transform:scaleX(0)}}
.ph1{position:absolute;inset:0;perspective:1200px;animation:fadeOut .6s ease calc(var(--s) + 3.5s) forwards}
@keyframes fadeOut{to{opacity:0;filter:blur(10px);transform:scale(.96)}}
.streak{position:absolute;left:960px;top:500px;width:1400px;height:6px;transform:translate(-50%,-50%) scaleX(0);border-radius:50%;background:radial-gradient(closest-side,rgba(214,255,79,.9),rgba(195,255,60,.2) 60%,transparent);animation:streak 1.4s cubic-bezier(.16,1,.3,1) calc(var(--s) + 4s) both}
@keyframes streak{0%{transform:translate(-50%,-50%) scaleX(0);opacity:0}30%{opacity:1}100%{transform:translate(-50%,-50%) scaleX(1);opacity:0}}
/* scene 3 */
.orb{position:absolute;left:0;top:0;will-change:transform}
.orb img{width:104px;height:104px;border-radius:50%;display:block;box-shadow:0 0 0 2px rgba(255,255,255,.2),0 18px 40px -12px rgba(0,0,0,.85),0 0 30px -6px rgba(195,255,60,.45)}
.orb span{display:block;text-align:center;margin-top:10px;font:700 19px "JetBrains Mono",monospace;color:#FFC84A}
.pop2{animation:pop2 .8s cubic-bezier(.34,1.56,.64,1) calc(var(--s) + var(--o)) both}
@keyframes pop2{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:none}}
.core{position:absolute;left:960px;top:420px;z-index:20}
.core>*{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
.float{animation:float 4s ease-in-out calc(var(--s)) infinite}
@keyframes float{50%{translate:0 -12px}}
.spin{animation:spin 20s linear 0s infinite}.spin svg{display:block}
@keyframes spin{to{rotate:360deg}}
.mote{position:absolute;border-radius:50%;background:#FFC84A;box-shadow:0 0 12px rgba(255,200,74,.8);opacity:0;animation:mote var(--dur) ease-out calc(var(--s) + var(--o)) infinite}
@keyframes mote{0%{opacity:0;transform:translateY(0)}20%{opacity:.9}100%{opacity:0;transform:translateY(-280px)}}
.ring3d{position:absolute;left:960px;top:420px;width:880px;height:250px;transform:translate(-50%,-50%);border-radius:50%;border:1.5px solid rgba(195,255,60,.16);z-index:10}
/* scene 4 */
.bar3d{position:absolute;left:260px;top:470px;width:1400px;height:110px;transform:rotateX(24deg);transform-style:preserve-3d}
.bar{position:absolute;inset:0;border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px #27352E,0 16px 0 #0A0F0C,0 40px 60px -20px rgba(0,0,0,.9)}
.seg{position:absolute;top:0;height:110px;transform-origin:left center;animation:seg .6s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o)) both}
@keyframes seg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.bar::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 40%,rgba(255,255,255,.45) 50%,transparent 60%) no-repeat;background-size:250% 100%;background-position:130% 0;mix-blend-mode:soft-light;animation:sh 1.2s ease calc(var(--s) + 3.1s) both}
.labels{position:absolute;left:260px;top:640px;width:1400px}
.segl{position:absolute;top:0;display:flex;flex-direction:column;gap:4px;padding-left:4px}
.segl b{font:700 46px "JetBrains Mono",monospace;letter-spacing:-.02em}.segl span{font-size:24px;color:#ECF5EF;white-space:nowrap}.segl small{font-size:19px;color:#64776D}
/* scene 5 */
.dial{position:absolute;left:255px;top:345px;width:430px;height:430px}
.ringp{position:absolute;inset:0;border-radius:50%;--p:0;background:conic-gradient(from -90deg,#FFC84A calc(var(--p) * 360deg),rgba(255,200,74,.12) 0);
  -webkit-mask:radial-gradient(closest-side,transparent 82%,#000 83%,#000 96%,transparent 97%)}
.dial .face{position:absolute;inset:34px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#16211B,#0B110E);border:1px solid #27352E;display:grid;place-items:center;align-content:center;gap:6px;box-shadow:inset 0 0 60px rgba(0,0,0,.6)}
.dial .face b{font:700 92px/1 "JetBrains Mono",monospace;color:#FFC84A}.dial .face span{font-size:24px;color:#9DB0A6}
.dial .pulse{position:absolute;inset:0;border-radius:50%;border:3px solid rgba(255,200,74,.7);opacity:0}
.wallet-wrap{position:absolute;left:880px;top:260px;width:820px;perspective:1400px}
.wallet{padding:30px 34px;border-radius:28px;background:linear-gradient(160deg,rgba(26,36,32,.92),rgba(12,17,14,.92));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px #27352E,0 50px 100px -40px rgba(0,0,0,.95);transform:rotateY(-10deg) rotateX(4deg);transform-origin:left center}
.wallet h3{margin:0;font-size:26px;font-weight:700;display:flex;justify-content:space-between;color:#9DB0A6}.wallet h3 small{font-size:19px;color:#64776D;font-weight:500}
.bal{display:block;font:700 76px/1.15 "JetBrains Mono",monospace;color:#FFC84A;margin:8px 0 6px;text-shadow:0 0 30px rgba(255,200,74,.35)}
.bal small{font-size:30px;color:#9DB0A6;margin-left:12px}
.row{display:flex;align-items:center;gap:18px;padding:14px 18px;border-radius:16px;background:rgba(255,200,74,.06);border:1px solid rgba(255,200,74,.24);margin-top:12px}
.row img{width:50px;height:50px;border-radius:50%}.row div{flex:1}.row b{display:block;font-size:24px}.row span{font-size:19px;color:#9DB0A6}
.row em{font:700 26px "JetBrains Mono",monospace;font-style:normal;color:#FFC84A}
.row .ok{font-style:normal;font-size:18px;font-weight:700;color:#061006;background:#2EF08A;padding:6px 12px;border-radius:999px}
.fly{position:absolute;left:0;top:0;width:64px;height:64px;border-radius:50%;opacity:0;box-shadow:0 0 30px rgba(255,200,74,.8);z-index:40}
/* scene 6 */
.cards{position:absolute;left:150px;right:150px;top:420px;display:flex;gap:36px;perspective:1400px}
.card{flex:1;padding:38px 34px;border-radius:28px;background:linear-gradient(160deg,rgba(26,36,32,.95),rgba(12,17,14,.95));box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 0 0 1px #1D2823,0 40px 80px -40px rgba(0,0,0,.9);position:relative;overflow:hidden}
.card::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,#13B864,#C3FF3C)}
.flip{animation:flip 1.1s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o)) both;transform-origin:50% 50%}
@keyframes flip{from{opacity:0;transform:rotateY(-80deg) translateZ(-200px)}to{opacity:1;transform:none}}
.card .ic{display:grid;place-items:center;width:66px;height:66px;border-radius:18px;background:#C3FF3C;box-shadow:0 0 30px rgba(195,255,60,.35)}
.card b{display:block;font-size:40px;font-weight:900;margin:24px 0 4px}.card em{display:block;font-style:normal;font-size:22px;color:#2EF08A;font-weight:700;margin-bottom:14px}
.card p{margin:0;font-size:24px;line-height:1.6;color:#9DB0A6}
.sweep2{position:absolute;inset:0;background:linear-gradient(100deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%) no-repeat;background-size:250% 100%;background-position:130% 0;animation:sh 1.1s ease calc(var(--s) + var(--o)) both}
/* scene 7 */
.devices{position:absolute;inset:0;perspective:2000px}
.laptop{position:absolute;left:140px;top:270px;width:1200px;height:740px;border-radius:22px;overflow:hidden;background:#0B0F0D;box-shadow:0 0 0 1px #27352E,0 60px 120px -40px rgba(0,0,0,.95);
  -webkit-box-reflect:below 14px linear-gradient(transparent 72%,rgba(255,255,255,.13));transform-origin:50% 50%;animation:lapIn 1.4s cubic-bezier(.16,1,.3,1) calc(var(--s) + .3s) both,lapTurn 5.6s linear calc(var(--s) + .3s) both}
@keyframes lapIn{from{opacity:0;translate:0 80px}to{opacity:1;translate:0 0}}
@keyframes lapTurn{from{transform:rotateY(22deg) rotateX(8deg)}to{transform:rotateY(10deg) rotateX(4deg)}}
.chrome{height:46px;display:flex;align-items:center;gap:9px;padding:0 18px;background:#0F1512;border-bottom:1px solid #1D2823}
.chrome i{width:12px;height:12px;border-radius:50%;background:#27352E}
.chrome span{margin-left:16px;flex:1;max-width:420px;height:28px;border-radius:8px;background:#060807;border:1px solid #1D2823;color:#9DB0A6;font:500 15px "JetBrains Mono",monospace;display:flex;align-items:center;padding:0 12px}
.view{position:absolute;left:0;right:0;top:46px;bottom:0;overflow:hidden}
.shot{position:absolute;left:0;top:0;width:1200px;background-size:1200px auto;background-repeat:no-repeat;height:1700px}
.s1{background-image:url(${shots.home});animation:kb1 5.6s cubic-bezier(.4,0,.6,1) var(--s) both}
@keyframes kb1{from{transform:translateY(0)}to{transform:translateY(-330px)}}
.s2{background-image:url(${shots.coin});opacity:0;animation:fadein .7s linear calc(var(--s) + 3.2s) both,kb2 2.8s linear calc(var(--s) + 3.2s) both}
@keyframes fadein{to{opacity:1}}
@keyframes kb2{from{transform:translateY(0)}to{transform:translateY(-80px)}}
.phone{position:absolute;left:1420px;top:220px;width:380px;height:780px;border-radius:46px;border:10px solid #141C18;overflow:hidden;background:#060807;
  box-shadow:0 0 0 1px #27352E,0 60px 120px -40px rgba(0,0,0,.95);-webkit-box-reflect:below 14px linear-gradient(transparent 75%,rgba(255,255,255,.12));
  animation:phIn 1.3s cubic-bezier(.16,1,.3,1) calc(var(--s) + 1s) both,phTurn 5s linear calc(var(--s) + 1s) both}
@keyframes phIn{from{opacity:0;translate:180px 0}to{opacity:1;translate:0 0}}
@keyframes phTurn{from{transform:rotateY(-26deg) rotateX(6deg)}to{transform:rotateY(-14deg) rotateX(3deg)}}
.phone .shot{width:360px;background-size:360px auto;background-image:url(${shots.phone});animation:kb3 4.4s cubic-bezier(.4,0,.6,1) calc(var(--s) + 1.4s) both}
@keyframes kb3{from{transform:translateY(0)}to{transform:translateY(-440px)}}
.demo{position:absolute;right:24px;top:12px;font-size:16px;color:#64776D;border:1px solid #27352E;border-radius:999px;padding:3px 12px;background:rgba(6,8,7,.85);z-index:2}
/* scene 8 */
.lock{position:absolute;left:960px;top:330px;transform:translate(-50%,-50%);animation:land .9s cubic-bezier(.2,.8,.2,1) ${LAND - S.cta[0] - 0.5}s both;animation-delay:calc(var(--s) + ${(LAND - S.cta[0] - 0.5).toFixed(2)}s)}
@keyframes land{0%{opacity:0;transform:translate(-50%,-50%) scale(1.5);filter:blur(14px)}60%{opacity:1;transform:translate(-50%,-50%) scale(.97);filter:none}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.fine{position:absolute;left:0;right:0;bottom:112px;text-align:center;font-size:18px;color:#64776D;line-height:1.6}`;

// What JS draws on each frame: counters, the orbit, the dial, the flying coins and the balance.
function update(t) {
  const ease = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
  document.querySelectorAll(".cnt").forEach((el) => {
    const k = Math.min(1, Math.max(0, (t - +el.dataset.at) / +el.dataset.dur));
    const v = +el.dataset.from + (+el.dataset.to - +el.dataset.from) * ease(k);
    el.textContent = el.dataset.pre + v.toFixed(+el.dataset.dec) + el.dataset.suf;
  });
  document.querySelectorAll(".orb").forEach((el) => {
    const th = +el.dataset.a + (t - 12) * 0.5;
    const s = Math.sin(th), c = Math.cos(th), depth = (s + 1) / 2;
    el.style.transform = `translate(${960 + 440 * c}px,${420 + 125 * s}px) translate(-50%,-50%) scale(${0.6 + 0.5 * depth})`;
    el.style.zIndex = s > 0 ? "30" : "5";
    el.style.opacity = String(0.35 + 0.65 * depth);
  });
  const P = window.PAYOUTS, start = P[0] - 1.6;
  const ring = document.querySelector(".ringp");
  if (ring) {
    const lt = t - start, cyc = lt / 1.6;
    ring.style.setProperty("--p", lt <= 0 ? "0" : cyc >= 3 ? "1" : String(cyc % 1));
    const pulse = document.querySelector(".dial .pulse");
    const since = Math.min(...P.map((p) => (t >= p ? t - p : 99)));
    pulse.style.opacity = since < 0.7 ? String(1 - since / 0.7) : "0";
    pulse.style.transform = `scale(${1 + since * 0.25})`;
  }
  document.querySelectorAll(".fly").forEach((el) => {
    const t0 = +el.dataset.t, u = (t - t0) / 0.55;
    if (u < 0 || u > 1) return (el.style.opacity = "0");
    const x0 = 470, y0 = 560, x1 = 960, y1 = 360, cx = 720, cy = 180;
    const xx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, yy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
    el.style.opacity = "1";
    el.style.transform = `translate(${xx - 32}px,${yy - 32}px) scale(${1 - 0.4 * u}) rotate(${u * 540}deg)`;
  });
  const bal = document.querySelector(".bal b");
  if (bal) {
    let v = 0;
    P.forEach((p, i) => (v += window.AMOUNTS[i] * ease(Math.min(1, Math.max(0, (t - p - 0.5) / 0.5)))));
    bal.textContent = v.toFixed(4);
  }
}

const html = `<div class="stage"><div class="shake">
  <div class="glow"></div>${bokeh(22, 3)}<div class="grid"></div>

  ${scene(
    "open",
    `${rays(960, 340, 1500, STAMP)}
     <div class="flash"></div>
     <div class="hero"><div class="burst"></div><div class="burst b2"></div>${specks(26, 4, STAMP)}<div class="seal3d">${seal(300)}</div>${shine(300, STAMP + 0.5)}</div>
     <div class="wipe">${word(300)}</div>
     ${zh(["土狗也分红，分的是", ["美股", "hl"], { html: '<span class="up">↗</span>' }], 790, 3.3, 66).replace('class="hl"', 'class="hl" style="--hlo:4.1s"')}
     ${en("Memecoins that pay you real stock dividends.", 895, 4.2)}`,
  )}

  ${scene(
    "zero",
    `<div class="ph1">
       ${zh(["持有土狗，分红为零。"], 150, 0.5, 86)}
       ${en("Holding a memecoin pays you nothing.", 275, 1.1)}
       <div class="zero">$0.00</div><div class="flat"></div>
     </div>
     <div class="streak"></div>
     ${zh([["直到现在。", "lime"]], 430, 4.05, 140)}
     ${en("Until now.", 640, 4.5)}`,
  )}

  ${scene(
    "meet",
    `${rays(960, 420, 1300, 0.2)}
     <div class="ring3d"></div>
     <div class="core float"><div class="spinw"><div class="spin">${rim(195)}</div></div><div style="filter:drop-shadow(0 30px 50px rgba(0,0,0,.6)) drop-shadow(0 0 50px rgba(195,255,60,.3))">${seal(240)}</div>${shine(240, 1.2)}</div>
     ${orbit}
     ${motes(26, 5, 480, 1440, 260, 760)}
     ${zh(["hwai：每笔交易都买入", ["真实股票代币", "hl"]], 790, 1.6, 64).replace('class="hl"', 'class="hl" style="--hlo:2.6s"')}
     ${en("Every trade buys a real stock token, like NVDAx or SPYx, for the coin's holders.", 890, 2.4)}`,
  )}

  ${scene(
    "fee",
    `${zh(["内盘每笔交易 ", { html: `<span class="mono">${cnt(0, 1.25, 2, S.fee[0] + 0.6, 1.4, "", "%")}</span>` }, " 手续费"], 180, 0.2, 80)}
     ${en(`<span class="lime" style="font-weight:700">0.50%</span> of every trade on the curve goes to the coin's holders, in stock.`, 305, 0.8)}
     <div class="bar3d"><div class="bar">${segs.join("")}</div></div>
     <div class="labels">${labels.join("")}</div>
     ${zh(["其中 ", ["0.50%", "lime mono"], " 分给持有人"], 860, 3.2, 52)}`,
  )}

  ${scene(
    "hourly",
    `${zh(["每小时，美股", ["自动到账", "hl"]], 100, 0.2, 80).replace('class="hl"', 'class="hl" style="--hlo:.9s"')}
     <div class="dial rise" style="${at(0.3)}"><div class="ringp"></div><div class="pulse"></div><div class="face"><b>1h</b><span>每小时 · hourly</span></div></div>
     <div class="wallet-wrap rise" style="${at(0.5)}"><div class="wallet"><h3>你的钱包 · Your wallet <small>示例 · Example</small></h3>
       <span class="bal"><b>0.0000</b><small>NVDAx</small></span>${rows}</div></div>
     ${flyers}
     ${zh(["持有 $10 以上，每小时自动发到钱包"], 880, 1.0, 42)}
     ${en("Hold $10 or more of a coin, and its stock lands in your wallet every hour.", 950, 1.6)}`,
  )}

  ${scene(
    "fair",
    `${zh(["从第一个区块就公平"], 200, 0.1, 80)}
     ${en("Fair from the first block.", 315, 0.6)}
     <div class="cards">${cards}</div>`,
  )}

  ${scene(
    "product",
    `${zh(["填表、选股票、", ["发币", "hl"]], 80, 0.1, 64).replace('class="hl"', 'class="hl" style="--hlo:.7s"')}
     ${en("Name it, pick the stock its holders earn, launch in seconds.", 170, 0.5)}
     <div class="devices">
       <div class="laptop"><div class="chrome"><i></i><i></i><i></i><span>🔒 hwai.ai</span></div>
         <div class="view"><div class="shot s1"></div><div class="shot s2"></div><span class="demo">演示数据 · Demo data</span></div></div>
       <div class="phone"><div class="shot"></div></div>
     </div>`,
  )}

  ${scene(
    "cta",
    `${rays(960, 330, 1500, 0.4)}
     <div class="lock" style="filter:drop-shadow(0 0 50px rgba(195,255,60,.25))">${sized(read("lockup-dark.svg"), 660)}</div>
     ${zh(["土狗也分红，分的是", ["美股", "hl"], { html: '<span class="up">↗</span>' }], 490, 1.1, 70).replace('class="hl"', 'class="hl" style="--hlo:1.9s"')}
     <p class="center mono track" style="top:625px;font-size:92px;font-weight:700;letter-spacing:-.02em;${at(2.0)}"><span class="lime" style="text-shadow:0 0 40px rgba(195,255,60,.35)">hwai.ai</span></p>
     <div class="center rise" style="top:770px;${at(2.6)}"><span class="pill"><i></i>Solana · 每小时美股分红</span></div>
     ${motes(22, 9, 300, 1620, 360, 880)}
     <p class="fine rise" style="${at(3.2)}">股票代币由第三方发行，并非所有地区都能使用。本内容不构成投资建议。<br>Tokenized stocks are issued by third parties and aren't available everywhere. Nothing here is financial advice.</p>`,
    "last",
  )}
</div>
<img class="grain" src="GRAIN" width="${W}" height="${H}" alt="">
<div class="vig"></div><div class="lb t"></div><div class="lb b"></div>
</div>`;

// Film grain, rendered once (an SVG turbulence filter redrawn every frame is ten times slower).
async function grain(b) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(`<body style="margin:0"><svg width="${W}" height="${H}"><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gr)"/></svg></body>`);
  const png = await p.screenshot();
  await p.close();
  return `data:image/png;base64,${png.toString("base64")}`;
}

// The product shots: the approved prototype (its demo data), rendered here so the video follows the design.
async function shots(b) {
  const proto = fs.readFileSync(path.join(ROOT, "prototype/hwai-niu-prototype.html"), "utf8");
  const doc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${proto}</body></html>`;
  const out = {};
  for (const [k, hash, vp, dpr, h] of [["home", "home", { width: 1440, height: 900 }, 1, 2000], ["coin", "coin", { width: 1440, height: 900 }, 1, 1300], ["phone", "home", { width: 390, height: 844 }, 2, 2200]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: dpr });
    await p.setContent(doc, { waitUntil: "networkidle" });
    await p.evaluate((x) => (location.hash = x), hash);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    // The fixed tab bar would sit mid-page in a full-page shot: hide it.
    await p.addStyleTag({ content: ".tabbar{display:none!important}body{padding-bottom:0!important}" });
    const png = await p.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: vp.width, height: h } });
    out[k] = `data:image/png;base64,${png.toString("base64")}`;
    await p.close();
  }
  return out;
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: W, height: H } });
  const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;900&family=JetBrains+Mono:wght@500;700&display=block">`;
  const script = `<script>window.PAYOUTS=${JSON.stringify(PAYOUTS)};window.AMOUNTS=${JSON.stringify(AMOUNTS)};window.update=${update.toString()};</script>`;
  await page.setContent(`<!doctype html><meta charset="utf-8">${fonts}<style>${css(await shots(b))}</style>${html.replace("GRAIN", await grain(b))}${script}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const seek = (ms) =>
    page.evaluate((t) => {
      document.getAnimations().forEach((a) => (a.currentTime = t));
      window.update(t / 1000);
    }, ms);
  // Lossless PNG frames straight from the compositor; optimizeForSpeed halves the encoding time.
  const cdp = await page.context().newCDPSession(page);
  const frame = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64");

  // --bench: how long a frame takes, on a busy scene.
  if (process.argv[3] === "--bench") {
    const t0 = Date.now();
    for (let f = 0; f < 30; f++) {
      await seek((13 + f / FPS) * 1000);
      await frame();
    }
    console.log(`${((Date.now() - t0) / 30).toFixed(0)} ms a frame`);
    await b.close();
    return;
  }

  // --stills <dir>: frames from each scene, to check the layout before a full render.
  if (process.argv[3] === "--stills") {
    for (const [k, [s, d]] of Object.entries(S)) {
      for (const f of [0.35, 0.9]) {
        await seek((s + d * f) * 1000);
        fs.writeFileSync(path.join(process.argv[4], `${k}-${Math.round(f * 100)}.png`), await frame());
      }
    }
    for (const t of [1.2, 2.05, 2.4, 10.3, 28.95]) {
      await seek(t * 1000);
      fs.writeFileSync(path.join(process.argv[4], `t-${t}.png`), await frame());
    }
    await b.close();
    return;
  }

  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(DURATION * FPS);
  for (let f = 0; f < frames; f++) {
    await seek((f / FPS) * 1000);
    const png = await frame();
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % (FPS * 5) === 0) process.stdout.write(`${(f / FPS).toFixed(0)}s `);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg exited ${c}`)))));
  await b.close();
  console.log(`\n${OUT}`);
})();
