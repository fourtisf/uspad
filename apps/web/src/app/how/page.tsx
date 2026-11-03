import Link from "next/link";
import { bpsLabel, usd, type Config } from "@divvy/shared";
import { sharedApi } from "@/lib/server-api";
import { deliveryCopy } from "@/lib/copy";
import { BRAND, BRAND_LATIN } from "@/lib/brand";
import { getLang, getMsgs } from "@/i18n/server";
import { how } from "@/i18n/msgs/how";
import { POOL_CREATOR_FEE_BPS, POOL_CREATOR_RAYDIUM_SHARE, POOL_FEE_BPS, POOL_RAYDIUM_SHARE, poolFees } from "@/lib/poolfees";

const pctLabel = (bps: number) => `${+(bps / 100).toFixed(2)}%`;
const tokens = (v: number) => (v >= 1e9 ? `${+(v / 1e9).toFixed(2)}B` : `${+(v / 1e6).toFixed(1)}M`);
const usdShort = (v: number) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`);

export default async function HowPage() {
  const [c, t, lang] = await Promise.all([sharedApi<Config>("/api/config"), getMsgs(how), getLang()]);
  const f = c.fees;
  const g = c.graduation;
  const raiseSol = +g.quoteFundRaising.ui.toFixed(1);
  const copy = deliveryCopy(c, lang);

  const w = f.afterGraduation;
  const shared = w.holders + w.creator + w.divvy;
  const share = (v: number) => `${Math.round((v / shared) * 100)}%`;
  const after = poolFees(w);

  // Where a curve trade's fee goes, in the prototype's order and colours (its fee bar and table), with
  // what the same share is after graduation.
  const split = [
    { label: t.rowHolders, bps: f.holdersBps, after: after.holders, color: "var(--acc)" },
    { label: lang === "zh" ? BRAND : BRAND_LATIN, bps: f.divvyBps, after: after.divvy, color: "#8A6A1F" },
    { label: "Raydium", bps: f.protocolBps, after: after.raydium, color: "var(--tx3)" },
    { label: t.rowCreator, bps: f.creatorBps, after: after.creator, color: "var(--green)" },
  ];
  const curveTotal = split.reduce((a, x) => a + x.bps, 0) || 1;

  const steps: { title: string; body: string }[] = [
    {
      title: t.step1Title,
      body: t.step1Body(c.launchFee.to ? t.launchCostFee(c.launchFee.amount.ui, c.launchFee.createCost.ui) : c.launchFee.createCost.ui ? t.launchCostCreate(c.launchFee.createCost.ui) : t.launchFree),
    },
    { title: t.step2Title, body: t.step2Body },
    { title: t.step3Title, body: t.step3Body },
    {
      title: t.step4Title(pctLabel(f.tradeFeeBps)),
      body: t.step4Body({ holders: bpsLabel(f.holdersBps), creator: bpsLabel(f.creatorBps), divvy: bpsLabel(f.divvyBps), protocol: bpsLabel(f.protocolBps) }),
    },
    { title: t.step5Title(bpsLabel(f.protocolBps)), body: t.step5Body(bpsLabel(f.protocolBps), pctLabel(f.tradeFeeBps)) },
    {
      title: copy.howStepTitle,
      body: t.step6Body({ verb: copy.howStepVerb, extra: copy.howStepExtra, min: usd(c.payouts.minHolderUsd), lateMin: Math.round(c.payouts.lateAfterSec / 60) }),
    },
    {
      title: t.step7Title(raiseSol),
      body: t.step7Body({ total: tokens(g.totalSupply.ui), curve: tokens(g.curveSupply.ui), migrate: tokens(g.migrateSupply.ui), sol: raiseSol, cap: usdShort(g.targetUsd) }),
    },
    { title: t.step8Title, body: t.step8Body(raiseSol) },
    {
      title: t.step9Title(bpsLabel(after.total)),
      body: t.step9Body({
        total: bpsLabel(after.total),
        trade: pctLabel(f.tradeFeeBps),
        pool: pctLabel(POOL_FEE_BPS),
        creatorFee: pctLabel(POOL_CREATOR_FEE_BPS),
        raydiumPool: Math.round(POOL_RAYDIUM_SHARE * 100),
        raydiumCreator: Math.round(POOL_CREATOR_RAYDIUM_SHARE * 100),
        holders: share(w.holders),
        creator: share(w.creator),
        divvy: share(w.divvy),
      }),
    },
  ];

  return (
    <div className="page">
      <h1 className="page-h">{t.title}</h1>
      <p className="page-lede">{t.lede}</p>
      <ol className="steps">
        {steps.map((s, i) => (
          <li className="card hstep" key={i}>
            <div className="no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="sec" style={{ marginTop: 40 }}>
        <div className="sh"><h2>{t.feesTitle(pctLabel(f.tradeFeeBps))}</h2></div>
        <div className="card fees">
          <div className="feebar" aria-hidden="true">
            {split.map((x) => <i key={x.color} style={{ width: `${(x.bps / curveTotal) * 100}%`, background: x.color }} />)}
          </div>
          <div className="rtable">
            <table className="t">
              <thead>
                <tr>
                  <th>{t.colTo}</th>
                  <th>{t.colCurve}</th>
                  <th>{t.colAfter}</th>
                </tr>
              </thead>
              <tbody>
                {split.map((x) => (
                  <tr key={x.color}>
                    <td><span className="sw" style={{ background: x.color }} />{x.label}</td>
                    <td className="n">{bpsLabel(x.bps)}</td>
                    <td className="n">{bpsLabel(x.after)}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>{t.rowTotal}</b></td>
                  <td className="n"><b>{bpsLabel(f.tradeFeeBps)}</b></td>
                  <td className="n"><b>{bpsLabel(after.total)}</b></td>
                </tr>
                <tr>
                  <td>{t.rowLiquidity}</td>
                  <td>{t.liqCurve}</td>
                  <td>{t.liqLocked}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="fine">
          <p>{t.fine1}</p>
          <p>{t.fine2}</p>
          <p>{t.fine3}</p>
          <p>{t.fine4}</p>
        </div>
        <Link className="btn btn-acc btn-lg" href="/create">{t.createCoin}</Link>
      </div>
    </div>
  );
}
