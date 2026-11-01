// hwai intro video for X (16:9, 1920 x 1080, 30 fps, H.264), design 牛: a premium tour of what the site does.
// Chinese headlines with the English under them, as on the site. Every fact matches the site's How it works
// page (fees, $10 snapshot floor, 85 SOL graduation, Jito bundles, dev buys shown, locked liquidity); the
// product shots are the approved prototype's demo data and say so on screen.
// Usage (repo root): node brand/hwai/src/intro-video.cjs brand/hwai [--stills <dir>]
// then:              python3 brand/hwai/src/intro-music.py brand/hwai
// Frames are seeked with the Web Animations API, so every frame is exact whatever the render speed.
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
const FPS = 30;

// Scenes: [start, length] in seconds. 120 BPM, so every scene starts on a bar (intro-music.py follows these).
const S = { open: [0, 5], zero: [5, 5], meet: [10, 6], fee: [16, 6], hourly: [22, 6], fair: [28, 6], product: [34, 6], cta: [40, 6] };
const DURATION = S.cta[0] + S.cta[1];
const scene = (k, inner, cls = "") => `<section class="scene ${cls}" style="--s:${S[k][0]}s;--d:${S[k][1]}s">${inner}</section>`;
const at = (o) => `--o:${o}s`;
const zh = (t, top, o, size = 92) => `<p class="center zh in" style="top:${top}px;font-size:${size}px;${at(o)}">${t}</p>`;
const en = (t, top, o) => `<p class="center en in" style="top:${top}px;${at(o)}">${t}</p>`;
const hl = (t) => `<span class="hl">${t}</span>`;

const seal = (size) => sized(read("mark.svg"), size);
const word = (w) => sized(read("wordmark-dark.svg"), w);

// A coin's milled edge in gold (as on the X photo).
function rim(r, cls = "") {
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, r0 = r - (i % 10 === 0 ? 18 : 10);
    ticks += `M${(r + r0 * Math.cos(a)).toFixed(1)} ${(r + r0 * Math.sin(a)).toFixed(1)}L${(r + (r - 3) * Math.cos(a)).toFixed(1)} ${(r + (r - 3) * Math.sin(a)).toFixed(1)}`;
  }
  return `<svg class="${cls}" width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}"><defs><linearGradient id="gd${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FFC84A"/><stop offset="1" stop-color="#9A6B12"/></linearGradient></defs>
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="none" stroke="url(#gd${r})" stroke-opacity=".6" stroke-width="2.5"/>
    <circle cx="${r}" cy="${r}" r="${r - 26}" fill="none" stroke="url(#gd${r})" stroke-opacity=".22" stroke-width="1.5"/>
    <path d="${ticks}" stroke="url(#gd${r})" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/></svg>`;
}

// Gold motes drifting up (dividends), placed by a fixed seed.
function motes(n, seed, x0, x1, y0, y1) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  let s = "";
  for (let i = 0; i < n; i++) {
    const size = 3 + rnd() * 6;
    s += `<i class="mote" style="left:${x0 + rnd() * (x1 - x0)}px;top:${y0 + rnd() * (y1 - y0)}px;width:${size}px;height:${size}px;${at(rnd() * 3)};--dur:${3 + rnd() * 3}s"></i>`;
  }
  return s;
}

// Scene 3: the six featured stocks around the seal.
const CX = 960, CY = 430, ORBIT = 270;
const orbit = ["NVDAx", "SPYx", "TSLAx", "AAPLx", "QQQx", "GOOGLx"]
  .map((s, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return `<div class="chip pop" style="left:${CX + Math.cos(a) * ORBIT}px;top:${CY + Math.sin(a) * ORBIT}px;${at(0.6 + i * 0.12)}"><img src="${stock(s)}"><span>${s}</span></div>`;
  })
  .join("");

// Scene 4: the 1.25% on the curve, as the site splits it. Widths out of 1400 px.
const split = [
  ["0.50%", "持有人<small>holders</small>", 560, "linear-gradient(100deg,#D6FF4F,#C3FF3C)", "#C3FF3C"],
  ["0.15%", "创建者<small>creator</small>", 168, "#13B864", "#ECF5EF"],
  ["0.35%", "hwai", 392, "linear-gradient(100deg,#FFE29A,#FFC84A)", "#FFC84A"],
  ["0.25%", "Raydium", 280, "#27352E", "#ECF5EF"],
];
let x = 0;
const segs = [], labels = [];
split.forEach(([pct, who, w, bg, col], i) => {
  segs.push(`<div class="seg" style="left:${x}px;width:${w}px;background:${bg};${at(0.9 + i * 0.35)}"></div>`);
  labels.push(`<div class="segl in" style="left:${x}px;width:${w}px;${at(1.15 + i * 0.35)}"><b style="color:${col}">${pct}</b><span>${who}</span></div>`);
  x += w;
});

// Scene 5: three hourly payouts landing in a wallet.
const nvda = stock("NVDAx");
const rows = [
  ["14:00", "+0.0213"],
  ["15:00", "+0.0391"],
  ["16:00", "+0.0127"],
]
  .map(([h, amt], i) => `<div class="row in" style="${at(1.2 + i * 1.0)}"><img src="${nvda}"><div><b>NVDAx</b><span>${h} 这一轮 · round</span></div><em>${amt} NVDAx</em><i class="ok">已到账</i></div>`)
  .join("");

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
      `<div class="card in" style="${at(0.5 + k * 0.3)}"><span class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#061006" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${icon[ic]}</svg></span><b>${t}</b><em>${e}</em><p>${d}</p></div>`,
  )
  .join("");

const css = (shots) => `
*{box-sizing:border-box}html,body{margin:0;background:#060807}
body{font-family:"Noto Sans SC",sans-serif;color:#ECF5EF;-webkit-font-smoothing:antialiased}
.stage{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:radial-gradient(1200px 800px at 50% 40%,#0C1510,#060807 65%,#040605)}
.cam{position:absolute;inset:0;animation:shake .45s linear .62s both}
@keyframes shake{0%{transform:none}15%{transform:translate(-9px,6px)}30%{transform:translate(8px,-5px)}45%{transform:translate(-6px,-4px)}60%{transform:translate(4px,3px)}80%{transform:translate(-2px,1px)}100%{transform:none}}
.grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/100% 60px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/60px 100%;
  -webkit-mask-image:radial-gradient(900px 600px at 50% 45%,#000,transparent 80%)}
.glow{position:absolute;width:1500px;height:1100px;left:210px;top:-60px;background:radial-gradient(closest-side,rgba(46,240,138,.16),transparent);animation:drift ${DURATION}s linear 0s both}
@keyframes drift{0%{transform:translate(-200px,-40px)}50%{transform:translate(180px,60px)}100%{transform:translate(-60px,0)}}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.6));pointer-events:none}
.grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:overlay;pointer-events:none}
.scene{position:absolute;inset:0;opacity:0;animation:sc var(--d) linear var(--s) both}
.scene.last{animation-name:scLast}
@keyframes sc{0%{opacity:0}5%{opacity:1}95%{opacity:1}100%{opacity:0}}
@keyframes scLast{0%{opacity:0}8%{opacity:1}100%{opacity:1}}
.in{animation:rise .9s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o,0s)) both}
@keyframes rise{from{opacity:0;transform:translateY(34px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.pop{animation:pop .7s cubic-bezier(.34,1.56,.64,1) calc(var(--s) + var(--o,0s)) both}
@keyframes pop{from{opacity:0;transform:translate(-50%,-50%) scale(.3)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.center{position:absolute;left:0;right:0;text-align:center;margin:0}
.zh{font-weight:900;letter-spacing:-.01em;line-height:1.12}
.en{font-weight:500;font-size:34px;color:#9DB0A6}
.hl{position:relative;color:#061006;padding:0 .1em;z-index:0;white-space:nowrap}
.hl::before{content:"";position:absolute;inset:.1em -.02em .02em;background:#C3FF3C;border-radius:.14em;transform:rotate(-1.5deg);z-index:-1}
.up{color:#2EF08A}.gold{color:#FFC84A}.lime{color:#C3FF3C}
.pill{display:inline-flex;align-items:center;gap:12px;height:52px;padding:0 24px;border-radius:999px;background:rgba(46,240,138,.1);border:1px solid rgba(46,240,138,.35);color:#2EF08A;font-weight:700;font-size:24px}
.pill i{width:12px;height:12px;border-radius:50%;background:#2EF08A;box-shadow:0 0 0 7px rgba(46,240,138,.18)}
/* scene 1: the stamp */
.stampwrap{position:absolute;left:960px;top:330px}
.stamp{position:absolute;left:0;top:0;animation:stamp .75s cubic-bezier(.2,.8,.2,1) .2s both;filter:drop-shadow(0 30px 50px rgba(0,0,0,.6)) drop-shadow(0 0 50px rgba(195,255,60,.3))}
@keyframes stamp{0%{opacity:0;transform:translate(-50%,-50%) scale(1.9) rotate(-14deg);filter:blur(10px)}55%{opacity:1;transform:translate(-50%,-50%) scale(.93) rotate(0);filter:blur(0)}75%{transform:translate(-50%,-50%) scale(1.03)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.burst{position:absolute;left:0;top:0;width:340px;height:340px;border-radius:50%;border:3px solid rgba(195,255,60,.7);animation:burst 1.1s cubic-bezier(.16,1,.3,1) .62s both}
.burst.b2{border-color:rgba(255,200,74,.5);animation-delay:.72s}
@keyframes burst{from{opacity:.9;transform:translate(-50%,-50%) scale(.6)}to{opacity:0;transform:translate(-50%,-50%) scale(2.6)}}
.wipe{position:absolute;left:960px;top:560px;transform:translateX(-50%);animation:wipe 1s cubic-bezier(.6,0,.2,1) 1.1s both}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
/* scene 2 */
.zero{position:absolute;left:660px;top:420px;width:600px;padding:34px 40px;border-radius:26px;border:1px solid #1D2823;background:linear-gradient(180deg,#131B17,#0F1512);text-align:left}
.zero span{font-size:24px;color:#64776D}.zero b{display:block;font:700 96px/1.1 "JetBrains Mono",monospace;color:#3A4A42;margin-top:6px}
.zero svg{position:absolute;right:40px;bottom:46px}
/* scene 3 */
.ring{position:absolute;border-radius:50%;transform:translate(-50%,-50%)}
.spin{animation:spin 18s linear 0s infinite;transform-origin:50% 50%}
@keyframes spin{to{transform:rotate(360deg)}}
.chip{position:absolute;display:flex;flex-direction:column;align-items:center;gap:10px}
.chip img{width:88px;height:88px;border-radius:50%;display:block;box-shadow:0 0 0 2px rgba(255,255,255,.2),0 14px 34px -10px rgba(0,0,0,.8),0 0 26px -6px rgba(195,255,60,.4)}
.chip span{font:700 18px "JetBrains Mono",monospace;color:#FFC84A;background:rgba(6,8,7,.8);border:1px solid rgba(255,200,74,.3);padding:4px 12px;border-radius:999px}
.mote{position:absolute;border-radius:50%;background:#FFC84A;box-shadow:0 0 12px rgba(255,200,74,.8);opacity:0;animation:mote var(--dur) ease-out calc(var(--s) + var(--o)) infinite}
@keyframes mote{0%{opacity:0;transform:translateY(0)}20%{opacity:.9}100%{opacity:0;transform:translateY(-260px)}}
/* scene 4 */
.bar{position:absolute;left:260px;top:520px;width:1400px;height:100px;border-radius:22px;overflow:hidden;box-shadow:0 0 0 1px #27352E}
.seg{position:absolute;top:0;height:100px;transform-origin:left center;animation:seg .55s cubic-bezier(.16,1,.3,1) calc(var(--s) + var(--o)) both}
@keyframes seg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.labels{position:absolute;left:260px;top:646px;width:1400px}
.segl{position:absolute;top:0;display:flex;flex-direction:column;gap:6px;padding-left:4px}
.segl b{font:700 40px "JetBrains Mono",monospace;letter-spacing:-.02em}.segl span{font-size:24px;color:#ECF5EF;white-space:nowrap}.segl small{display:block;font-size:19px;color:#64776D}
/* scene 5 */
.clock{position:absolute;left:300px;top:330px}
.sweep{transform-origin:180px 180px;animation:spin 2s linear calc(var(--s) + .6s) 3 both}
.wallet{position:absolute;left:800px;top:290px;width:820px;padding:32px 34px;border-radius:26px;border:1px solid #27352E;background:linear-gradient(180deg,#131B17,#0F1512);box-shadow:0 40px 80px -40px rgba(0,0,0,.9)}
.wallet h3{margin:0 0 18px;font-size:28px;font-weight:700;display:flex;justify-content:space-between}.wallet h3 small{font-size:20px;color:#64776D;font-weight:500}
.row{display:flex;align-items:center;gap:18px;padding:16px 20px;border-radius:18px;background:rgba(255,200,74,.06);border:1px solid rgba(255,200,74,.25);margin-top:14px}
.row img{width:56px;height:56px;border-radius:50%}.row div{flex:1}.row b{display:block;font-size:26px}.row span{font-size:20px;color:#9DB0A6}
.row em{font:700 26px "JetBrains Mono",monospace;font-style:normal;color:#FFC84A}
.row .ok{font-style:normal;font-size:19px;font-weight:700;color:#061006;background:#2EF08A;padding:6px 12px;border-radius:999px}
/* scene 6 */
.cards{position:absolute;left:160px;right:160px;top:420px;display:flex;gap:34px}
.card{flex:1;padding:36px 34px;border-radius:26px;border:1px solid #1D2823;background:linear-gradient(180deg,#131B17,#0F1512);position:relative;overflow:hidden}
.card::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,#13B864,#C3FF3C)}
.card .ic{display:grid;place-items:center;width:64px;height:64px;border-radius:16px;background:#C3FF3C}
.card b{display:block;font-size:40px;font-weight:900;margin:24px 0 4px}.card em{display:block;font-style:normal;font-size:22px;color:#2EF08A;font-weight:700;margin-bottom:14px}
.card p{margin:0;font-size:24px;line-height:1.6;color:#9DB0A6}
/* scene 7 */
.browser{position:absolute;left:150px;top:250px;width:1180px;height:740px;border-radius:20px;overflow:hidden;border:1px solid #27352E;background:#0B0F0D;box-shadow:0 50px 100px -40px rgba(0,0,0,.95)}
.chrome{height:46px;display:flex;align-items:center;gap:9px;padding:0 18px;background:#0F1512;border-bottom:1px solid #1D2823}
.chrome i{width:12px;height:12px;border-radius:50%;background:#27352E}
.chrome span{margin-left:16px;flex:1;max-width:420px;height:28px;border-radius:8px;background:#060807;border:1px solid #1D2823;color:#9DB0A6;font:500 15px "JetBrains Mono",monospace;display:flex;align-items:center;padding:0 12px}
.view{position:absolute;left:0;right:0;top:46px;bottom:0;overflow:hidden}
.shot{position:absolute;left:0;top:0;width:1180px;background-size:1180px auto;background-repeat:no-repeat;height:1600px}
.s1{background-image:url(${shots.home});animation:kb1 6s linear var(--s) both}
@keyframes kb1{from{transform:translateY(0) scale(1)}to{transform:translateY(-300px) scale(1.04)}}
.s2{background-image:url(${shots.coin});opacity:0;animation:fadein .6s linear calc(var(--s) + 3s) both,kb2 3s linear calc(var(--s) + 3s) both}
@keyframes fadein{to{opacity:1}}
@keyframes kb2{from{transform:translateY(0)}to{transform:translateY(-90px)}}
.phone{position:absolute;left:1390px;top:200px;width:390px;height:800px;border-radius:44px;border:10px solid #131B17;overflow:hidden;background:#060807;box-shadow:0 50px 100px -40px rgba(0,0,0,.95),0 0 0 1px #27352E;animation:slidein 1s cubic-bezier(.16,1,.3,1) calc(var(--s) + 1s) both}
@keyframes slidein{from{opacity:0;transform:translateX(160px)}to{opacity:1;transform:none}}
.phone .shot{width:370px;background-size:370px auto;background-image:url(${shots.phone});animation:kb3 4.5s linear calc(var(--s) + 1.4s) both}
@keyframes kb3{from{transform:translateY(0)}to{transform:translateY(-420px)}}
.demo{position:absolute;right:30px;top:12px;font-size:16px;color:#64776D;border:1px solid #27352E;border-radius:999px;padding:3px 12px;background:rgba(6,8,7,.85)}
/* scene 8 */
.fine{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:18px;color:#64776D;line-height:1.6}`;

const html = `<div class="stage"><div class="cam">
  <div class="glow"></div><div class="grid"></div>

  ${scene(
    "open",
    `<div class="stampwrap"><div class="burst"></div><div class="burst b2"></div><div class="stamp">${seal(300)}</div></div>
     <div class="wipe">${word(300)}</div>
     ${zh(`土狗也分红，分的是${hl("美股")}<span class="up">↗</span>`, 790, 2.1, 64)}
     ${en("Memecoins that pay you real stock dividends.", 890, 2.6)}`,
  )}

  ${scene(
    "zero",
    `${zh("持有土狗，分红为零。", 170, 0.1)}
     ${en("Holding a memecoin pays you nothing.", 300, 0.4)}
     <div class="zero in" style="${at(0.7)}"><span>持有人分红 · Paid to holders</span><b>$0.00</b>
       <svg width="200" height="60" viewBox="0 0 200 60"><path d="M0 50 L200 50" stroke="#27352E" stroke-width="5" stroke-linecap="round"/></svg></div>
     ${zh(`<span class="lime">直到现在。</span>`, 760, 2.6, 96)}
     ${en("Until now.", 890, 2.9)}`,
  )}

  ${scene(
    "meet",
    `<div class="ring" style="left:${CX}px;top:${CY}px;width:${ORBIT * 2}px;height:${ORBIT * 2}px;border:1px solid rgba(195,255,60,.14)"></div>
     <div class="ring pop" style="left:${CX}px;top:${CY}px;${at(0.1)}"><div class="spin">${rim(190)}</div></div>
     <div class="pop" style="position:absolute;left:${CX}px;top:${CY}px;${at(0.2)};filter:drop-shadow(0 30px 50px rgba(0,0,0,.6)) drop-shadow(0 0 40px rgba(195,255,60,.3))">${seal(230)}</div>
     ${orbit}
     ${motes(26, 5, 520, 1400, 300, 760)}
     ${zh(`hwai：每笔交易都买入${hl("真实股票代币")}`, 790, 1.6, 64)}
     ${en("Every trade buys a real stock token, like NVDAx or SPYx, for the coin's holders.", 890, 2.0)}`,
  )}

  ${scene(
    "fee",
    `${zh("内盘每笔交易 1.25% 手续费", 200, 0.1, 80)}
     ${en(`<span class="lime" style="font-weight:700">0.50%</span> of every trade on the curve goes to the coin's holders, in stock.`, 320, 0.4)}
     <div class="bar">${segs.join("")}</div>
     <div class="labels">${labels.join("")}</div>
     ${zh(`其中 <span class="lime">0.50%</span> 分给持有人`, 830, 2.6, 52)}`,
  )}

  ${scene(
    "hourly",
    `${zh(`每小时，美股${hl("自动到账")}`, 110, 0.1, 80)}
     <svg class="clock in" style="${at(0.3)}" width="360" height="360" viewBox="0 0 360 360">
       <circle cx="180" cy="180" r="160" fill="#0F1512" stroke="#27352E" stroke-width="2"/>
       <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(255,200,74,.25)" stroke-width="10"/>
       ${Array.from({ length: 12 }, (_, i) => `<line x1="180" y1="34" x2="180" y2="${i % 3 ? 46 : 58}" stroke="#FFC84A" stroke-opacity="${i % 3 ? 0.35 : 0.9}" stroke-width="4" stroke-linecap="round" transform="rotate(${i * 30} 180 180)"/>`).join("")}
       <g class="sweep"><line x1="180" y1="180" x2="180" y2="62" stroke="#ECF5EF" stroke-width="7" stroke-linecap="round"/></g>
       <circle cx="180" cy="180" r="12" fill="#C3FF3C"/>
       <text x="180" y="250" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="30" fill="#FFC84A">1h</text>
     </svg>
     <div class="wallet in" style="${at(0.5)}"><h3>你的钱包 · Your wallet <small>示例 · Example</small></h3>${rows}</div>
     ${zh("持有 $10 以上，每小时自动发到钱包", 870, 0.9, 44)}
     ${en("Hold $10 or more of a coin, and its stock lands in your wallet every hour.", 945, 1.2)}`,
  )}

  ${scene(
    "fair",
    `${zh("从第一个区块就公平", 210, 0.1, 80)}
     ${en("Fair from the first block.", 320, 0.3)}
     <div class="cards">${cards}</div>`,
  )}

  ${scene(
    "product",
    `${zh(`填表、选股票、${hl("发币")}`, 90, 0.1, 64)}
     ${en("Name it, pick the stock its holders earn, launch. Free.", 180, 0.4)}
     <div class="browser in" style="${at(0.3)}"><div class="chrome"><i></i><i></i><i></i><span>🔒 hwai.ai</span></div>
       <div class="view"><div class="shot s1"></div><div class="shot s2"></div><span class="demo">演示数据 · Demo data</span></div></div>
     <div class="phone"><div class="shot"></div></div>`,
  )}

  ${scene(
    "cta",
    `<div class="pop" style="position:absolute;left:960px;top:330px;${at(0.1)};filter:drop-shadow(0 0 40px rgba(195,255,60,.25))">${sized(read("lockup-dark.svg"), 640)}</div>
     ${zh(`土狗也分红，分的是${hl("美股")}<span class="up">↗</span>`, 500, 0.6, 72)}
     <p class="center in" style="top:640px;font:700 84px 'JetBrains Mono',monospace;letter-spacing:-.02em;${at(1.0)}"><span class="lime">hwai.ai</span></p>
     <div class="center in" style="top:780px;${at(1.4)}"><span class="pill"><i></i>Solana · 每小时美股分红</span></div>
     ${motes(22, 9, 300, 1620, 380, 900)}
     <p class="fine in" style="${at(1.9)}">股票代币由第三方发行，并非所有地区都能使用。本内容不构成投资建议。<br>Tokenized stocks are issued by third parties and aren't available everywhere. Nothing here is financial advice.</p>`,
    "last",
  )}
</div>
<img class="grain" src="GRAIN" width="${W}" height="${H}" alt="">
<div class="vig"></div>
</div>`;

// Film grain, rendered once: an SVG turbulence filter redrawn on every frame made the render ten times slower.
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
  for (const [k, hash, vp, dpr, h] of [["home", "home", { width: 1440, height: 900 }, 1, 1950], ["coin", "coin", { width: 1440, height: 900 }, 1, 1300], ["phone", "home", { width: 390, height: 844 }, 2, 2200]]) {
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
  await page.setContent(`<!doctype html><meta charset="utf-8">${fonts}<style>${css(await shots(b))}</style>${html.replace("GRAIN", await grain(b))}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const seek = (ms) => page.evaluate((t) => document.getAnimations().forEach((a) => (a.currentTime = t)), ms);
  // Lossless PNG frames straight from the compositor; optimizeForSpeed halves the encoding time.
  const cdp = await page.context().newCDPSession(page);
  const frame = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64");

  // --bench: how long a frame takes, on the busiest scenes.
  if (process.argv[3] === "--bench") {
    const t0 = Date.now();
    for (let f = 0; f < 30; f++) {
      await seek((10 + f / FPS) * 1000);
      await frame();
    }
    console.log(`${((Date.now() - t0) / 30).toFixed(0)} ms a frame`);
    await b.close();
    return;
  }

  // --stills <dir>: frames from each scene, to check the layout before a full render.
  if (process.argv[3] === "--stills") {
    for (const [k, [s, d]] of Object.entries(S)) {
      for (const f of [0.45, 0.9]) {
        await seek((s + d * f) * 1000);
        await page.screenshot({ path: path.join(process.argv[4], `${k}-${Math.round(f * 100)}.png`) });
      }
    }
    await b.close();
    return;
  }

  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], { stdio: ["pipe", "inherit", "inherit"] });
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
