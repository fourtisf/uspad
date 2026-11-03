/**
 * The site's share image for 金牛 (owner, 2026-11-03): what X, Telegram and others show for a link to the
 * site. White, the porcelain mark, the name, the hero line in Chinese with the English under it, and the
 * domain. Writes brand/jinniu/social/og-1200x630.png and copies it to apps/web/src/app/opengraph-image.png
 * and twitter-image.png. Run after mark.cjs (it reads brand/jinniu/mark.svg): node brand/jinniu/src/social.cjs
 * Needs Playwright with Chromium and Google Fonts (Noto Sans SC, Inter Tight).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../../..");
const mark = fs.readFileSync(path.join(ROOT, "brand/jinniu/mark.svg"), "utf8").trim();
const sized = (s) => mark.replace("<svg ", `<svg width="${s}" height="${s}" style="display:block" `);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Noto+Sans+SC:wght@500;700;900&display=swap">
<style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;background:#fff;color:#0E0E0E;font-family:"Inter Tight","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
.c{position:relative;width:1200px;height:630px;padding:72px 80px;display:flex;flex-direction:column}
.c::before{content:"";position:absolute;right:-160px;top:-160px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#F4F4F1,transparent 68%)}
.brand{position:relative;display:flex;align-items:center;gap:18px}
.brand b{font:900 52px/1 "Noto Sans SC";letter-spacing:.04em}
.brand small{font:600 22px/1 "Inter Tight";color:#9A968D;letter-spacing:.06em;margin-left:4px}
h1{position:relative;margin:auto 0 0;font:900 84px/1.12 "Noto Sans SC";letter-spacing:.01em}
h1 em{font-style:normal;background:linear-gradient(transparent 62%,#FFD465 62% 90%,transparent 90%)}
p{position:relative;margin:18px 0 0;font:500 30px/1.3 "Inter Tight";color:#5E5C57}
.foot{position:relative;display:flex;align-items:center;gap:14px;margin-top:34px;font:600 24px "Inter Tight";color:#0E0E0E}
.foot i{width:10px;height:10px;border-radius:50%;background:#FFC21A}
.big{position:absolute;right:80px;top:150px;filter:drop-shadow(0 30px 40px rgba(40,40,30,.18))}
</style></head><body><div class="c">
<div class="brand">${sized(76)}<b>金牛</b><small>jinniu</small></div>
<div class="big">${sized(300)}</div>
<h1>土狗也分红，<br>分的是<em>美股</em>。</h1>
<p>Memecoins that pay dividends in real stocks, every hour.</p>
<div class="foot"><i></i>jinniu.fun</div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const out = path.join(ROOT, "brand/jinniu/social/og-1200x630.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  for (const f of ["opengraph-image.png", "twitter-image.png"]) fs.copyFileSync(out, path.join(ROOT, "apps/web/src/app", f));
  console.log("wrote brand/jinniu/social/og-1200x630.png and the site's opengraph-image.png and twitter-image.png");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
