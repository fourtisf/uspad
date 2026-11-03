"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { num, usd, usdFull, type PayoutList } from "@divvy/shared";
import { qs } from "@/lib/api";
import { useAssets, useConfig } from "@/lib/config";
import { deliveryCopy } from "@/lib/copy";
import { useNow } from "@/lib/hooks";
import { explorerTx } from "@/lib/tx";
import { useAgo, useLang, useMsgs } from "@/i18n/client";
import { payouts } from "@/i18n/msgs/payouts";
import { Chip } from "../Chip";
import { Countdown, rollForward } from "../Countdown";
import { coinHref } from "@/lib/links";

/** The hour line's ticks: the round's interval in quarters, as minutes past the hour (":00", ":15", …). */
const ticks = (intervalSec: number) => [0, 1, 2, 3, 4].map((q) => ":" + String(Math.round((intervalSec / 60) * (q / 4)) % 60).padStart(2, "0"));

/** The prototype's hour line: how far into this round's interval we are, moving every second. */
function HourLine({ nextRoundAt, intervalSec }: { nextRoundAt: string; intervalSec: number }) {
  const now = useNow();
  const intervalMs = intervalSec * 1000;
  const left = rollForward(nextRoundAt, now, intervalMs) - now;
  const done = Math.min(1, Math.max(0, 1 - left / intervalMs));
  return (
    <>
      <div className="hour" style={{ margin: "18px 0 8px" }} aria-hidden="true">
        <i style={{ width: (done * 100).toFixed(2) + "%" }} suppressHydrationWarning />
      </div>
      <div className="ticks" aria-hidden="true">
        {ticks(intervalSec).map((x, i) => <span key={i}>{x}</span>)}
      </div>
    </>
  );
}

export function PayoutsView({ initial, assetsInUse, nextRoundAt }: { initial: PayoutList; assetsInUse: string[]; nextRoundAt: string }) {
  const assets = useAssets();
  const config = useConfig();
  const t = useMsgs(payouts);
  const ago = useAgo();
  const [lang] = useLang();
  const copy = deliveryCopy(config, lang);
  const [filter, setFilter] = useState("all");
  const key = "/api/payouts" + qs({ asset: filter === "all" ? null : filter, limit: 60 });
  // A stock filter shows its own receipts or says it's loading: never the unfiltered list under its chip (audit).
  const { data, error } = useSWR<PayoutList>(key, { fallbackData: filter === "all" ? initial : undefined, keepPreviousData: false });
  const s = (data ?? initial).summary;
  const late = s.status === "late";
  return (
    <div className="page">
      <h1 className="page-h">{t.title}</h1>
      <p className="page-lede">{t.lede(copy.payoutsLedeVerb)}</p>
      <div className="card tiles">
        <div><b className="g n">{usdFull(s.paidUsd)}</b><span>{t.tilePaid}</span></div>
        <div><b className="n">{s.rounds.toLocaleString("en-US")}</b><span>{t.tileRounds}</span></div>
        <div><b className="n">{s.walletPayments.toLocaleString("en-US")}</b><span>{t.tileWallets}</span></div>
        {/* The round's pool to the cent, as the prototype shows it. */}
        <div><b className="n" suppressHydrationWarning>${s.pendingUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b><span>{t.tilePending}</span></div>
      </div>
      <div className={"card meter" + (late ? " late" : "")}>
        <div className="top">
          <h3>{t.meter}</h3>
          <span className={"ontime" + (late ? " late" : "")}>
            <i className="live" aria-hidden="true" />
            {late ? t.late(s.lateCoins) : t.onTime}
          </span>
        </div>
        <HourLine nextRoundAt={nextRoundAt} intervalSec={config.payouts.intervalSec} />
        <div className="lg">
          <span>{t.nextIn} <b className="n"><Countdown nextAt={nextRoundAt} /></b></span>
          <span>{t.lateNote(Math.round(config.payouts.lateAfterSec / 60))}</span>
        </div>
      </div>
      <div className="card rcard">
        <h2 className="panel-h">{t.receipts}</h2>
        <div className="chips" role="group" aria-label={t.filterLabel}>
          <button type="button" className="chip all" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t.all}</button>
          {assetsInUse.filter((a) => assets[a]).map((a) => (
            <button type="button" className="chip" key={a} aria-pressed={filter === a} onClick={() => setFilter(a)}>
              <Chip sym={a} />
              {a}
            </button>
          ))}
        </div>
        <div className="rtable">
          <table className="t">
            <thead>
              <tr>
                <th>{t.colCoin}</th>
                <th>{t.colWhen}</th>
                <th>{t.colPaid}</th>
                <th className="hide-s">{t.colValue}</th>
                <th className="hide-s">{t.colWallets}</th>
                <th>{t.colTx}</th>
              </tr>
            </thead>
            <tbody id="rcpt">
              {!data && (
                <tr>
                  <td colSpan={6} className="w empty-row">{error ? t.loadError : t.loading}</td>
                </tr>
              )}
              {data && !data.items.length && (
                <tr>
                  <td colSpan={6} className="w empty-row">{filter === "all" ? t.noReceipts : t.noReceiptsStock}</td>
                </tr>
              )}
              {data?.items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link className="coin-cell" href={coinHref(p.coin)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="tile" src={p.coin.imageUrl} alt="" width={34} height={34} loading="lazy" />
                      <b>${p.coin.ticker}</b>
                    </Link>
                  </td>
                  <td className="w" suppressHydrationWarning>{ago(p.hour)}</td>
                  <td className="n paid">{num(p.amount.ui)} {p.assetSymbol}</td>
                  <td className="n hide-s">{usd(p.usd)}</td>
                  <td className="n hide-s">{p.wallets.toLocaleString("en-US")}</td>
                  <td>
                    {p.sig ? (
                      <a className="tx" href={explorerTx(p.sig, config.network)} target="_blank" rel="noreferrer" title={t.viewTitle}>
                        {t.view}
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
