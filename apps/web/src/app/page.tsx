import type { CoinList, PayoutList, Stats } from "@divvy/shared";
import { serverApi, sharedApi } from "@/lib/server-api";
import { Board } from "@/components/board/Board";
import { coinsKey } from "@/lib/keys";

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q: raw } = await searchParams;
  const q = typeof raw === "string" ? raw : "";
  const [stats, leaders, coins, payouts] = await Promise.all([
    sharedApi<Stats>("/api/stats"),
    // The featured coins: one big and four small (prototype `.bento`).
    serverApi<CoinList>("/api/coins?sort=payers&limit=5"),
    serverApi<CoinList>(coinsKey({ sort: "trending", pays: "all", q })),
    // The pool card's number: what's waiting for the next round, the payouts page's summary. Without it the
    // card shows the headline, so the page still renders.
    sharedApi<PayoutList>("/api/payouts?limit=1").catch(() => null),
  ]);
  return <Board stats={stats} leaders={leaders.items} initialCoins={coins} pendingUsd={payouts?.summary.pendingUsd ?? null} now={Date.now()} />;
}
