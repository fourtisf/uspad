"use client";

import Link from "next/link";
import { pct, usd } from "@divvy/shared";
import { Chip } from "./Chip";
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
  holders: number;
  spark: number[];
  /** Share of supply the creator bought in the create (owner decision 2026-10-28); 0 or absent for none. */
  devBuyPct?: number;
}

/**
 * A coin as a card (prototype `.lcard`, the same as the home page's leaders): the create page's preview and
 * the list of coins that share a ticker. `asDiv` renders the preview, which isn't a link.
 */
export function CoinCard({ c, asDiv = false }: { c: CardCoin; asDiv?: boolean }) {
  const t = useMsgs(board);
  const ago = useMsgs(common).ago;
  const isNew = c.ageMin < 20;
  const body = (
    <>
      <div className="top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="av" src={c.imageUrl} alt="" width={42} height={42} loading="lazy" style={{ width: 42, height: 42, borderRadius: 12 }} />
        <div>
          <div className="nm">{c.name}</div>
          <div className="tk" suppressHydrationWarning>${c.ticker} · {t.agoBy(ago(c.ageMin), c.creatorLabel)}</div>
        </div>
        {isNew ? <span className="badge new">{t.badgeNew}</span> : <span className={"chg " + (c.ch >= 0 ? "up" : "down")}>{pct(c.ch)}</span>}
      </div>
      {c.spark.length > 1 ? <Spark values={c.spark} /> : <div className="spark-empty">{t.noChart}</div>}
      <div className="mc">
        <b>{usd(c.mcap)}</b>
        <span>{c.graduated ? t.badgeGraduated : t.curveShort(Math.round(c.progress * 100) + "%")}</span>
      </div>
      <div className="bar"><i style={{ width: (c.graduated ? 100 : c.progress * 100).toFixed(1) + "%" }} /></div>
      <div className="pays">
        <strong><Chip sym={c.pays} />{c.pays}</strong>
        <span className="tab">
          {t.paidOut} <b>{usd(c.paidUsd)}</b> · {c.holders.toLocaleString("en-US")} {t.holders}
        </span>
      </div>
      {c.devBuyPct ? <div className="dev" title={t.devBadgeTitle(shareLabel(c.devBuyPct))} style={{ marginTop: 8 }}>{t.devBadge(shareLabel(c.devBuyPct))}</div> : null}
    </>
  );
  return asDiv ? (
    <div className="lcard">{body}</div>
  ) : (
    <Link className="lcard" href={coinHref(c)}>
      {body}
    </Link>
  );
}
