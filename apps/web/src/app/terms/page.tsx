import type { Metadata } from "next";
import { bpsLabel, type Config } from "@divvy/shared";
import { sharedApi } from "@/lib/server-api";
import { getMsgs } from "@/i18n/server";
import { terms } from "@/i18n/msgs/terms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getMsgs(terms)).metaTitle };
}

/**
 * Terms of use. The wording is a starting point for the owner's lawyers (HANDOFF §10), not final
 * legal text; the draft notice stays until NEXT_PUBLIC_TERMS_FINAL=true.
 */
export default async function TermsPage() {
  const [c, t] = await Promise.all([sharedApi<Config>("/api/config"), getMsgs(terms)]);
  const draft = process.env.NEXT_PUBLIC_TERMS_FINAL !== "true";
  return (
    <div className="page">
      <h1 className="page-h">{t.title}</h1>
      {draft && <p className="warn terms-draft">{t.draft}</p>}
      {/* Chinese only: the English version prevails. */}
      {t.prevails && <p className="note">{t.prevails}</p>}
      <article className="card terms">
        <h2>{t.whatTitle}</h2>
        <p>{t.whatBody(c.payouts.delivery === "claim")}</p>
        <h2>{t.stocksTitle}</h2>
        <p>{t.stocksBody}</p>
        <h2>{t.riskTitle}</h2>
        <p>{t.riskBody}</p>
        <h2>{t.feesTitle}</h2>
        <p>
          {t.feesBody({ trade: c.fees.tradeFeeBps / 100, holders: bpsLabel(c.fees.holdersBps), creator: bpsLabel(c.fees.creatorBps), divvy: bpsLabel(c.fees.divvyBps), protocol: bpsLabel(c.fees.protocolBps) })}
        </p>
        <h2>{t.moderationTitle}</h2>
        <p>{t.moderationBody}</p>
        <h2>{t.dataTitle}</h2>
        <p>{t.dataBody}</p>
      </article>
    </div>
  );
}
