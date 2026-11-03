# CLAUDE.md for the Divvy repo

Read this first in every session.

## What this is
Divvy is a Solana memecoin launchpad built on Raydium LaunchLab. Every coin trades against SOL and pays its holders an hourly dividend in a tokenized stock (NVDAx, SPYx and others). The full spec is in `HANDOFF.md`. The approved UI is `prototype/hwai-niu-prototype.html` (design 牛: near black with a faint grid, lime for actions and the brand, green up, gold for dividends, a live card on the home page; owner, 2026-11-01). It replaced design A (红包, red and gold, which the owner found bearish), which had replaced the original dark green Divvy design; their prototypes were deleted on 2026-11-02 with the old brands (below).

**Name before 金牛:** the product was **hwai** (`hwai.ai`) from 2026-10-31, the owner's rebrand; they dropped the uspad name and its Koin belah logo entirely (uspad on `uspad.fun` ran from 2026-10-26; the repo is still `fourtisf/uspad`). Everything users see says hwai, with the brush seal mark (牛, the bull of 牛市, brushed in a hand-stamped lime seal) and the brush "hwai" wordmark (owner, 2026-11-01: the earlier geometric logos looked "too AI"). They were drawn from Ma Shan Zheng outlines (SIL OFL 1.1) by `brand/hwai/src/niu.py`, so no font file ships. The name comes from `BRAND` in `packages/shared/src/brand.ts`: web copy, API messages, the sign-in statement, alerts and new coins' metadata. The X and Telegram handles are build-time env (`NEXT_PUBLIC_X_HANDLE`, `NEXT_PUBLIC_TELEGRAM_HANDLE`; `go-live.sh socials`), so no old handle is hard-coded. hwai is a **new launchpad from zero** (owner, 2026-10-31): its own server, new wallets, an empty database and its own PlatformConfig named hwai; `go-live.sh bootstrap` sets up that server (deploy/mainnet/README.md). uspad (uspad.fun, the $USPAD token, its PlatformConfig and coins) stays on its own server and carries nothing over. `go-live.sh domain` and `platform-info` exist for moving or renaming the uspad server, which isn't the plan. Internal names still say Divvy or uspad: the `@divvy/*` packages, `DIVVY_*` env vars, `divvy:` Redis keys, server paths like `/root/uspad-keys`, and these docs.

**Rebrand to 金牛 jinniu (owner, 2026-11-02 and 03).** The owner picked 金牛 (jīnniú, "golden bull"; 现金牛 is a cash cow) to replace hwai everywhere users see it. The code says 金牛 now: `BRAND` is "金牛" in Chinese copy, `BRAND_LATIN` "jinniu" in English copy and wherever text stays ASCII (API messages, the sign-in statement, the PlatformConfig), `DOMAIN` "jinniu.fun" (`packages/shared/src/brand.ts`), with the white 牛 mark and a text wordmark. It goes live on jinniu.fun with go-live.sh, which builds `main` now (deploy/mainnet/README.md, "金牛 on jinniu.fun"); hwai.ai then redirects there. The look is still design 牛 (rule 1) until the owner approves the clean white look (white only, no dark theme; after the Pons launchpad without copying it) in `prototype/jinniu-prototype.html` and it is built. $HWAI is hidden from the new site (`go-live.sh token-ca off`) until the owner launches a new official token (`go-live.sh token-ca <CA> <TICKER>`; the card's ticker is `NEXT_PUBLIC_TOKEN_TICKER`). The mark is final and already on the site (2026-11-03; "Where things live"). The domain is **jinniu.fun** (bought by the owner at Hostinger on 2026-11-02, paid to 2027-11-02). 金牛 is a **new launchpad from zero on its own server** (owner, 2026-11-03), like hwai was: the VPS at 31.97.66.123 (the owner's old coinside.fun server, cleaned first), set up with `go-live.sh bootstrap`, with new wallets (platform admin `9sDvsqgD4QY166SCqvyJR9BNpFuTcADJzSUJdvCdpAkc`, operations `GnHThSAfXwxMemFuWf6fwzrR1k3CNAkbjR9x4nTJdJio`), an empty database, 11 dividend stocks, and its own PlatformConfig `5W3ZWvQ1J8yCgbQ7trA5o1DA8SxFAHoPe9AKkgCV8tZc` still to create (a mainnet transaction, rule 3). Until then `go-live.sh preview public` serves the site at jinniu.fun with demo data, without a password but read-only (owner, 2026-11-03: no password). hwai.ai keeps running on its own server. Still open: the PlatformConfig, `switch`, the X and Telegram handles, the white design. How it got here: docs/BRAND.md, "金牛 jinniu".

**The old brands are deleted (owner, 2026-11-02).** `brand/uspad`, `brand/hwai` (its generators included), the Divvy kit and concepts, and the Divvy and design A prototypes are gone from the repo; the last commit that has them is `57a8482`. What still says hwai or uspad stays until 金牛 is installed, because the live site and on-chain pictures use it: the site's name, mark, icons and share images, `prototype/hwai-niu-prototype.html` (rule 1), and `apps/web/public/brand/hwai-mark-512.png` and `uspad-mark-512.png`, the PlatformConfigs' pictures on mainnet. docs/BRAND.md lists it all.

**Language:** the site is Chinese first (owner, 2026-10-31): Simplified Chinese by default, English with the 中 / EN switch, and an up/down colour switch in the footer: green up by default since design 牛 (crypto's way; the all-red design A read as bearish), red up (Chinese stock apps) as the option. How copy is written, the Chinese style and the glossary: `apps/web/src/i18n/README.md`.

## Stack (do not change without the owner's OK)
- **Frontend:** Next.js 15 App Router (React 19) in `apps/web`. Upgraded from 14 with the owner's OK on 2026-10-26 (docs/AUDIT.md DEP-1).
- **API:** Fastify in `apps/api`.
- **Workers:** indexer, payouts and cron in `apps/worker`.
- **Data:** Prisma with PostgreSQL in `packages/db`, plus Redis.
- **Shared code:** `packages/shared` (types, anti-vamp, fee math) and `packages/solana` (LaunchLab, Jito, Jupiter, Helius).
- **Deploy:** Hostinger VPS with PM2 and Nginx.

## Hard rules
1. **Pixel-faithful to the prototype** (`prototype/hwai-niu-prototype.html`). Same tokens, fonts (Noto Sans SC, JetBrains Mono for numbers), copy, hero with the live card, coin cards with sparklines, coin table and dark panels. If something looks wrong, ask; don't redesign. The prototype is one file with every page; open it and use its links.
2. **No invented on-chain facts.** Program IDs, mints, fee fields and SDK calls must be confirmed against the SDK source/IDL or on-chain data, and logged in `docs/VERIFIED.md` with the source.
3. **No mainnet spend** (PlatformConfig creation, funding wallets, test launches) without the owner's explicit approval in chat.
4. **Private keys** never go in the repo, the database, logs or client bundles. Hot wallets keep minimal balances with spend caps.
5. **The server is the authority** for anti-vamp, rate limits, amounts and fees. Client-side checks are only UI feedback.
6. **Mint addresses stay secret until the create lands.** Creates go only through Jito bundles. One exception (owner decision 2026-10-27): the creator's wallet, which signs and pays for its coin's create, sees it a few seconds early; the mint's signature never leaves the worker.
7. **The dividend engine is idempotent** (unique coin+hour) and has a dry-run mode. Run dry-run first.
8. **Copy:** sentence case, plain verbs, no all-caps labels. Keep the prototype's wording unless the owner changes it. "Paid every hour" becomes "credited every hour" only if the owner picks the claim model (HANDOFF §3.4).

## Conventions
- TypeScript strict everywhere. Use zod for API input validation.
- Amounts are integers in base units (lamports or token base units) and are serialized as strings.
- Every signed transaction is logged with its purpose and signature.
- Each phase ends with a short report: what's done, what was verified, what's blocked, and the next step.

## Commands
- `pnpm dev`: web (:3000), API (:4000) and worker in parallel. Reads the root `.env`.
- `pnpm db:migrate` (dev) / `pnpm db:deploy` (production): Prisma migrations in `packages/db`.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Phase 0 scripts: `cd packages/solana && pnpm tsx scripts/phase0/<script>.ts` (see `docs/VERIFIED.md`). Anything that spends SOL needs `--send` and `I_HAVE_OWNER_APPROVAL=yes`.

## Where things live
- API contract (zod schemas for every §6 response): `packages/shared/src/api.ts`. The API's contract test fails on any extra or missing field.
- Anti-vamp: `packages/shared/src/antivamp.ts` and `imagehash.ts`. The API re-runs every check on launch.
- The mark in the app: `apps/web/src/components/Mark.tsx`. `Mark` is the 金牛 mark (owner, 2026-11-03: on the site ahead of the rest of the rebrand, so it differs from the lime seal in `hwai-niu-prototype.html`): the brush 牛 in glossy white on a soft grey tile, drawn from `jinniuMark.ts`, which `brand/jinniu/src/mark.cjs` writes along with the favicons, the Apple icon and the PlatformConfig picture. `Wordmark` is still the brush "hwai" from `markPaths.ts` (written by the deleted `brand/hwai/src/niu.py`, in git history at `57a8482`) until the site takes the 金牛 name. Don't edit either generated file by hand.
- Styles: `apps/web/src/app/globals.css` is the prototype's CSS verbatim (change both together); `additions.css` holds what the prototype doesn't draw (modals, toasts, admin, the wallet picker) and maps the app's own class names onto the prototype's look.
- Copy in both languages: `apps/web/src/i18n/msgs/` (one file per area, `defineMsgs(en, zh)`); English stays the prototype's wording.
