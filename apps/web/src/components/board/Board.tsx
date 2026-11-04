"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { intervalFrac, minutesSince, num, pct, usd, usdFull, type CoinList, type CoinSort, type CoinSummary, type LiveEvent, type Stats } from "@divvy/shared";
import { coinsKey } from "@/lib/keys";
import { useAssets, useConfig } from "@/lib/config";
import { deliveryCopy } from "@/lib/copy";
import { useNow } from "@/lib/hooks";
import { coinHref } from "@/lib/links";
import { useAgo, useLang, useMsgs } from "@/i18n/client";
import { board } from "@/i18n/msgs/board";
import { common } from "@/i18n/msgs/common";
import { Chip } from "../Chip";
import { CoinPic, money } from "../CoinCard";
import { Countdown, rollForward } from "../Countdown";
import { CountUp } from "../CountUp";
import { focusCoinSearch, takeCoinSearchRequest } from "../Header";
import { Icon } from "../Icon";
import { Spark } from "../Spark";
import { OfficialToken, TokenCa } from "../TokenCa";
import { TelegramJoin, XFollow } from "../XFollow";

const SORTS: CoinSort[] = ["trending", "new", "payers", "graduate"];
/** Rows shown at first and added by "Show more". */
const PAGE = 15;
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

/**
 * "刚刚到账" as a running ticker (replaces the old feed card): the latest payout rounds the API sent with the
 * stats, scrolling across a full-width strip. Doubled so the loop has no seam; paused on hover; still when the
 * visitor asks for less motion (globals). Empty before the first round, so the strip carries a line instead.
 */
function Ticker({ events, names, hasCoins, now }: { events: LiveEvent[]; names: Map<string, string>; hasCoins: boolean; now: number }) {
  const t = useMsgs(board);
  const ago = useAgo();
  const rows = events.filter((e): e is PayoutEvent => e.type === "payout_round").slice(0, 12);
  const item = (e: PayoutEvent, i: number) => {
    const name = names.get(e.mint) ?? t.feedHolders(e.ticker);
    return (
      <Link className="tk-item" href={coinHref(e)} key={e.mint + e.at + i}>
        <CoinPic src={e.imageUrl} />
        <span className="tk-nm">{name}</span>
        <b className="tk-amt n">+{num(e.amount.ui)} {e.assetSymbol}</b>
        <small suppressHydrationWarning>{ago(e.at, now)}</small>
      </Link>
    );
  };
  return (
    <div className="ticker">
      <span className="tk-head">
        <i className="live" />
        {t.feedH}
        <Link href="/payouts">{t.feedAll}</Link>
      </span>
      {rows.length ? (
        <div className="tk-track" aria-label={t.feedH}>
          <div className="tk-run">
            {rows.map(item)}
            {rows.map((e, i) => item(e, i + 100))}
          </div>
        </div>
      ) : (
        <span className="tk-empty">{hasCoins ? t.feedEmptyP : t.liveEmptyP}</span>
      )}
    </div>
  );
}

/** A coin as a dense table row (the new home: `.crow`), with every number the old card carried. */
function CoinRow({ c, rank, now, nextAt }: { c: CoinSummary; rank: number; now: number; nextAt: string }) {
  const t = useMsgs(board);
  const ago = useMsgs(common).ago;
  const ageMin = minutesSince(c.createdAt, now);
  const graduated = c.status === "graduated";
  const curve = Math.round(c.progress * 100);
  const paid = c.paid24hUsd > 0;
  return (
    <Link className="crow" href={coinHref(c)}>
      <span className="c-rank n">{rank}</span>
      <span className="c-coin">
        <CoinPic src={c.imageUrl} />
        <span className="c-nm">
          <b>{c.name}</b>
          <small>${c.ticker} · <span suppressHydrationWarning>{ago(ageMin)}</span></small>
        </span>
      </span>
      <span className="c-mcap n">{usd(c.marketCapUsd)}</span>
      <span className={"c-chg n " + (c.change24hPct >= 0 ? "up" : "dn")}>{pct(c.change24hPct)}</span>
      <span className="c-curve">
        {graduated ? (
          <em className="grad">{t.badgeGraduated}</em>
        ) : (
          <>
            <span className="bar"><i style={{ width: c.progress * 100 + "%" }} /></span>
            <span className="n">{curve}%</span>
          </>
        )}
      </span>
      <span className="c-chart">{c.spark.length > 1 ? <Spark values={c.spark} /> : <i className="no" />}</span>
      <span className="c-pays">
        <span className="stock"><Chip sym={c.dividendAsset} />{c.dividendAsset}</span>
        {paid ? (
          <b className="paid n">{t.paid24h(money(c.paid24hUsd))}</b>
        ) : (
          <small className="wait">{t.firstRound(<span className="n"><Countdown nextAt={nextAt} /></span>)}</small>
        )}
      </span>
    </Link>
  );
}

/** A leader in the sidebar (`.lead`): rank, picture, what it paid in 24h and its 24h change. */
function Lead({ c, rank }: { c: CoinSummary; rank: number }) {
  return (
    <Link className="lead" href={coinHref(c)}>
      <span className="r n">{rank}</span>
      <CoinPic src={c.imageUrl} />
      <span className="nm">
        <b>{c.name}</b>
        <small>${c.ticker}</small>
      </span>
      <span className="v">
        {c.paid24hUsd > 0 ? <b className="g n">{money(c.paid24hUsd)}</b> : <b className="n">{usd(c.marketCapUsd)}</b>}
        <small className={"n " + (c.change24hPct >= 0 ? "up" : "dn")}>{pct(c.change24hPct)}</small>
      </span>
    </Link>
  );
}

/**
 * The home page: a wide pool band (the round's pool, the hour and the headline stats), a running "just paid"
 * ticker, the promises and official token, then live markets as a dense table with a leaders rail beside it.
 * Before the first coin it shows no zeros: the band carries the headline instead of a $0 pool, the stats wait,
 * and the ticker carries a line.
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
  // The pool waits for the first coin, like the stats: before it, the band carries the headline.
  const pool = hasCoins ? pendingUsd : null;
  const claim = config.payouts.delivery === "claim";
  const paidLaunch = !!config.launchFee.to;
  const stocksToEarn = config.dividendAssets.filter((a) => a.kind === "stock" && a.enabled).length;
  // The ticker's rounds carry tickers; names come from the coins on the page.
  const names = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of [...leaders, ...initialCoins.items, ...list]) m.set(c.mint, c.name);
    return m;
  }, [leaders, initialCoins.items, list]);

  return (
    <>
      <section className="band2">
        <div className="card panel-pool">
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
              <HourLine nextAt={stats.nextRoundAt} />
            </>
          ) : (
            <>
              <h1 className="pool-h">{t.h1}</h1>
              <p className="band-lede">{t.lede(paidLaunch, deliveryCopy(config, lang).heroTail)}</p>
            </>
          )}
        </div>
        <div className="card panel-next">
          {pool !== null ? (
            <>
              <span className="next-lead">{t.nextPayout}</span>
              <div className="next-cd n"><Countdown nextAt={stats.nextRoundAt} /></div>
              <p>{t.splitLine(claim)}</p>
            </>
          ) : (
            <>
              <span className="next-lead">{t.kickIdle}</span>
              <p className="next-p0">{t.splitLine(claim)}</p>
            </>
          )}
          <div className="ctas">
            <Link className="btn btn-acc btn-lg" href="/create">{t.createCoin}</Link>
            <Link className="btn btn-line btn-lg" href="/how">{t.howItWorks}</Link>
          </div>
        </div>
      </section>
      {/* Zeros on an empty board read as a dead site: the numbers appear with the first coin. */}
      {hasCoins && (
        <div className="band-stats">
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

      <Ticker events={stats.activity} names={names} hasCoins={hasCoins} now={now} />

      <div className="promises">
        <Link href="/how">{t.devBuysShown(paidLaunch)}</Link>
        <Link href="/how">{t.liquidityLocked}</Link>
        <Link href="/how">{t.noSniper}</Link>
        <Link href="/payouts">{t.payoutsOnChain}</Link>
      </div>

      <OfficialToken />

      <section className="home-main" id="all" aria-labelledby="allH">
        <div className="markets">
          <div className="sh">
            <h2 id="allH">{t.liveMarkets}</h2>
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
          {list.length ? (
            <div className="ctable">
              <div className="ctable-h" aria-hidden="true">
                <span className="c-rank">{t.cols.rank}</span>
                <span className="c-coin">{t.cols.coin}</span>
                <span className="c-mcap">{t.cols.mcap}</span>
                <span className="c-chg">{t.cols.chg}</span>
                <span className="c-curve">{t.cols.curve}</span>
                <span className="c-chart">{t.cols.chart}</span>
                <span className="c-pays">{t.cols.pays}</span>
              </div>
              {list.slice(0, shownN).map((c, i) => (
                <CoinRow key={c.mint} c={c} rank={i + 1} now={now} nextAt={stats.nextRoundAt} />
              ))}
            </div>
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
          {list.length > shownN && (
            <div className="more">
              <button className="btn btn-ghost" type="button" onClick={() => setMore({ key, n: shownN + PAGE })}>
                {t.more}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          )}
        </div>

        {leaders[0] && (
          <aside className="side" aria-labelledby="leadH">
            <div className="side-card card">
              <h3 className="panel-h">
                <span id="leadH">{t.leadersH}</span>
                <Link href="/payouts">{t.feedAll}</Link>
              </h3>
              <p className="side-p">{t.leadersP}</p>
              <div className="leads">
                {leaders.slice(0, 5).map((c, i) => (
                  <Lead key={c.mint} c={c} rank={i + 1} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </section>
    </>
  );
}
