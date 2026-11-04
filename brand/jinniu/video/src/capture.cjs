/**
 * Captures the pages the review video shows, from the site running in demo mode (API_MODE=mock: the
 * numbers are demo data, and the video says so). 2x screenshots, so the camera can zoom in and stay sharp.
 *
 *   node brand/jinniu/video/src/capture.cjs <out-dir> [base=http://127.0.0.1:3000]
 */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const out = process.argv[2];
const base = process.argv[3] || "http://127.0.0.1:3000";
if (!out) throw new Error("usage: capture.cjs <out-dir> [base]");
fs.mkdirSync(out, { recursive: true });
const host = new URL(base).hostname;

async function ctxFor(b, { lang = "zh", updown = "intl", mobile = false } = {}) {
  const opts = mobile
    ? { ...devices["iPhone 13"], deviceScaleFactor: 3 }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
  const ctx = await b.newContext({ ...opts, locale: lang === "zh" ? "zh-CN" : "en-US" });
  await ctx.addCookies([
    { name: "lang", value: lang, domain: host, path: "/" },
    { name: "updown", value: updown, domain: host, path: "/" },
  ]);
  return ctx;
}
const settle = async (p, ms = 1200) => {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(ms);
};
// Where the camera looks: each target's box in CSS pixels of the full page, saved in layout.json.
const TARGETS = {
  home: { pool: ".card.pool", feed: ".card.feed", stats: ".stats", bento: ".bento", all: "#all", chips: "#all .chips",
          grid: ".grid", card: ".grid .cc", chg: ".grid .cc .chg", hero: ".hero", top: "header.top", lang: "header.top .lang" },
  coin: { chead: ".chead", kpis: ".kpis", chart: ".chartc", tabs: ".tabsc", trade: ".card.trade", divc: ".card.divc", ring: ".divc .ring" },
  create: { sec1: ".fsec", stocks: ".stocks", drop: ".drop", preview: "#preview", checks: ".card.checks", launch: "#launchBtn", aside: "aside.sticky" },
  payouts: { tiles: ".tiles", meter: ".meter", rcard: ".rcard" },
};
const layout = {};
async function boxes(p, name, kind) {
  layout[name] = await p.evaluate((sel) => {
    const o = { page: { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight } };
    for (const [k, q] of Object.entries(sel)) {
      const el = document.querySelector(q);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      o[k] = { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    }
    return o;
  }, TARGETS[kind]);
}

async function shot(p, name, full = true) {
  // From the top: a full-page shot taken while scrolled draws the sticky header half way down.
  if (full) { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400); }
  await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: full });
  console.log("captured", name);
}

(async () => {
  const b = await chromium.launch();
  // A coin still on its bonding curve and up today: its trade box shows the curve's fee (1.25%, 0.50% to
  // holders), the same split the video's fee scene shows. A graduated coin shows the Raydium pool's fee.
  const coins = await (await fetch(`${base.replace(":3000", ":4000")}/api/coins?sort=trending&limit=30`)).json();
  const pick = coins.items.find((c) => c.status === "live" && c.progress >= 0.5 && c.change24hPct > 0) ?? coins.items[0];
  const mint = pick.mint;
  console.log("coin page:", pick.name, pick.ticker);

  // desktop, Chinese (the site's default)
  let ctx = await ctxFor(b);
  let p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "home_zh"); await boxes(p, "home_zh", "home");
  await p.goto(`${base}/coin/${mint}`, { waitUntil: "networkidle" }); await settle(p, 2000); await shot(p, "coin_zh"); await boxes(p, "coin_zh", "coin");
  await p.locator(".tabs button, .tabs [role=tab]").nth(2).click().catch(() => {});
  await settle(p, 800); await shot(p, "coin_zh_payouts");
  await p.goto(`${base}/payouts`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "payouts_zh"); await boxes(p, "payouts_zh", "payouts");
  await p.goto(`${base}/how`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "how_zh");

  // the create form, empty and then filled in
  await p.goto(`${base}/create`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "create_empty"); await boxes(p, "create_empty", "create");
  const pic = path.join(out, "upload-pic.png");
  const pp = await ctx.newPage();
  await pp.setViewportSize({ width: 512, height: 512 });
  await pp.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@900&display=swap">
    <div style="width:512px;height:512px;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#FFE27A,#FFB300 55%,#E07B00);font:900 300px/1 'Noto Sans SC';color:#fff;text-shadow:0 10px 30px rgba(120,60,0,.35)">招</div>`, { waitUntil: "networkidle" });
  await pp.evaluate(() => document.fonts.ready);
  await pp.screenshot({ path: pic }); await pp.close();
  await p.locator("#fName").fill("招财猫");
  await p.locator("#fTick").fill("ZHAOCAI");
  await p.locator("#fDesc").fill("每小时分红的招财猫，分的是特斯拉。");
  await p.locator("#fImg").setInputFiles(pic);
  await p.locator('.stocks [role=radio]', { hasText: "TSLAx" }).first().click();
  await p.locator('button[aria-label="0.5 SOL"]').click().catch(() => {});
  await settle(p, 3500); await shot(p, "create_filled"); await boxes(p, "create_filled", "create");
  await ctx.close();

  // desktop, English, and red-up colours
  ctx = await ctxFor(b, { lang: "en" });
  p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "home_en"); await boxes(p, "home_en", "home");
  await ctx.close();
  ctx = await ctxFor(b, { updown: "cn" });
  p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "home_zh_cn"); await boxes(p, "home_zh_cn", "home");
  await ctx.close();

  // phone
  ctx = await ctxFor(b, { mobile: true });
  p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" }); await settle(p); await shot(p, "m_home", false);
  await p.evaluate(() => document.querySelector("#all")?.scrollIntoView());
  await settle(p, 600); await shot(p, "m_grid", false);
  await p.goto(`${base}/coin/${mint}`, { waitUntil: "networkidle" }); await settle(p, 2000); await shot(p, "m_coin", false);
  await p.locator(".tradebar button").first().click();
  await settle(p, 900); await shot(p, "m_sheet", false);
  await ctx.close();
  fs.writeFileSync(path.join(out, "layout.json"), JSON.stringify(layout, null, 1));
  console.log("wrote layout.json");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
