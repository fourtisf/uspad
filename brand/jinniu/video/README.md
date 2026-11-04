# 金牛 review video

`jinniu-review-1080p.mp4`: a 72-second review of the site and its features, 1920×1080 at 60 fps, H.264 with AAC, loudness-normalized to −14 LUFS for X, YouTube and Telegram. Copy in Chinese and English (owner, 2026-11-04: "video review website dan fitur-fiturnya, premium, ada bahasa Inggris dan China"). `poster.png` (1280×720) is its thumbnail, the intro frame.

| Time | Scene | What it shows |
|---|---|---|
| 0:00 | Intro | The mark, 金牛 jinniu, 土狗也分红，分的是美股 / Memecoins that pay you real stock dividends |
| 0:04.8 | Idea | Every trade buys a tokenized stock (NVDAx, SPYx, TSLAx…), and the hour line pays every holder |
| 0:12 | Home | The round's pool, 刚刚到账, 精选, browsing by stock |
| 0:21.6 | Coin page | The chart, the trade box (1.25%, 0.50% to holders), the countdown to the next payout |
| 0:31.2 | Create | Name, ticker and picture; the stock holders earn; the preview; private bundle launch |
| 0:40.8 | Payouts | The totals, the hour, the receipts on chain |
| 0:48 | Fees | 1.25% a trade: holders 0.50%, 金牛 0.35%, creator 0.15%, Raydium 0.25% (on the curve) |
| 0:52.8 | Phones | The dock, browsing by stock, the trade sheet |
| 1:00 | Languages | 中 / EN and green or red up |
| 1:04.8 | Outro | jinniu.fun, 创建你的代币 / Launch your coin, the disclaimer |

**Honest by design.** The site is filmed in demo mode (`API_MODE=mock`): the coins and numbers are demo data. The browser frame says "Demo data · 演示数据" in every site scene, and the outro says so with the site's own disclaimer. The fee split is the real one, from 金牛's PlatformConfig (docs/VERIFIED.md item 33). No claim is made that the site doesn't make itself: the create scene leaves out the demo's cost lines (the mock config says launching is free; on the live site the creator's wallet pays the create cost).

**The music** is synthesized by `src/music.py` (numpy only: no samples, nothing licensed): 100 BPM in C, Fmaj7 / G6 / Am7 / Em7, and the scenes change on its bar lines.

## Make it again

From the repo root, with the site built and running in demo mode (`.env` with `API_MODE=mock`; `node --env-file=../../.env dist/server.js` in `apps/api`, `next start` in `apps/web`):

```bash
node brand/jinniu/video/src/capture.cjs /tmp/jinniu-video/assets          # 2x screenshots and layout.json
python3 brand/jinniu/video/src/music.py /tmp/jinniu-video/music.wav       # the soundtrack
node brand/jinniu/video/src/render.cjs /tmp/jinniu-video/assets /tmp/jinniu-video/music.wav brand/jinniu/video/jinniu-review-1080p.mp4 60
```

`render.cjs <assets> --stills <dir> 3.6,14.4,…` renders single frames to check before the full render (about 10 minutes for 4,320 frames).

| File | What it does |
|---|---|
| `src/capture.cjs` | Screenshots home, coin, create (empty and filled in), payouts, how, English, red-up and phone views at 2x, and saves each target's box in `layout.json` |
| `src/stage.html` | The 1920×1080 stage: titles, the browser frame with a camera that pans and zooms on the screenshots, highlights, callouts, the fee bar, the phones. `seek(t)` draws any moment |
| `src/render.cjs` | Steps through every frame, pipes it to ffmpeg with the music (two-pass loudnorm) |
| `src/music.py` | The soundtrack |
