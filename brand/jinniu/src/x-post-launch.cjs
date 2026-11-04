/**
 * 金牛's "launch on 金牛" X post (owner, 2026-11-04: "suruh mereka launch di jinniu"), 16:9 so X shows it
 * uncropped. A call to launch: the hero line, three things that are true of every coin (holders paid in a
 * stock every hour, the creator's 0.15%, no sniper in block 0) and the link; on the right an illustrative
 * "your coin" card in the site's .cc look, with no numbers, and the stock tokens around it. No real coins
 * from the board (their pictures are theirs, and a banner isn't the place to promote one), no launch fee
 * (it can change with go-live.sh launch-fee).
 *
 *   node brand/jinniu/src/x-post-launch.cjs   → brand/jinniu/social/x-post-launch-1600x900.png and x-post-launch-3200x1800.png
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const png = (f) => "data:image/png;base64," + fs.readFileSync(path.join(ROOT, f)).toString("base64");
const stock = (s) => png(`apps/web/public/stocks/${s}.png`);
const mark = fs.readFileSync(path.join(ROOT, "brand/jinniu/mark.svg"), "utf8").trim().replace("<svg ", '<svg width="58" height="58" style="display:block" ');

const FLOAT = [["TSLAx", 1468, 262, 74], ["SPYx", 1500, 690, 58], ["AAPLx", 890, 284, 54], ["QQQx", 900, 738, 62], ["GOOGLx", 1250, 812, 50]];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&family=Noto+Sans+SC:wght@500;700;800;900&display=block">
<style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:900px;overflow:hidden;background:#fff;color:#0A0A0A;font-family:"Inter Tight","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.c{position:relative;width:1600px;height:900px;padding:56px 88px 0}
.glow{position:absolute;left:820px;top:100px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,#FFF4D6 0%,rgba(255,244,214,.5) 34%,rgba(255,255,255,0) 66%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(#E6E6E2 1.2px,transparent 1.4px);background-size:24px 24px;
  -webkit-mask-image:radial-gradient(520px 420px at 1190px 520px,#000 0%,rgba(0,0,0,.45) 50%,transparent 78%)}
.top{position:relative;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:14px}
.brand b{font:900 38px/1 "Noto Sans SC";letter-spacing:.03em}
.brand small{font:600 20px/1 "Inter Tight";color:#A3A3A3}
.live{display:flex;align-items:center;gap:10px;height:42px;padding:0 20px;border-radius:999px;background:#ECF8F0;color:#0E7A3A;font:800 18px/1 "Inter Tight"}
.live i{width:10px;height:10px;border-radius:50%;background:#13A04A;box-shadow:0 0 0 5px rgba(19,160,74,.18)}
.live span{font:800 18px/1 "Noto Sans SC"}
.left{position:absolute;left:88px;top:222px;width:760px}
h1{font:900 66px/1.12 "Noto Sans SC";letter-spacing:.01em}
h1 em{font-style:normal;background:linear-gradient(transparent 60%,#FFD465 60% 90%,transparent 90%)}
.sub{margin-top:16px;font:600 27px/1.3 "Inter Tight";color:#5E5C57}
.pts{margin-top:34px;display:grid;gap:16px}
.pt{display:flex;align-items:center;gap:16px}
.pt .ic{flex:none;width:46px;height:46px;border-radius:14px;background:#FFF8E6;display:grid;place-items:center}
.pt .ic svg{width:22px;height:22px;color:#9A6A00}
.pt b{display:block;font:800 24px/1.2 "Noto Sans SC"}
.pt span{display:block;margin-top:3px;font:600 18px/1.25 "Inter Tight";color:#6B6B6B}
.cta{display:inline-flex;align-items:center;gap:16px;height:76px;margin-top:38px;padding:0 34px;border-radius:999px;background:#FFC21A;color:#111;box-shadow:0 18px 34px -18px rgba(180,120,0,.6)}
.cta b{font:900 28px/1 "Noto Sans SC"}
.cta span{font:700 22px/1 "Inter Tight";opacity:.75}
.cta em{font-style:normal;font:900 26px/1 "Inter Tight";letter-spacing:-.01em}
.cta svg{width:22px;height:22px}
.card{position:absolute;left:960px;top:284px;width:500px;padding:30px 30px 26px;border-radius:34px;background:#fff;transform:rotate(-3deg);
  box-shadow:0 0 0 1px #EEEEEE,0 50px 90px -40px rgba(0,0,0,.35)}
.hd{display:flex;align-items:center;gap:16px}
.tile{flex:none;width:76px;height:76px;border-radius:22px;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#FFE27A,#FFB300 58%,#E07B00);color:#fff;font:900 42px/1 "Noto Sans SC";text-shadow:0 4px 12px rgba(120,60,0,.35)}
.nm b{display:block;font:900 30px/1.1 "Noto Sans SC"}
.nm span{display:block;margin-top:4px;font:700 19px/1 "Inter Tight";color:#A3A3A3}
.new{margin-left:auto;height:34px;padding:0 14px;border-radius:999px;background:#ECF8F0;color:#0E7A3A;display:flex;align-items:center;gap:6px;font:800 16px/1 "Noto Sans SC"}
.new span{font:700 15px/1 "Inter Tight"}
.pays{margin-top:26px;display:flex;align-items:center;gap:14px;padding:18px;border-radius:22px;background:#F7F7F5}
.pays img{width:52px;height:52px;border-radius:50%}
.pays b{display:block;font:900 26px/1 "Inter Tight"}
.pays span{display:block;margin-top:6px;font:700 17px/1 "Noto Sans SC";color:#6B6B6B}
.pays span i{font-style:normal;font-family:"Inter Tight";font-weight:600;color:#8A8A8A}
.hour{position:relative;height:56px;margin-top:24px}
.hour .tr{position:absolute;left:0;right:0;top:10px;height:8px;border-radius:99px;background:#EEEEEE}
.hour .fi{position:absolute;left:0;width:76%;top:10px;height:8px;border-radius:99px;background:#FFC21A}
.hour .kn{position:absolute;left:76%;top:3px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #FFC21A}
.hour .tk{position:absolute;top:30px;font:700 14px/1 "Inter Tight";color:#A3A3A3;transform:translateX(-50%)}
.ft{margin-top:8px;padding-top:18px;border-top:1px solid #EEEEEE;display:flex;justify-content:space-between;align-items:center}
.ft b{font:800 18px/1 "Noto Sans SC"}
.ft span{font:600 16px/1 "Inter Tight";color:#8A8A8A;margin-left:6px}
.tok{position:absolute;border-radius:50%;box-shadow:0 0 0 4px #fff,0 0 0 5px #EDEDEA,0 18px 30px -14px rgba(0,0,0,.35)}
</style></head><body><div class="c">
<div class="glow"></div><div class="dots"></div>
<div class="top">
  <div class="brand">${mark}<b>金牛</b><small>jinniu</small></div>
  <div class="live"><i></i>Now live<span>· 已上线</span></div>
</div>
<div class="left">
  <h1>在金牛发币，<br>让持有人<em>赚美股</em></h1>
  <div class="sub">Launch on 金牛. Your holders earn real stocks, every hour.</div>
  <div class="pts">
    <div class="pt"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><div><b>每小时用股票分红</b><span>Holders paid in NVDAx, SPYx, TSLAx… every hour</span></div></div>
    <div class="pt"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16v10H4z"/><path d="M4 11h16"/><path d="M8 15h3"/></svg></div><div><b>你拿每笔交易的 0.15%</b><span>You earn 0.15% of every trade on your coin</span></div></div>
    <div class="pt"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg></div><div><b>0 号区块无狙击</b><span>Private bundle launch: no sniper in block 0</span></div></div>
  </div>
  <div class="cta"><b>立即发币</b><span>Launch now</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><em>jinniu.fun</em></div>
</div>
<div class="card">
  <div class="hd"><div class="tile">你</div><div class="nm"><b>你的代币</b><span>Your coin · $YOURS</span></div><div class="new">新币<span>New</span></div></div>
  <div class="pays"><img src="${stock("NVDAx")}" alt=""><div><b>NVDAx</b><span>持有人每小时分红 <i>· holders paid hourly</i></span></div></div>
  <div class="hour"><div class="tr"></div><div class="fi"></div><div class="kn"></div>
    <span class="tk" style="left:0">:00</span><span class="tk" style="left:25%">:15</span><span class="tk" style="left:50%">:30</span><span class="tk" style="left:75%">:45</span><span class="tk" style="left:100%">:00</span></div>
  <div class="ft"><div><b>创建者分成</b><span>Creator share</span></div><div><b>0.15%</b></div></div>
</div>
${FLOAT.map(([s, x, y, size]) => `<img class="tok" src="${stock(s)}" style="left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px" alt="">`).join("")}
</div></body></html>`;

(async () => {
  const out = path.join(ROOT, "brand/jinniu/social");
  const b = await chromium.launch();
  for (const [dsf, name] of [[1, "x-post-launch-1600x900.png"], [2, "x-post-launch-3200x1800.png"]]) {
    const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: dsf });
    await p.setContent(html, { waitUntil: "networkidle" });
    await p.evaluate(async () => {
      const t = document.body.innerText;
      await Promise.all(["500", "700", "800", "900"].map((w) => document.fonts.load(`${w} 40px "Noto Sans SC"`, t)));
      await document.fonts.ready;
    });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, name) });
    await p.close();
    console.log("wrote", path.join("brand/jinniu/social", name));
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
