/* Generates 红利 brand assets (emerald infinity loop on a dark tile) into apps/web.
 *   node brand/hongli/src/mark.cjs   (needs Playwright with Chromium + Google Fonts for the OG wordmark)
 * Writes: apps/web/src/app/icon.png, apple-icon.png; apps/web/public/favicon.png;
 *         apps/web/public/brand/hongli-mark-512.png; apps/web/src/app/opengraph-image.png + twitter-image.png;
 *         apps/web/src/components/honglimark.ts (the mark as a PNG data URI for the coin share route). */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../../..");
const APP = path.join(ROOT, "apps/web");

/** The infinity loop (the dividend cycle), one continuous stroke on a 240 grid. */
const LOOP = "M120 120 C120 80 92 64 76 64 C48 64 36 92 36 120 C36 148 48 176 76 176 C104 176 120 120 120 120 C120 120 136 64 164 64 C192 64 204 92 204 120 C204 148 192 176 164 176 C148 176 120 160 120 120 Z";

function tileSvg(box, { fullBleed = false } = {}) {
  const r = fullBleed ? 0 : 56, pad = fullBleed ? 0 : 8, sz = 240 - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}" viewBox="0 0 240 240">
  <defs><radialGradient id="t" cx="32%" cy="22%" r="92%"><stop offset="0" stop-color="#0E2A1D"/><stop offset="1" stop-color="#05110B"/></radialGradient>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6BFBB4"/><stop offset=".5" stop-color="#19D877"/><stop offset="1" stop-color="#06A452"/></linearGradient></defs>
  <rect x="${pad}" y="${pad}" width="${sz}" height="${sz}" rx="${r}" fill="url(#t)"/>
  ${fullBleed ? "" : `<rect x="${pad + 0.75}" y="${pad + 0.75}" width="${sz - 1.5}" height="${sz - 1.5}" rx="${r - 0.75}" fill="none" stroke="#fff" stroke-opacity=".08"/>`}
  <path d="${LOOP}" fill="none" stroke="url(#g)" stroke-width="22" stroke-linecap="round"/></svg>`;
}
const page = (inner, w, h) => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700;800;900&family=Noto+Sans+SC:wght@500;700;900&display=block"><style>*{margin:0}html,body{width:${w}px;height:${h}px}</style><body>${inner}</body>`;

const OG = page(`<div style="width:1200px;height:630px;position:relative;overflow:hidden;background:#050807;color:#EAF4EE;font-family:'Inter Tight','Noto Sans SC',sans-serif">
  <div style="position:absolute;inset:0;background:radial-gradient(760px 520px at 82% -12%,rgba(23,224,124,.22),transparent 58%)"></div>
  <div style="position:absolute;left:84px;top:150px">${tileSvg(132)}</div>
  <div style="position:absolute;left:84px;top:312px;display:flex;align-items:baseline;gap:18px"><b style="font:900 60px/1 'Noto Sans SC'">红利</b><span style="font:700 26px/1 'Inter Tight';color:#7C8F86;letter-spacing:.12em">HONGLI</span></div>
  <div style="position:absolute;left:84px;top:392px;font:900 52px/1.2 'Noto Sans SC'">土狗也分红，分的是<span style="background:linear-gradient(transparent 60%,#17E07C55 60% 92%,transparent 92%)">美股</span></div>
  <div style="position:absolute;left:84px;top:470px;font:500 27px/1.3 'Inter Tight';color:#8B9A92">Memecoins that pay you real stock dividends, every hour</div>
  <div style="position:absolute;left:84px;top:540px;display:flex;align-items:center;gap:12px;font:800 28px/1 'Inter Tight'"><i style="width:11px;height:11px;border-radius:50%;background:#17E07C;display:inline-block"></i>hongli.fun</div>
</div>`, 1200, 630);

async function shot(page, html, w, h, out, transparent) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.load("900 40px 'Noto Sans SC'", "红利土狗也分红分的是美股").then(() => document.fonts.ready));
  await page.waitForTimeout(250);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, omitBackground: !!transparent });
  console.log("wrote", path.relative(ROOT, out));
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  await shot(p, page(tileSvg(256), 256, 256), 256, 256, path.join(APP, "src/app/icon.png"), true);
  await shot(p, page(tileSvg(180), 180, 180), 180, 180, path.join(APP, "src/app/apple-icon.png"), false);
  await shot(p, page(tileSvg(32), 32, 32), 32, 32, path.join(APP, "public/favicon.png"), true);
  await shot(p, page(tileSvg(512), 512, 512), 512, 512, path.join(APP, "public/brand/hongli-mark-512.png"), false);
  await shot(p, OG, 1200, 630, path.join(APP, "src/app/opengraph-image.png"), false);
  fs.copyFileSync(path.join(APP, "src/app/opengraph-image.png"), path.join(APP, "src/app/twitter-image.png"));
  console.log("wrote apps/web/src/app/twitter-image.png");
  // The mark as a PNG data URI for the coin share route (og/coin/[mint]).
  const iconBuf = fs.readFileSync(path.join(APP, "src/app/icon.png"));
  fs.writeFileSync(path.join(APP, "src/components/honglimark.ts"),
    `/* Generated: the 红利 mark (emerald infinity on a dark tile) as a PNG data URI, for next/og share images\n * (resvg rasterizes it, no font needed). brand/hongli/src/mark.cjs writes this. Do not edit by hand. */\nexport const MARK_PNG_URI = "data:image/png;base64,${iconBuf.toString("base64")}";\n`);
  console.log("wrote apps/web/src/components/honglimark.ts");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
