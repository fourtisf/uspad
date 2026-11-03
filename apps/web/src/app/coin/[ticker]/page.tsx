import type { Metadata } from "next";
import Link from "next/link";
import type { CoinDetail, CoinList, Meter, PayoutRound } from "@divvy/shared";
import { BRAND, BRAND_LATIN } from "@/lib/brand";
import { toCard } from "@/lib/cards";
import { serverApi, serverApiOrNull } from "@/lib/server-api";
import { CoinCard } from "@/components/CoinCard";
import { CoinView } from "@/components/coin/CoinView";
import { Icon } from "@/components/Icon";
import { getMsgs } from "@/i18n/server";
import { common } from "@/i18n/msgs/common";
import { coinMsgs } from "@/i18n/msgs/coin";

const MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * A coin link's card on X and Telegram: its own share image (app/og/coin/[mint]) instead of the site's,
 * with its name, ticker and what it pays in (owner, 2026-11-02). A ticker several coins share keeps the
 * site's card, since it lists them.
 */
export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const ticker = decodeURIComponent((await params).ticker);
  if (ticker.length > 64) return {};
  if (!MINT.test(ticker)) {
    const found = await serverApiOrNull<CoinList>(`/api/coins?ticker=${encodeURIComponent(ticker)}&limit=2`).catch(() => null);
    if ((found?.items.length ?? 0) > 1) return { title: `$${found!.items[0]!.ticker} · ${BRAND}` };
  }
  const coin = await serverApiOrNull<CoinDetail>(`/api/coins/${encodeURIComponent(ticker)}`).catch(() => null);
  if (!coin) return {};
  const title = `${coin.name} ($${coin.ticker}) · ${BRAND}`;
  const description = `$${coin.ticker} pays its holders in ${coin.dividendAsset} every hour. 土狗也分红，分的是美股。`;
  const image = { url: `/og/coin/${coin.mint}`, width: 1200, height: 630, alt: `${coin.name} ($${coin.ticker}) on ${BRAND_LATIN}` };
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CoinPage({ params }: { params: Promise<{ ticker: string }> }) {
  const ticker = decodeURIComponent((await params).ticker);
  const [t, tc] = await Promise.all([getMsgs(coinMsgs), getMsgs(common)]);
  // Coins can share a ticker (owner decision 2026-10-27) and links use the mint. A ticker link (an old
  // tab, a typed or shared URL) that matches several coins lists them, instead of guessing which one.
  // The API lists every coin whose ticker reads the same, lookalikes included (D0GE for DOGE).
  if (!MINT.test(ticker) && ticker.length <= 64) {
    const found = await serverApiOrNull<CoinList>(`/api/coins?ticker=${encodeURIComponent(ticker)}&limit=100`);
    const same = found?.items ?? [];
    if (same.length > 1)
      return (
        <div className="page">
          <Link className="back" href="/"><Icon name="back" size={16} />{tc.backToBoard}</Link>
          <h1 className="page-h">${same[0]!.ticker}</h1>
          <p className="page-lede">{t.sameTicker(same.length)}</p>
          <div className="grid">
            {same.map((c) => (
              <CoinCard key={c.mint} c={toCard(c)} />
            ))}
          </div>
        </div>
      );
  }
  // Longer than any ticker or mint: the API would refuse it, so it's simply not a coin here.
  const coin = ticker.length > 64 ? null : await serverApiOrNull<CoinDetail>(`/api/coins/${encodeURIComponent(ticker)}`);
  if (!coin)
    return (
      <div className="page">
        <Link className="back" href="/"><Icon name="back" size={16} />{tc.backToBoard}</Link>
        <div className="card empty coin-none">
          {t.noCoin(ticker, (text) => (
            <Link className="link" href="/create">{text}</Link>
          ))}
        </div>
      </div>
    );
  const [meter, payouts] = await Promise.all([
    serverApi<Meter>(`/api/coins/${coin.mint}/meter`),
    serverApi<{ items: PayoutRound[]; nextCursor: string | null }>(`/api/coins/${coin.mint}/payouts?limit=10`),
  ]);
  return <CoinView key={coin.mint} coin={coin} initialMeter={meter} initialPayouts={payouts} />;
}
