# Brand

The brand is **金牛 jinniu** (owner, 2026-11-02; below). It isn't live yet: until its prototype is approved and installed, the site at hwai.ai still says hwai.

## The old brands were deleted (owner, 2026-11-02)

The owner asked to delete every uspad and hwai brand. Gone from the repo, all still in git history (the last commit that has them is `57a8482`):

- `brand/` as it was: the original Divvy kit (logos, coin, icons, share image, the brand sheet `brand/index.html`) and the six Divvy logo concepts (`brand/concepts/`).
- `brand/uspad/`: the uspad identity, its posts, articles and videos.
- `brand/hwai/`: the hwai identity (the brush seal and wordmark, the generators `niu.py` and `glyphs.py` with the Ma Shan Zheng outlines in `glyphs.json`), its share images, X photo and header, the "Meet hwai" article and the intro video with its soundtrack and renderer.
- `prototype/divvy-prototype.html` and `prototype/hwai-a-prototype.html`, the retired designs.
- `apps/web/public/brand/hwai-lockup.svg`, which nothing used.

The 金牛 mark is the brush 牛, so its generator can start from `brand/hwai/src/niu.py` and `glyphs.json` in that commit (`git show 57a8482:brand/hwai/src/glyphs.json`).

## What still says hwai or uspad, and why

These go when 金牛 is installed, not before, so the live site and what's on chain don't break:

- **The live site** (hwai.ai): the name from `BRAND` (`packages/shared/src/brand.ts`) in every user-facing string, the API's messages, the wallet sign-in statement, the worker's alerts and new coins' `createdOn` metadata; the brush seal in `apps/web/src/components/Mark.tsx` and `markPaths.ts`; the favicon, app icons and share image in `apps/web/src/app/`; and each coin's share image (`app/og/coin/[mint]/route.tsx`), which draws the seal, the wordmark and hwai.ai. Its approved design stays `prototype/hwai-niu-prototype.html` (CLAUDE.md rule 1) until then.
- **`apps/web/public/brand/hwai-mark-512.png`**: the picture of hwai's PlatformConfig on mainnet points to `https://hwai.ai/brand/hwai-mark-512.png` (VERIFIED item 31). Since 2026-11-03 the file holds the 金牛 mark, which Raydium shows after the next deploy without a transaction (it may cache the old one for a while); renaming the PlatformConfig (`go-live.sh platform-info`) is a mainnet transaction and needs the owner's approval.
- **`apps/web/public/brand/uspad-mark-512.png`**: uspad's PlatformConfig, on uspad's own server, points to `https://uspad.fun/brand/uspad-mark-512.png` (VERIFIED item 27). uspad.fun, $USPAD and its coins stay on that server (owner, 2026-10-31).
- **$HWAI** (pump.fun, `9Qh9WLVQ69J2C7oeYx45yKrHiV8Dsn7hVdkRXiBYpump`): the site shows it through `go-live.sh token-ca` (build-time `NEXT_PUBLIC_TOKEN_CA`). It will be hidden (`go-live.sh token-ca off`) until the owner launches the new official token.
- **Internal names**: `@divvy/*` packages, `DIVVY_*` env vars, `divvy:` Redis keys and server paths like `/root/uspad-keys`. Users don't see them.

X and Telegram handles are build-time env (`NEXT_PUBLIC_X_HANDLE`, `NEXT_PUBLIC_TELEGRAM_HANDLE`, set with `go-live.sh socials <x> <tg>`): while unset, the site shows no X or Telegram links.

How the earlier brands came about (Divvy, uspad.fun on 2026-10-26, hwai.ai with design A on 2026-10-31, design 牛 and the brush seal on 2026-11-01) is in this file's history at `57a8482`.

## A Chinese name again: proposals (2026-11-02, not chosen yet)

The owner asked for a new look and brand with a Chinese name, and for the references behind it. [`brand/proposals/2026-11-02/index.html`](../brand/proposals/2026-11-02/index.html) is the board (in Indonesian, with each concept's home page mocked in Chinese on the prototype's demo data; `mock-*.png` are screenshots). Nothing on the site changes until the owner picks a concept and approves its full prototype (CLAUDE.md rule 1).

| | Name | Look | References |
|---|---|---|---|
| A (recommended) | **金牛** jīnniú, "golden bull"; 现金牛 is Chinese for "cash cow". Keeps the 牛 seal, recast as a milled gold coin. | Black and gold broker: Noto Serif SC headlines, the round's pool counting up, past rounds as gold bars, a watchlist table. | 富途牛牛 / moomoo, Robinhood Gold, 中国证券报 and 财新 front pages, hwai's X photo. |
| B | **发发** fāfā: 发 is "prosper" and "pay out"; 88. | Hong Kong neon at night: neon sign marks, an LED tape, a live payout board, tilted sign cards with stickers. | Hong Kong neon signs (M+), Chungking Express, 中国李宁, pump.fun and GMGN. |
| C | **红利** hónglì, the standard word for a dividend (红利ETF). | Light, the 余额宝 way: white cards, a pool counting up, a round progress bar, round stock icons. | 支付宝 余额宝, 微信支付, 中证红利, Revolut and Wise. |

Risks the board names: 金牛奖 (the 中国证券报 fund award) may hold the mark in finance; FAFA and 发发发 are already tickers of small Solana tokens; 红利 is a generic word and "hongli" is also Manulife's Hong Kong name (宏利). Dropped names: 躺赚 (reads as promised income), 牛牛 (富途牛牛), 聚宝 (蚂蚁聚宝), 元宝 (腾讯元宝), 分分 (分分彩, an illegal lottery), 股神 (Buffett's nickname), 财神 (crowded), 摇钱树 (too long). Domain availability wasn't checked: WHOIS and RDAP are blocked from the build environment.

**v2 (same day).** The owner found the v1 mocks ugly: they were today's layout recoloured, with letter avatars. [`v2.html`](../brand/proposals/2026-11-02/v2.html) changes how the site is used instead: the home page is the coin feed in three columns, 新上线 (new), 即将毕业 (about to graduate) and 已毕业 (graduated), the way GMGN, Axiom and pump.fun work, with a thin banner, quick buy on every card (the amount set once per column, still confirmed in the wallet and checked by the server), the wallet's own dividends always in view (我的分红: today, this hour, per coin), the round's pool with a ring to the next round, a 24-hour leaderboard, and new coins showing "首轮 42:50" rather than a $0 dividend. On phones: a tab bar with 创建 in the middle, and the coin page's buy box as a bottom sheet with a dividend estimate marked 估算. One layout, three skins (金牛 black and gold, 发发 neon, 红利 light), switched on the page. Coin pictures are emoji stand-ins for creators' uploads.

**v3 (same day): clean, like Pons.** The owner sent screenshots of the Pons launchpad (ponsfamily.com/launchpad) and asked for that clean look. [`v3-clean.html`](../brand/proposals/2026-11-02/v3-clean.html) takes its style, not its brand: a white page with room, a slim icon sidebar, big 热门 tiles with bold market caps, tabs (市值, 新上线, 活跃, 即将毕业, 已毕业, 分红最多) over one table, a stock filter pill, list or grid, a light and dark theme, and one bright button (创建代币). The dividend stays in view quietly: a pill with the round's pool and the clock, 累计分红, 我的分红, each coin's stock and 24-hour payout, and "首轮 42:50" for a coin that hasn't paid yet. Name switch on the page (金牛 gold button, 发发 pink, 红利 black with a vermilion seal). Coin pictures are stand-ins; the create page would ask for a square picture of at least 512 px, since this look depends on good pictures.

**v4 (same day): clean like Pons, but its own.** v3 was too close to Pons ("not copy-paste, make it a bit different"). [`v4-clean.html`](../brand/proposals/2026-11-02/v4-clean.html) keeps only the clean feel (white, room, big pictures, one bright button, a light and dark theme) and builds its own page around the hourly dividend: a top bar with the nav as a centred pill (Pons: an icon sidebar); the hero is the round's pool as one big number with the hour as a line from :00 to :00 and 刚刚到账, the payouts that just landed, beside it (Pons: a trending row); the totals in a thin row; 精选 as a bento, the top coin large with its chart, stock, 24-hour payout and holders, four more small (Pons: square tiles behind arrows); 全部代币 browsed by dividend stock with chips and sorted in a pill (Pons: underlined tabs and a pair filter); coins as cards with market cap, a line, the stock and the 24-hour payout or the curve and "首轮 42:50" (Pons: a table); on phones, a floating dock with the + to launch.

A rename also touches: $HWAI (launched on pump.fun the same day; its name stays HWAI, so the owner decides whether it stays the official token), the hwai.ai domain (kept as a redirect), the PlatformConfig's name (a mainnet transaction, owner approval), @HwaiPad and Telegram, the intro video, the article and every share image. The marks on the board are sketches set in OFL Google Fonts; the chosen one gets drawn as paths, like `niu.py` draws the seal.

## 金牛 jinniu (owner, 2026-11-02)

After the proposals above the owner asked what set 发发 and 红利 apart (only the name, mark, meaning and button colour; the look is the same) and confirmed they want a new brand, not hwai. They picked **金牛 jinniu**, and for $HWAI, a new official token later.

- **Name:** 金牛, written jinniu in Latin. 牛 stays from the hwai seal; the mark is the brush 牛 in white (below, "The white mark"). The prototype sketches it in Ma Shan Zheng from Google Fonts; the final mark and wordmark get drawn as paths (starting from the deleted `niu.py`, see above), with the icons and share images regenerated.
- **Look:** v4 above, as a full prototype: [`prototype/jinniu-prototype.html`](../prototype/jinniu-prototype.html), one file with every page (首页, 代币, 创建代币, 分红记录, 玩法, 我的) behind its links, white only (the owner, after seeing it: "warna putih aja clean"; the dark theme and its button were dropped, the greys made neutral, cards drawn with hairlines instead of shadows and the hero's gold glow removed), the 中 / EN switch and the up/down colour switch. On phones the nav moves to a floating dock with + to launch, the coin page's trade box opens as a bottom sheet from 买入 / 卖出, and coin cards turn into rows. Faces: Inter Tight for Latin and numbers, Noto Sans SC for Chinese. Gold `#FFC21A` for the one button and the brand, green up, red down, dark gold for anything holders are paid. Copy follows the current app: launches cost 0.02 SOL plus the coin's create cost; the fee split is the prototype's demo split.
- **$HWAI:** hidden from the new site (`go-live.sh token-ca off`) until the owner launches a new official token and sends its CA (`go-live.sh token-ca <CA>`). The hero shows "官方代币：即将公布" meanwhile.
- **Domain:** **jinniu.fun**, bought by the owner at Hostinger on 2026-11-02 (one year, to 2027-11-02, with privacy protection). Not pointed at the server yet.
- **Open:** the PlatformConfig's name, web and picture (a mainnet transaction, owner approval), the X and Telegram handles, the intro video, the article and the share images.

Until the owner approves the prototype, the site and CLAUDE.md rule 1 stay on design 牛 and the name hwai.

### Logo concepts for 金牛 (2026-11-02)

The owner asked for premium logo references. [`brand/proposals/2026-11-02/logos/index.html`](../brand/proposals/2026-11-02/logos/index.html) shows four, each on white and black, as an app icon, a token avatar, a 32 and 16 px favicon and in the header (`A.png` to `D.png`):

- **A, recommended: a gold coin with a brush 牛**: a milled edge and a bead ring like a bullion coin (references: the China Panda gold coin, the Krugerrand, brush calligraphy, the old 牛 seal).
- **B, 金牛座**: 金牛 is also Taurus, and the Taurus sign is a circle with horns: here the circle is a gold cash coin with a square hole (方孔钱) under a crescent of horns, the cash cow in one shape.
- **C, a black and gold seal**: 金牛 in a serif read top to bottom, like a traditional seal (印章), the Palace Museum's seals or Moutai's label; black and gold, not red.
- **D, a luxury wordmark**: 金牛 in a heavy serif and "jinniu" spaced wide, with a thin gold rule, after the way Rolex, Cartier and Hermès set their names; the icon is a serif 牛 in gold on black.

All are sketches with OFL Google Fonts glyphs (Ma Shan Zheng, Noto Serif SC, Cormorant Garamond) and SVG shapes; the chosen one gets drawn as paths. The named brands are style references only.

### The white mark (owner, 2026-11-02)

After the four concepts the owner said: "jangan koin emas, yang putih aja logonya" (no gold coin, a white logo), and then "putih aja": white everywhere. [`brand/proposals/2026-11-02/logos/white.html`](../brand/proposals/2026-11-02/logos/white.html) (`W1.png`) draws it: the brush 牛 in glossy white, like porcelain, on a soft grey tile (`#F3F3F1` to `#DADAD6`), with a specular bevel and a soft shadow. It sits in the prototype's header, footer and 我的 page. From 16 to 48 px (favicons) the same white 牛 sits on a deeper grey tile (`#D9D9D5` to `#B9B9B4`) with a crisper shadow, so it still reads. A white-on-black form was drawn and dropped. The X and Telegram photos and token avatars use the white mark too.

The gold stays for the 创建代币 button and for what holders are paid.

**On the site (owner, 2026-11-03: "kirimkan saya logo nya premium serta upload ke webnya").** The mark is final and drawn as paths: `brand/jinniu/src/mark.cjs` takes the brush 牛 outline the app already had (`NIU` in `apps/web/src/components/markPaths.ts`, Ma Shan Zheng, SIL OFL 1.1), places it in a 200 box and writes:

| File | Use |
|---|---|
| `brand/jinniu/mark.svg` | The mark: rounded tile, porcelain bevel and soft shadow (SVG filters) |
| `brand/jinniu/mark-square.svg` | The same on a full square tile: profile photos, the PlatformConfig picture |
| `brand/jinniu/mark-small.svg` | 16 to 48 px: deeper tile, bolder 牛, crisp shadow, no filters |
| `brand/jinniu/mark-flat.svg` | No filters, for renderers without them (next/og) |
| `brand/jinniu/png/` | `mark-1024/512/256.png` (transparent corners), `mark-square-1024.png` (X and Telegram photo), `favicon-16/32/48.png`, `apple-icon-180.png` |
| `brand/jinniu/sheet.png` | The brand sheet |
| `apps/web/src/components/jinniuMark.ts` | `GLYPH`, the placed outline, and `MARK_FLAT_SVG` |
| `apps/web/src/app/icon.svg`, `apple-icon.png`, `public/favicon.png` | The site's favicons and Apple touch icon |
| `apps/web/public/brand/jinniu-mark-512.png`, `hwai-mark-512.png` | The PlatformConfig picture (square, opaque) |

`Mark` (`apps/web/src/components/Mark.tsx`) draws the same mark inline with per-instance filter ids, so the header, the empty live card and the official token card all show it; each coin's share image draws `MARK_FLAT_SVG`. The rest of the live site is unchanged until the rebrand: the name hwai, its brush wordmark, design 牛 and the site share image (`opengraph-image.png`, which still shows the old seal). Regenerate with `node brand/jinniu/src/mark.cjs` from the repo root (Playwright with Chromium renders the PNGs and the sheet).

## Stock token logos

Every dividend asset shows its own token icon: in the round chips (filters, coupons, payouts, the trade box) and on the face of the 3D stock coins. They are the tokens' official icons from the Trust Wallet assets registry (`github.com/trustwallet/assets`, `blockchains/solana/assets/<mint>/logo.png`), fetched on 2026-10-26 by the mints verified in `docs/verified/jito-jupiter-xstocks.md`; each registry entry's `info.json` symbol matched (NVDAX, TSLAX, ...). They live in `apps/web/public/stocks/<SYMBOL>.png` (256 px); `apps/web/src/lib/logos.ts` lists them, and a symbol without one falls back to the prototype's initials. `scripts/fetch-stock-logos.sh` downloads them again.

The logos are the companies' and issuers' trademarks, shown only to identify each token, the way wallets and exchanges do. Include them in the legal review.
