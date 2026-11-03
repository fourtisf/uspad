"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  minutesSince,
  num,
  pct,
  short,
  usd,
  usdFull,
  type CandleList,
  type CandleTf,
  type CoinDetail,
  type Holder,
  type Meter,
  type MyPayouts,
  type PayoutRound,
  type Trade,
} from "@divvy/shared";
import { api, qs } from "@/lib/api";
import { useConfig } from "@/lib/config";
import { deliveryCopy } from "@/lib/copy";
import { useSession } from "@/lib/session";
import { explorerTx } from "@/lib/tx";
import { useNow } from "@/lib/hooks";
import { htmlLang, type Lang } from "@/i18n/lang";
import { useAgo, useLang, useMsgs } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";
import { coinMsgs } from "@/i18n/msgs/coin";
import { Chip } from "../Chip";
import { Countdown, rollForward } from "../Countdown";
import { Icon } from "../Icon";
import { useToast } from "../Toasts";
import { CandleChart } from "./CandleChart";
import { ReportButton } from "./ReportButton";
import { coinHref } from "@/lib/links";
import { shareOnX } from "@/lib/share";
import { X_HANDLE } from "@/lib/social";
import { TradeBox } from "./TradeBox";
import { CreatorFees } from "./CreatorFees";
import { shareLabel } from "@/lib/devbuy";

type List<T> = { items: T[]; nextCursor?: string | null };

/** Candle sizes, as the buttons show them. */
const INTERVALS: { tf: CandleTf; label: string }[] = [
  { tf: "1m", label: "1m" },
  { tf: "5m", label: "5m" },
  { tf: "15m", label: "15m" },
  { tf: "1h", label: "1h" },
  { tf: "4h", label: "4h" },
  { tf: "1d", label: "1D" },
];
/** A coin's first candle size: minutes while it's young, then longer ones. */
const defaultInterval = (ageMin: number): CandleTf => (ageMin <= 360 ? "1m" : ageMin <= 4320 ? "15m" : "1h");

/** How often the page re-reads the coin, its chart and its trades (the indexer polls every 4 s). */
const LIVE_MS = 8_000;

/** The prototype's tabs, in its order. */
const TABS = ["trades", "holders", "payouts"] as const;

/** Dollars paid out, as the prototype prints them: whole dollars with separators ($9,120), cents below $1k. */
const money = (v: number) => (Math.abs(v) >= 1000 ? usdFull(v) : usd(v));
/** "$48k" style, as in the prototype copy. */
const usdShort = (v: number) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`);
/** A round's hour in local time: "13:00" today, with the date before that. */
function roundTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const locale = htmlLang(lang);
  const hm = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  return d.toDateString() === new Date().toDateString() ? hm : `${d.toLocaleDateString(locale, { month: "short", day: "numeric" })} ${hm}`;
}

/** The coin page (prototype `#coin`): header, numbers, chart, tabs, and the trade and dividend cards. */
export function CoinView({ coin: initialCoin, initialMeter, initialPayouts }: { coin: CoinDetail; initialMeter: Meter; initialPayouts: List<PayoutRound> }) {
  const { data: coin = initialCoin } = useSWR<CoinDetail>(`/api/coins/${initialCoin.mint}`, { fallbackData: initialCoin, refreshInterval: LIVE_MS });
  const config = useConfig();
  const toast = useToast();
  const t = useMsgs(coinMsgs);
  const tc = useMsgs(common);
  const [lang] = useLang();
  const ago = useAgo();
  const ageMin = minutesSince(coin.createdAt);
  const m = coin.mint;
  const graduated = coin.status === "graduated";

  // The prototype's page class: on phones it hides the dock, where this page has its buy/sell bar.
  useEffect(() => {
    document.body.classList.add("v-coin");
    return () => document.body.classList.remove("v-coin");
  }, []);

  const [tf, setTf] = useState<CandleTf>(() => defaultInterval(ageMin));
  const [unit, setUnit] = useState<"price" | "mcap">("mcap");
  const { data: candles } = useSWR<CandleList>(`/api/coins/${m}/candles` + qs({ tf, unit, limit: 300 }), { refreshInterval: LIVE_MS, keepPreviousData: false });

  const [tab, setTab] = useState<(typeof TABS)[number]>("trades");
  // Refreshed like the meter, so a new round shows here as soon as the meter says it was paid (audit).
  const { data: payouts } = useSWR<List<PayoutRound>>(`/api/coins/${m}/payouts?limit=10`, { fallbackData: initialPayouts, refreshInterval: 30_000 });
  // Hours that paid holders, as dots under the candles.
  const payoutHours = useMemo(
    () => (payouts?.items ?? []).filter((p) => p.status === "ok" || p.status === "late").map((p) => Math.floor(new Date(p.hour).getTime() / 1000)),
    [payouts],
  );
  const lastRound = payouts?.items[0];
  const { data: holders } = useSWR<List<Holder>>(tab === "holders" ? `/api/coins/${m}/holders` : null);
  const { data: trades } = useSWR<List<Trade>>(tab === "trades" ? `/api/coins/${m}/trades?limit=24` : null, { refreshInterval: LIVE_MS });
  const { data: meter = initialMeter } = useSWR<Meter>(`/api/coins/${m}/meter`, { fallbackData: initialMeter, refreshInterval: 30_000 });

  // "$10", as the prototype says it, not "$10.00".
  const minHolder = usd(config.payouts.minHolderUsd, Number.isInteger(config.payouts.minHolderUsd) ? 0 : undefined);
  const delivery = deliveryCopy(config, lang);
  const statusLabel = meter.status === "late" ? t.statusLate : meter.status === "carried" ? t.statusCarried : null;
  const asset = coin.dividendAsset;

  const copyCa = () => {
    navigator.clipboard?.writeText(coin.mint).catch(() => {});
    toast(t.caCopied);
  };

  return (
    <div className="page">
      <Link className="back" href="/"><Icon name="back" size={16} />{tc.backToBoard}</Link>
      <div className="card chead">
        <span className="tile pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin.imageUrl} alt="" width={88} height={88} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h1>
            <span>{coin.name}</span>
            <small>${coin.ticker}</small>
          </h1>
          <div className="meta">
            <span suppressHydrationWarning>{t.createdBy(coin.creator.label, ago(coin.createdAt))}</span>
            <button className="pill" type="button" id="copyCa" title={t.copyCa} onClick={copyCa}>
              <Icon name="copy" size={14} />
              {short(coin.mint)}
            </button>
            <span className="pill">{t.privateBundle}</span>
            <span className="pill" id="devBuyTag" title={coin.devBuyPct ? t.devBoughtTitle(shareLabel(coin.devBuyPct)) : t.noDevBuyTitle}>
              {coin.devBuyPct ? t.devBought(shareLabel(coin.devBuyPct)) : t.noDevBuy}
            </span>
          </div>
        </div>
        <div className="acts">
          <button className="btn btn-line" type="button" id="shareX" onClick={() => shareOnX(t.shareText(coin.ticker, asset, X_HANDLE), coinHref(coin))}>
            {t.shareX}
          </button>
          <ReportButton mint={coin.mint} ticker={coin.ticker} />
        </div>
      </div>

      <div className="card kpis">
        <div><span>{t.kpiMcap}</span><b className="n">{usd(coin.marketCapUsd)}</b></div>
        <div><span>{t.kpiChange}</span><b className={"n " + (coin.change24hPct >= 0 ? "up" : "dn")}>{pct(coin.change24hPct)}</b></div>
        <div><span>{t.kpiVolume}</span><b className="n">{usd(coin.volume24hUsd)}</b></div>
        <div><span>{t.kpiHolders}</span><b className="n">{coin.holders.toLocaleString("en-US")}</b></div>
        <div><span>{t.kpiPaid}</span><b className="n g">{money(coin.paidUsd)}</b></div>
      </div>

      <div className="cgrid">
        <div style={{ minWidth: 0 }}>
          <div className="card chartc">
            <div className="chart-top">
              <div className="seg sm" role="group" aria-label={t.candleSize}>
                {INTERVALS.map((i) => (
                  <button type="button" key={i.tf} aria-pressed={tf === i.tf} onClick={() => setTf(i.tf)}>{i.label}</button>
                ))}
              </div>
              <div className="seg sm" role="group" aria-label={t.chartOf}>
                <button type="button" aria-pressed={unit === "price"} onClick={() => setUnit("price")}>{t.price}</button>
                <button type="button" aria-pressed={unit === "mcap"} onClick={() => setUnit("mcap")}>{t.marketCap}</button>
              </div>
            </div>
            <CandleChart candles={candles} solUsd={config.quote.priceUsd} payoutHours={payoutHours} label={t.chartLabel(unit, coin.ticker)} />
            <div className="chart-foot">
              <span><i />{t.hourlyPayout}</span>
              <span>{t.ath(usd(coin.athUsd))}</span>
            </div>
          </div>

          <div className="card tabsc">
            <div className="tabs" role="tablist">
              {TABS.map((k) => (
                <button key={k} type="button" role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls="tabBody" onClick={() => setTab(k)}>
                  {t.tabs[k]}
                </button>
              ))}
            </div>
            <div id="tabBody" className="rtable" role="tabpanel" aria-labelledby={`tab-${tab}`}>
              {tab === "trades" &&
                trades &&
                (trades.items.length ? (
                  <table className="t">
                    <thead>
                      <tr><th>{t.thWhen}</th><th>{t.thSide}</th><th>SOL</th><th className="hide-s">${coin.ticker}</th><th>{t.thWallet}</th></tr>
                    </thead>
                    <tbody>
                      {/* One transaction can hold several trades of a coin: keyed by signature and which one it is. */}
                      {trades.items.map((tr, i, all) => (
                        <tr key={`${tr.sig}:${all.slice(0, i).filter((x) => x.sig === tr.sig).length}`}>
                          <td className="w" suppressHydrationWarning>{ago(tr.ts)}</td>
                          <td className={"side " + (tr.side === "buy" ? "up" : "dn")}>{t.side[tr.side]}</td>
                          <td className="n">{tr.sol.ui.toFixed(3)}</td>
                          <td className="n hide-s">{num(tr.token.ui)}</td>
                          <td className="w">{short(tr.wallet)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty tab-empty">{t.noTrades}</div>
                ))}
              {tab === "holders" &&
                holders &&
                (holders.items.length ? (
                  <table className="t">
                    <thead>
                      <tr><th>#</th><th>{t.thWallet}</th><th>{t.thHolding}</th><th className="hide-s">{t.thReceived}</th></tr>
                    </thead>
                    <tbody>
                      {holders.items.map((h, i) => (
                        <tr key={h.wallet}>
                          <td className="w">{i + 1}</td>
                          <td className="w">{h.excluded ? t.excluded(h.excludedReason ? t.excludedNames[h.excludedReason] : (h.label ?? short(h.wallet))) : short(h.wallet)}</td>
                          <td className="n">
                            {h.pct.toFixed(h.pct >= 1 ? 1 : 2)}%
                            <span className="hbar" aria-hidden="true"><i style={{ width: Math.min(100, h.pct * 4) + "%" }} /></span>
                          </td>
                          <td className={"n hide-s" + (h.excluded || !h.received ? "" : " g")}>{h.excluded || !h.received ? t.na : `${num(h.received.ui)} ${asset}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty tab-empty">{t.noHolders}</div>
                ))}
              {tab === "payouts" &&
                (payouts?.items.length ? (
                  <table className="t">
                    <thead>
                      <tr><th>{t.thRound}</th><th>{t.thPaid}</th><th className="hide-s">{t.thValue}</th><th>{t.thWallets}</th><th>{t.thTx}</th></tr>
                    </thead>
                    <tbody>
                      {payouts.items.map((p) => (
                        <tr key={p.id}>
                          <td className="w">{roundTime(p.hour, lang)}</td>
                          <td className="n g">{num(p.amount.ui)} {p.assetSymbol}</td>
                          <td className="n hide-s">{usd(p.usd)}</td>
                          <td className="n">{p.wallets.toLocaleString("en-US")}</td>
                          <td>
                            {p.sig && (
                              <a className="tx" href={explorerTx(p.sig, config.network)} target="_blank" rel="noreferrer">{t.view}</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty tab-empty">
                    <b>{t.firstPayoutIn(<Countdown nextAt={meter.nextRoundAt} />)}</b>
                    {t.firstPayoutNote(minHolder, delivery.claim)}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <aside>
          <TradeBox coin={coin} />
          <CreatorFees coin={coin} />
          <div className="card divc">
            <div className="hd">
              <Ring nextAt={meter.nextRoundAt} intervalSec={config.payouts.intervalSec} />
              <div>
                <span>{t.nextPayout}</span>
                <strong>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Chip sym={asset} />
                    {asset}
                  </span>
                </strong>
              </div>
            </div>
            <div className="kvs" style={{ marginTop: 12 }}>
              <div className="kv">
                <span>{t.lastRound}</span>
                <b className="n">{lastRound ? t.lastRoundValue(num(lastRound.amount.ui), lastRound.assetSymbol, lastRound.wallets.toLocaleString("en-US")) : t.noRoundYet}</b>
              </div>
              <div className="kv">
                <span>{t.paid24h}</span>
                <b className="n" style={{ color: "var(--div)" }}>{meter.paid24hUsd > 0 ? money(meter.paid24hUsd) : "—"}</b>
              </div>
              {statusLabel && (
                <div className="kv" id="payoutStatus">
                  <span>{t.payoutStatus}</span>
                  <b className={"status-" + meter.status}>{statusLabel}</b>
                </div>
              )}
              <div className="kv" title={graduated ? undefined : t.curveTitle(usdShort(config.graduation.targetUsd))}>
                <span>{t.curveProgress}</span>
                <b className="n">{graduated ? t.graduated : `${Math.round(coin.progress * 100)}%`}</b>
              </div>
            </div>
            {!graduated && (
              <div className="bar" style={{ margin: "2px 0 4px" }}>
                <i style={{ width: (coin.progress * 100).toFixed(1) + "%" }} />
              </div>
            )}
            <MyEstimate mint={m} lastRound={lastRound} />
            <p className="note">{t.cardNote(minHolder, delivery)}</p>
          </div>
          <div className="warn">
            <span aria-hidden="true">⚠️</span>
            <span>{t.warn}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

const RING_C = 2 * Math.PI * 26;

/** The prototype's `.ring`: the time left to the next round, as a share of the round, around the countdown. */
function Ring({ nextAt, intervalSec }: { nextAt: string; intervalSec: number }) {
  const now = useNow();
  const left = Math.max(0, (rollForward(nextAt, now, intervalSec * 1000) - now) / 1000);
  const frac = Math.min(1, left / intervalSec);
  return (
    <div className="ring">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="bgc" cx="32" cy="32" r="26" />
        <circle className="fg" cx="32" cy="32" r="26" style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C * frac }} suppressHydrationWarning />
      </svg>
      <b><Countdown nextAt={nextAt} /></b>
    </div>
  );
}

/**
 * The prototype's `.est`, only with real numbers: for a connected, signed-in wallet that this coin paid
 * in its last round, what it got then, as the estimate for the next hour. With no wallet connected, the
 * prototype's line saying so (once the coin has paid a round). Otherwise nothing.
 */
function MyEstimate({ mint, lastRound }: { mint: string; lastRound: PayoutRound | undefined }) {
  const t = useMsgs(coinMsgs);
  const wallet = useWallet();
  const { me } = useSession();
  const addr = wallet.publicKey?.toBase58() ?? null;
  const signedIn = !!addr && me?.wallet === addr;
  // /me's request; keyed by the round too, so a new round reads it again. Never the last wallet's (audit).
  const { data } = useSWR(signedIn && lastRound ? ["/api/me/payouts?limit=50", addr, lastRound.hour] : null, ([path]) => api<MyPayouts>(path), { keepPreviousData: false });
  const mine = data?.items.find((p) => p.coin.mint === mint);
  if (!addr && lastRound) {
    return (
      <div className="est">
        {t.estimateConnect}
        <i>{t.estimateTag}</i>
      </div>
    );
  }
  if (!lastRound || !mine || new Date(mine.hour).getTime() !== new Date(lastRound.hour).getTime()) return null;
  return (
    <div className="est">
      {t.estimate(<b className="n">+{num(mine.amount.ui)} {mine.assetSymbol}</b>)}
      <i>{t.estimateTag}</i>
    </div>
  );
}
