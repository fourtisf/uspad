"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { intervalFrac, num, pct, usd, usdFull, type CoinList, type CoinSort, type CoinSummary, type LiveEvent, type Stats } from "@divvy/shared";
import { coinsKey } from "@/lib/keys";
import { toCard } from "@/lib/cards";
import { useAssets, useConfig } from "@/lib/config";
import { deliveryCopy } from "@/lib/copy";
import { useNow } from "@/lib/hooks";
import { coinHref } from "@/lib/links";
import { useAgo, useLang, useMsgs } from "@/i18n/client";
import { board } from "@/i18n/msgs/board";
import { common } from "@/i18n/msgs/common";
import { Chip } from "../Chip";
import { CoinCard, CoinPic, money } from "../CoinCard";
import { Countdown, rollForward } from "../Countdown";
import { CountUp } from "../CountUp";
import { focusCoinSearch, takeCoinSearchRequest } from "../Header";
import { Icon } from "../Icon";
import { Spark } from "../Spark";
import { OfficialToken, TokenCa } from "../TokenCa";
import { TelegramJoin, XFollow } from "../XFollow";

const SORTS: CoinSort[] = ["trending", "new", "payers", "graduate"];
/** Cards shown at first and added by "Show more": whole rows at 4, 3, 2 and 1 columns. */
const PAGE = 12;
const HOUR_SEC = 3600;
const TICKS = [":00", ":15", ":30", ":45", ":00"];
const NONE: CoinSummary[] = [];
/** The pool to the cent, as the prototype's big number ("$482.16"). */
const usd2 = (v: number): string => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type PayoutEvent = Extract<LiveEvent, { type: "payout_round" }>;

/** The hour as a line (prototype `.hour` and `.ticks`): how much of the hour before the next round has gone. */
function HourLine({ nextAt }: { nextAt: string }) {
  const now = useNow();
  const done = intervalFrac(rollForward(nextAt, now), HOUR_SEC, now);
  return (
    <>
      <div className="hour" aria-hidden="true">
        <i style={{ width: (done * 100).toFixed(2) + "%" }} suppressHydrationWarning />
      </div>
      <div className="ticks" aria-hidden="true">
        {TICKS.map((k, i) => <span key={i}>{k}</span>)}
      </div>
    </>
  );
}

/** " · 15:00 发放": when the next round goes out, in the visitor's own time (so only once in the browser). */
function RoundAt({ nextAt, claim }: { nextAt: string; claim: boolean }) {
  const t = useMsgs(board);
  const [lang] = useLang();
  const now = useNow(15_000);
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => setInBrowser(true), []);
  if (!inBrowser) return null;
  const at = new Date(rollForward(nextAt, now)).toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return <> · {t.poolAt(at, claim)}</>;
}

/** "刚刚到账" (prototype `.feed`): the latest payout rounds the API sent with the stats. */
function Feed({ events, names, hasCoins, now }: { events: LiveEvent[]; names: Map<string, string>; hasCoins: boolean; now: number }) {
  const t = useMsgs(board);
  const ago = useAgo();
  const rows = events.filter((e): e is PayoutEvent => e.type === "payout_round").slice(0, 5);
  return (
    <div className="card feed">
      <h3>
        {t.feedH} <Link href="/payouts">{t.feedAll}</Link>
      </h3>
      <div>
        {rows.length ? (
          rows.map((e) => {
            const name = names.get(e.mint);
            return (
              <Link className="fr" href={coinHref(e)} key={e.mint + e.at}>
                <CoinPic src={e.imageUrl} />
                <div className="t">
                  <b>{name ?? t.feedHolders(e.ticker)}</b>
                  <small>{name ? t.feedHolders(e.ticker) : t.feedWallets(e.wallets)}</small>
                </div>
                <div className="v">
                  <b className="n">+{num(e.amount.ui)} {e.assetSymbol}</b>
                  <small suppressHydrationWarning>{ago(e.at, now)}</small>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="feed-none">
            <b>{hasCoins ? t.feedEmptyH : t.liveEmptyH}</b>
            {hasCoins ? t.feedEmptyP : t.liveEmptyP}
          </div>
        )}
      </div>
    </div>
  );
}

/** The paying-the-most coin, big (prototype `.feat`): its chart and what it pays. */
function Feat({ c }: { c: CoinSummary }) {
  const t = useMsgs(board);
  return (
    <Link className="card feat" href={coinHref(c)}>
      <div className="hd">
        <CoinPic src={c.imageUrl} />
        <div className="nmw">
          {c.paid24hUsd > 0 && <span className="dvl solo">{t.topPayer}</span>}
          <h3>{c.name}</h3>
          <span className="tk">${c.ticker}</span>
        </div>
      </div>
      <div className="row">
        <b className="n">{usd(c.marketCapUsd)}</b>
        <span className={"chg n " + (c.change24hPct >= 0 ? "up" : "dn")}>{pct(c.change24hPct)}</span>
        <small>{t.mcap24h}</small>
      </div>
      <div className="chart">{c.spark.length > 1 ? <Spark values={c.spark} area w={600} h={150} /> : <span className="chart-none">{t.noChart}</span>}</div>
      <div className="ft">
        <div className="box">
          <span>{t.boxPays}</span>
          <b>
            <Chip sym={c.dividendAsset} />
            {c.dividendAsset}
          </b>
        </div>
        <div className="box">
          <span>{t.boxPaid24h}</span>
          <b className="g n">{money(c.paid24hUsd)}</b>
        </div>
        <div className="box">
          <span>{t.boxHolders}</span>
          <b className="n">{c.holders.toLocaleString("en-US")}</b>
        </div>
      </div>
    </Link>
  );
}

/** A featured coin, small (prototype `.mini`): its picture wide, on a blur of itself so none of it is cut. */
function Mini({ c, nextAt }: { c: CoinSummary; nextAt: string }) {
  const t = useMsgs(board);
  return (
    <Link className="card mini" href={coinHref(c)}>
      <span className="tile pic wide">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bg" src={c.imageUrl} alt="" loading="lazy" decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.imageUrl} alt="" loading="lazy" decoding="async" />
      </span>
      <div className="nm">
        <span>{c.name}</span>
        <small>${c.ticker}</small>
      </div>
      <div className="mr">
        <b className="n">{usd(c.marketCapUsd)}</b>
        <span className={"n " + (c.change24hPct >= 0 ? "up" : "dn")}>{pct(c.change24hPct)}</span>
      </div>
      <span className="dvl">
        <Chip sym={c.dividendAsset} />
        {c.paidUsd > 0 ? t.paid24h(money(c.paid24hUsd)) : t.firstRound(<span className="n"><Countdown nextAt={nextAt} /></span>)}
      </span>
    </Link>
  );
}

/**
 * The home page (prototype `#home`): the round's pool and the payout feed, the stats, the promises, the
 * official token, the featured coins and every coin. Before the first coin it shows no zeros: the pool card
 * carries the headline instead of a $0 pool, and the stats wait for the first coin.
 */
export function Board({
  stats,
  leaders,
  initialCoins,
  pendingUsd,
  now: renderedAt,
}: {
  stats: Stats;
  leaders: CoinSummary[];
  initialCoins: CoinList;
  /** Waiting for the next round across every coin (/api/payouts summary); null when that didn't load. */
  pendingUsd: number | null;
  now: number;
}) {
  const config = useConfig();
  const t = useMsgs(board);
  const tc = useMsgs(common);
  const [lang] = useLang();
  // Ages start from the server's clock, so hydration matches the HTML, then follow the browser's
  // (audit: a coin crossing 10 or 20 minutes in between broke hydration).
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const assets = useAssets();

  // The search: ?q= in the URL is the query (links and reloads keep it); typing updates it in place.
  const q = useSearchParams().get("q") ?? "";
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);
  const onSearch = (v: string) => {
    setInput(v);
    window.history.replaceState(null, "", v ? `/?q=${encodeURIComponent(v)}` : "/");
  };
  // The header's search button or "/" from another page.
  useEffect(() => {
    if (!takeCoinSearchRequest()) return;
    const raf = requestAnimationFrame(() => focusCoinSearch(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const [sort, setSort] = useState<CoinSort>("trending");
  const [pays, setPays] = useState("all");
  const key = coinsKey({ sort, pays, q });
  const first = coinsKey({ sort: "trending", pays: "all", q });
  const { data } = useSWR<CoinList>(key, { fallbackData: key === first ? initialCoins : undefined });
  const list = data?.items ?? NONE;
  const [more, setMore] = useState({ key, n: PAGE });
  const shownN = more.key === key ? more.n : PAGE;

  const hasCoins = stats.coinsLive > 0;
  // The pool waits for the first coin, like the stats: before it, the card carries the headline.
  const pool = hasCoins ? pendingUsd : null;
  const claim = config.payouts.delivery === "claim";
  const paidLaunch = !!config.launchFee.to;
  const stocksToEarn = config.dividendAssets.filter((a) => a.kind === "stock" && a.enabled).length;
  // The feed's rounds carry tickers; names come from the coins on the page.
  const names = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of [...leaders, ...initialCoins.items, ...list]) m.set(c.mint, c.name);
    return m;
  }, [leaders, initialCoins.items, list]);

  return (
    <>
      <div className="hero">
        <div className="card pool">
          <div className="eyebrow">
            <i className="live" />
            {pool !== null ? (
              <span>
                {t.poolLabel}
                <RoundAt nextAt={stats.nextRoundAt} claim={claim} />
              </span>
            ) : (
              <span>{t.kickIdle}</span>
            )}
            <span className="ey-pills">
              <TokenCa />
              <XFollow />
              <TelegramJoin />
            </span>
          </div>
          {pool !== null ? (
            <>
              <h1 className="sr">{t.h1}</h1>
              <div className="big n">
                <CountUp value={pool} format={usd2} />
              </div>
              <p>{t.poolP(<Countdown nextAt={stats.nextRoundAt} />, claim)}</p>
              <HourLine nextAt={stats.nextRoundAt} />
            </>
          ) : (
            <>
              <h1 className="pool-h">{t.h1}</h1>
              <p>{t.lede(paidLaunch, deliveryCopy(config, lang).heroTail)}</p>
            </>
          )}
          <div className="ctas">
            <Link className="btn btn-acc btn-lg" href="/create">{t.createCoin}</Link>
            <Link className="btn btn-line btn-lg" href="/how">{t.howItWorks}</Link>
          </div>
        </div>
        <Feed events={stats.activity} names={names} hasCoins={hasCoins} now={now} />
      </div>

      {/* Zeros on an empty board read as a dead site: the numbers appear with the first coin. */}
      {hasCoins && (
        <div className="stats">
          <div>
            <b className="g n"><CountUp value={stats.paidToHoldersUsd} format={usdFull} /></b>
            <span>{t.paidToHolders}</span>
          </div>
          <div>
            <b className="n"><CountUp value={stats.volume24hUsd} format={usd} /></b>
            <span>{t.traded24h}</span>
          </div>
          <div>
            <b className="n">{stats.coinsLive.toLocaleString("en-US")}</b>
            <span>{t.coinsLive}</span>
          </div>
          <div>
            <b className="n">{stocksToEarn}</b>
            <span>{t.stocksToEarn}</span>
          </div>
        </div>
      )}
      <div className="promises">
        <Link href="/how">{t.devBuysShown(paidLaunch)}</Link>
        <Link href="/how">{t.liquidityLocked}</Link>
        <Link href="/how">{t.noSniper}</Link>
        <Link href="/payouts">{t.payoutsOnChain}</Link>
      </div>

      <OfficialToken />

      {leaders[0] && (
        <section className="sec" aria-labelledby="leadH">
          <div className="sh">
            <h2 id="leadH">{t.leadersH}</h2>
            <p>{t.leadersP}</p>
          </div>
          <div className="bento">
            <Feat c={leaders[0]} />
            {leaders.slice(1, 5).map((c) => (
              <Mini key={c.mint} c={c} nextAt={stats.nextRoundAt} />
            ))}
          </div>
        </section>
      )}

      <section className="sec" id="all" aria-labelledby="allH">
        <div className="sh">
          <h2 id="allH">{t.allCoins}</h2>
          <div className="r">
            <label className="search">
              <Icon name="search" size={17} />
              <span className="sr">{tc.searchLabel}</span>
              <input id="search" type="search" placeholder={tc.searchPlaceholder} autoComplete="off" aria-keyshortcuts="/" value={input} onChange={(e) => onSearch(e.target.value)} />
            </label>
            <div className="seg" role="group" aria-label={t.sort}>
              {SORTS.map((k) => (
                <button type="button" key={k} aria-pressed={sort === k} onClick={() => setSort(k)}>{t.sorts[k]}</button>
              ))}
            </div>
          </div>
        </div>
        {stats.assetsInUse.length > 0 && (
          <div className="chips" role="group" aria-label={t.filterByStock}>
            <button type="button" className="chip all" aria-pressed={pays === "all"} onClick={() => setPays("all")}>
              {t.all} <em className="n">{stats.coinsLive.toLocaleString("en-US")}</em>
            </button>
            {stats.assetsInUse.filter((s) => assets[s]).map((s) => (
              <button type="button" className="chip" key={s} aria-pressed={pays === s} onClick={() => setPays(s)}>
                <Chip sym={s} />
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="grid" id="grid">
          {list.length ? (
            list.slice(0, shownN).map((c) => (
              <CoinCard key={c.mint} c={toCard(c, now)} creator={false} nextRoundAt={stats.nextRoundAt} />
            ))
          ) : data ? (
            <div className="empty">
              {q || pays !== "all" ? (
                <>
                  <b>{t.noMatchH(q)}</b>
                  {t.noMatchP}
                </>
              ) : (
                <>
                  <b>{t.noCoinsH}</b>
                  {t.noCoinsP}
                  <br />
                  <Link className="btn btn-acc" href="/create">{t.createCoin}</Link>
                </>
              )}
            </div>
          ) : null}
        </div>
        {list.length > shownN && (
          <div className="more">
            <button className="btn btn-ghost" type="button" onClick={() => setMore({ key, n: shownN + PAGE })}>
              {t.more}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
