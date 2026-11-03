"use client";

import Link from "next/link";
import { pct, usd, usdFull } from "@divvy/shared";
import { Chip } from "./Chip";
import { Countdown } from "./Countdown";
import { Spark } from "./Spark";
import { coinHref } from "@/lib/links";
import { shareLabel } from "@/lib/devbuy";
import { useMsgs } from "@/i18n/client";
import { board } from "@/i18n/msgs/board";
import { common } from "@/i18n/msgs/common";

export interface CardCoin {
  name: string;
  ticker: string;
  /** Links the card to this coin's page; coins can share a ticker. */
  mint?: string;
  imageUrl: string;
  pays: string;
  mcap: number;
  ch: number;
  /** Minutes since launch. */
  ageMin: number;
  creatorLabel: string;
  progress: number;
  graduated: boolean;
  paidUsd: number;
  /** Paid to holders in the last 24 hours; without it the card shows what the coin has paid in all. */
  paid24hUsd?: number;
  holders: number;
  spark: number[];
  /** Share of supply the creator bought in the create (owner decision 2026-10-28); 0 or absent for none. */
  devBuyPct?: number;
}

/** Whole dollars from $1,000 up ("$3,412", as the prototype's cards), cents below ("$0.37"). */
export const money = (v: number): string => (v >= 1000 ? usdFull(v) : usd(v));

/** The top of the current hour, as the API sets rounds (UTC hours); Countdown rolls it on to the next one. */
const thisHour = (): string => new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString();

/** A coin's picture in the prototype's `.tile` box (its size and corners come from where it sits). */
export function CoinPic({ src }: { src: string }) {
  return (
    <span className="tile pic">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

/**
 * A coin as a card (prototype `.cc`): picture, name, ticker, 24h change, market cap, age, the bonding curve
 * while it's on one, a sparkline, and the stock it pays in with what it paid in 24 hours, or the countdown to
 * its first round. Phones fold it into a row (globals.css; `.nocurve` for graduated coins). Used on the home
 * page, the list of coins that share a ticker, and the create page's preview (`asDiv`, not a link).
 * `creator` adds who made it (where coins share a ticker it tells them apart); `nextRoundAt` is the API's.
 */
export function CoinCard({ c, asDiv = false, creator = true, nextRoundAt }: { c: CardCoin; asDiv?: boolean; creator?: boolean; nextRoundAt?: string }) {
  const t = useMsgs(board);
  const ago = useMsgs(common).ago;
  const curve = Math.round(c.progress * 100);
  const when = c.graduated ? t.badgeGraduated : creator ? t.agoBy(ago(c.ageMin), c.creatorLabel) : ago(c.ageMin);
  const dev = c.devBuyPct ? shareLabel(c.devBuyPct) : "";
  const body = (
    <>
      <div className="hd">
        <CoinPic src={c.imageUrl} />
        <div className="nm">
          <b>{c.name}</b>
          <small>${c.ticker}</small>
        </div>
        <span className={"chg n " + (c.ch >= 0 ? "up" : "dn")}>{pct(c.ch)}</span>
      </div>
      <div className="mc n">{usd(c.mcap)}</div>
      <div className="lbl" title={dev ? t.devBadgeTitle(dev) : undefined} suppressHydrationWarning>
        {t.mcapLabel(dev ? `${when} · ${t.devBadge(dev)}` : when)}
      </div>
      {!c.graduated && (
        <div className="curve">
          {t.curve}
          <span className="bar"><i style={{ width: (c.progress * 100).toFixed(1) + "%" }} /></span>
          <span className="n">{curve}%</span>
        </div>
      )}
      <div className="sp">{c.spark.length > 1 ? <Spark values={c.spark} /> : <span className="sp-none">{t.noChart}</span>}</div>
      <div className="ft">
        <span className="stock">
          <Chip sym={c.pays} />
          {c.pays}
        </span>
        {c.paidUsd > 0 ? (
          <span className="paid n">{c.paid24hUsd !== undefined ? t.paid24h(money(c.paid24hUsd)) : t.paidTotal(money(c.paidUsd))}</span>
        ) : (
          <span className="wait">{t.firstRound(<span className="n"><Countdown nextAt={nextRoundAt ?? thisHour()} /></span>)}</span>
        )}
      </div>
    </>
  );
  const cls = "card cc" + (c.graduated ? " nocurve" : "");
  return asDiv ? (
    <div className={cls + " preview"}>{body}</div>
  ) : (
    <Link className={cls} href={coinHref(c)}>
      {body}
    </Link>
  );
}
