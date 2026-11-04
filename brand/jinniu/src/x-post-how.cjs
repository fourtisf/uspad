/**
 * 金牛's second X post (owner, 2026-11-04): how holders get paid, as one 16:9 picture (X shows 16:9 uncropped
 * in the timeline). Three steps, the way the how page tells it, and the real split of a 1.25% trade on the
 * curve (VERIFIED item 33). The $10 minimum is the live config (MIN_HOLDER_USD, go-live.sh). No demo numbers.
 *
 *   node brand/jinniu/src/x-post-how.cjs   → brand/jinniu/social/x-post-how-1600x900.png and x-post-how-3200x1800.png
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const png = (f) => "data:image/png;base64," + fs.readFileSync(path.join(ROOT, f)).toString("base64");
const stock = (s) => png(`apps/web/public/stocks/${s}.png`);
const mark = fs.readFileSync(path.join(ROOT, "brand/jinniu/mark.svg"), "utf8").trim().replace("<svg ", '<svg width="58" height="58" style="display:block" ');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&family=Noto+Sans+SC:wght@500;700;800;900&display=block">
<style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:900px;overflow:hidden;background:#fff;color:#0A0A0A;font-family:"Inter Tight","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.c{position:relative;width:1600px;height:900px;padding:56px 88px 0}
.glow{position:absolute;left:50%;top:330px;width:1500px;height:700px;margin-left:-750px;background:radial-gradient(closest-side,#FFF7E0,rgba(255,247,224,0))}
.top{position:relative;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:14px}
.brand b{font:900 38px/1 "Noto Sans SC";letter-spacing:.03em}
.brand small{font:600 20px/1 "Inter Tight";color:#A3A3A3}
.tag{display:flex;align-items:center;gap:10px;height:42px;padding:0 20px;border-radius:999px;box-shadow:inset 0 0 0 1px #E2E2E2;font:800 18px/1 "Noto Sans SC"}
.tag span{font:600 17px/1 "Inter Tight";color:#6B6B6B}
h1{position:relative;margin-top:30px;font:900 62px/1.1 "Noto Sans SC";letter-spacing:.01em}
h1 em{font-style:normal;background:linear-gradient(transparent 60%,#FFD465 60% 90%,transparent 90%)}
.sub{position:relative;margin-top:12px;font:600 27px/1.2 "Inter Tight";color:#6B6B6B}
.steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:44px;margin-top:38px}
.step{position:relative;height:306px;padding:26px 28px;border-radius:30px;background:#fff;box-shadow:0 0 0 1px #EEEEEE,0 26px 50px -34px rgba(0,0,0,.28)}
.no{font:900 46px/1 "Inter Tight";color:#FFC21A;letter-spacing:-.02em}
.step b{display:block;margin-top:14px;font:900 30px/1.2 "Noto Sans SC"}
.step p{margin-top:6px;font:600 20px/1.3 "Inter Tight";color:#6B6B6B}
.vis{position:absolute;left:28px;right:28px;bottom:26px;height:66px;display:flex;align-items:center}
.arrow{position:absolute;top:50%;right:-36px;width:28px;height:28px;margin-top:-14px;border-radius:50%;background:#0A0A0A;display:grid;place-items:center;z-index:2}
.arrow svg{width:14px;height:14px}
.coins{display:flex}
.coins img{width:54px;height:54px;border-radius:50%;box-shadow:0 0 0 3px #fff,0 8px 16px -8px rgba(0,0,0,.4);margin-right:-12px}
.more{margin-left:26px;height:38px;padding:0 16px;border-radius:999px;background:#F5F5F5;display:flex;align-items:center;gap:6px;white-space:nowrap;font:800 17px/1 "Noto Sans SC";color:#3A3A3A}
.more span{font:600 16px/1 "Inter Tight";color:#8A8A8A}
.flow{display:flex;align-items:center;gap:14px}
.flow img{width:50px;height:50px;border-radius:50%;box-shadow:0 0 0 1px #EEE}
.flow .pct{height:44px;padding:0 16px;border-radius:999px;background:#FFF8E6;color:#9A6A00;display:flex;align-items:center;font:900 24px/1 "Inter Tight"}
.flow svg{width:26px;height:26px;color:#A3A3A3}
.hour{position:relative;width:100%;height:66px}
.hour .tr{position:absolute;left:0;right:0;top:14px;height:8px;border-radius:99px;background:#EEEEEE}
.hour .fi{position:absolute;left:0;width:100%;top:14px;height:8px;border-radius:99px;background:#FFC21A}
.hour .kn{position:absolute;right:-11px;top:7px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #FFC21A}
.hour .tk{position:absolute;top:36px;font:700 15px/1 "Inter Tight";color:#A3A3A3;transform:translateX(-50%)}
.fees{position:relative;margin-top:58px;display:grid;grid-template-columns:300px 1fr;gap:34px;align-items:center}
.fees .lab b{display:block;font:900 30px/1.1 "Noto Sans SC"}
.fees .lab span{display:block;margin-top:6px;font:600 19px/1.2 "Inter Tight";color:#6B6B6B}
.bar{display:flex;height:40px;border-radius:14px;overflow:hidden}
.legs{display:grid;grid-template-columns:repeat(4,1fr);margin-top:14px}
.legs div{display:flex;align-items:baseline;gap:8px;white-space:nowrap}
.legs i{width:12px;height:12px;border-radius:3px;align-self:center}
.legs b{font:900 24px/1 "Inter Tight"}
.legs span{font:700 17px/1 "Noto Sans SC"}
.legs small{font:600 15px/1 "Inter Tight";color:#8A8A8A}
.foot{position:absolute;left:88px;right:88px;bottom:40px;display:flex;justify-content:space-between;align-items:center}
.foot .url{display:flex;align-items:center;gap:12px;font:900 30px/1 "Inter Tight";letter-spacing:-.01em}
.foot .url i{width:12px;height:12px;border-radius:50%;background:#FFC21A}
.foot .note{text-align:right;font:500 15px/1.5 "Inter Tight";color:#A3A3A3}
</style></head><body><div class="c">
<div class="glow"></div>
<div class="top">
  <div class="brand">${mark}<b>金牛</b><small>jinniu</small></div>
  <div class="tag">玩法<span>How it works</span></div>
</div>
<h1>每一笔交易，都在给持有人<em>买美股</em></h1>
<div class="sub">How 金牛 pays you, every hour</div>
<div class="steps">
  <div class="step">
    <div class="no">01</div><b>发币，选一只股票</b><p>Launch a coin, pick a stock</p>
    <div class="vis"><div class="coins">${["NVDAx", "SPYx", "TSLAx", "AAPLx", "QQQx"].map((s) => `<img src="${stock(s)}" alt="">`).join("")}</div><div class="more">更多<span>more</span></div></div>
    <div class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
  </div>
  <div class="step">
    <div class="no">02</div><b>每笔交易的 0.50% 买入它</b><p>0.50% of every trade buys that stock</p>
    <div class="vis"><div class="flow"><img src="${stock("SOL")}" alt=""><div class="pct">0.50%</div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><img src="${stock("TSLAx")}" alt=""></div></div>
    <div class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
  </div>
  <div class="step">
    <div class="no">03</div><b>每小时按持仓发给持有人</b><p>Paid to every holder each hour, by holdings</p>
    <div class="vis"><div class="hour"><div class="tr"></div><div class="fi"></div><div class="kn"></div>
      <span class="tk" style="left:0">:00</span><span class="tk" style="left:25%">:15</span><span class="tk" style="left:50%">:30</span><span class="tk" style="left:75%">:45</span><span class="tk" style="left:100%">:00</span></div></div>
  </div>
</div>
<div class="fees">
  <div class="lab"><b>每笔交易 1.25%</b><span>1.25% a trade, split in the open</span></div>
  <div>
    <div class="bar"><div style="width:40%;background:#FFC21A"></div><div style="width:28%;background:#0A0A0A"></div><div style="width:12%;background:#8A8A8A"></div><div style="width:20%;background:#D9D9D9"></div></div>
    <div class="legs">
      <div><i style="background:#FFC21A"></i><b>0.50%</b><span>持有人</span><small>Holders</small></div>
      <div><i style="background:#0A0A0A"></i><b>0.35%</b><span>金牛</span><small>jinniu</small></div>
      <div><i style="background:#8A8A8A"></i><b>0.15%</b><span>创建者</span><small>Creator</small></div>
      <div><i style="background:#D9D9D9"></i><b>0.25%</b><span>Raydium</span></div>
    </div>
  </div>
</div>
<div class="foot">
  <div class="url"><i></i>jinniu.fun</div>
  <div class="note">持有 $10 以上即可分红 · 内盘期间的费率；毕业后按 Raydium 池子的费率<br>Hold $10 or more to get paid · On the bonding curve; after graduation, the Raydium pool's fees apply</div>
</div>
</div></body></html>`;

(async () => {
  const out = path.join(ROOT, "brand/jinniu/social");
  const b = await chromium.launch();
  for (const [dsf, name] of [[1, "x-post-how-1600x900.png"], [2, "x-post-how-3200x1800.png"]]) {
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
