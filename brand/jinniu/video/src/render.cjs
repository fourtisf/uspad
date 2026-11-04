/**
 * Renders stage.html frame by frame into an MP4 with the soundtrack.
 *
 *   node brand/jinniu/video/src/render.cjs <assets-dir> <music.wav> <out.mp4> [fps=60]
 *   node brand/jinniu/video/src/render.cjs <assets-dir> --stills <out-dir> <t1,t2,...>   (frames to look at)
 *
 * H.264 High, yuv420p, CRF 17, AAC 192k, loudness-normalized to -14 LUFS (two-pass loudnorm), faststart.
 */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../..");
const STAGE = path.join(__dirname, "stage.html");
const SCREENS = ["home_zh", "coin_zh", "create_empty", "create_filled", "payouts_zh", "home_en", "home_zh_cn"];

const pngSize = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

async function openStage(assets) {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto("file://" + STAGE, { waitUntil: "networkidle" });
  const params = {
    assets: "file://" + path.resolve(assets),
    stocks: "file://" + path.join(ROOT, "apps/web/public/stocks"),
    mark: "file://" + path.join(ROOT, "brand/jinniu/mark.svg"),
    layout: JSON.parse(fs.readFileSync(path.join(assets, "layout.json"), "utf8")),
    screens: SCREENS.map((n) => [n, ...pngSize(path.join(assets, n + ".png"))]),
  };
  const { duration } = await page.evaluate((p) => window.init(p), params);
  await page.waitForTimeout(600);
  return { b, page, duration };
}

(async () => {
  const [assets, a2, a3, a4] = process.argv.slice(2);
  if (a2 === "--stills") {
    const { b, page } = await openStage(assets);
    fs.mkdirSync(a3, { recursive: true });
    for (const t of a4.split(",").map(Number)) {
      await page.evaluate((x) => window.seek(x), t);
      await page.screenshot({ path: path.join(a3, `t${t.toFixed(2).padStart(6, "0")}.png`) });
    }
    await b.close();
    return;
  }
  const music = a2, out = a3, fps = Number(a4 || 60);
  // two-pass loudness normalization: measure, then apply linearly
  const res = spawn("ffmpeg", ["-hide_banner", "-i", music, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
  let errTxt = "";
  res.stderr.on("data", (d) => (errTxt += d));
  await new Promise((r) => res.on("close", r));
  const m = JSON.parse(errTxt.slice(errTxt.lastIndexOf("{")));
  const af = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;

  const { b, page, duration } = await openStage(assets);
  const frames = Math.round(duration * fps);
  const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y",
    "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-i", music,
    "-map", "0:v", "-map", "1:a", "-af", af,
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate((x) => window.seek(x), i / fps);
    const buf = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % (fps * 5) === 0) console.log(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg exit " + c)))));
  await b.close();
  console.log(`${out}: ${frames} frames at ${fps} fps, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
