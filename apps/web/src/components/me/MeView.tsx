"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { num, short, sol, usd, type CreatorInfo, type MyPayouts } from "@divvy/shared";
import { api } from "@/lib/api";
import { useConfig } from "@/lib/config";
import { useErrorText, useSession } from "@/lib/session";
import { explorerTx, signAndSend } from "@/lib/tx";
import { Chip } from "../Chip";
import { Countdown } from "../Countdown";
import { Icon } from "../Icon";
import { Mark } from "../Mark";
import { useToast } from "../Toasts";
import { coinHref } from "@/lib/links";
import { useAgo, useMsgs } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";
import { me as meMsgs } from "@/i18n/msgs/me";

/** The connected wallet's own page: what it can claim, what it was paid, and its coins' creator fees. */
export function MeView({ nextRoundAt }: { nextRoundAt: string | null }) {
  const config = useConfig();
  const toast = useToast();
  const t = useMsgs(meMsgs);
  const tc = useMsgs(common);
  const ago = useAgo();
  const errorText = useErrorText();
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { me, ensureSignedIn, signOut, refresh } = useSession();
  const addr = wallet.publicKey?.toBase58() ?? null;
  const signedIn = !!addr && me?.wallet === addr;
  // Cached per wallet, and never showing the last key's data while loading: after a wallet switch, the
  // previous wallet's payouts and claimable fees must not show for a moment (audit).
  const mine = { keepPreviousData: false };
  const { data: payouts, mutate: reloadPayouts } = useSWR(signedIn ? ["/api/me/payouts?limit=50", addr] : null, ([path]) => api<MyPayouts>(path), mine);
  const { data: creator, mutate: reloadCreator } = useSWR(signedIn ? ["/api/me/creator", addr] : null, ([path]) => api<CreatorInfo>(path), mine);
  const [busy, setBusy] = useState<string | null>(null);
  const claimModel = config.payouts.delivery === "claim";

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      const m = errorText(e, t.failed);
      if (m) toast(m);
    } finally {
      setBusy(null);
    }
  };

  const claim = (assetSymbol: string) =>
    run(assetSymbol, async () => {
      const { tx } = await api<{ tx: string }>("/api/claims/build", { method: "POST", body: JSON.stringify({ assetSymbol }) });
      await signAndSend(wallet, connection, tx, { network: config.network, kind: "claim" });
      toast(t.claimed(assetSymbol));
      await Promise.all([refresh(), reloadPayouts()]);
    });

  const claimCreator = () =>
    run("creator", async () => {
      const { tx } = await api<{ tx: string }>("/api/me/creator/claim/build", { method: "POST" });
      await signAndSend(wallet, connection, tx, { network: config.network, kind: "creator-claim" });
      toast(t.creatorClaimed);
      await reloadCreator();
    });

  if (!addr) {
    return (
      <div className="page">
        <h1 className="page-h">{t.title}</h1>
        <p className="page-lede">{t.connectLede}</p>
        <div className="card connect">
          <Mark size={80} />
          <h3>{t.connectTitle}</h3>
          <p>{t.connectBody}</p>
          <button className="btn btn-acc btn-lg" type="button" onClick={() => setVisible(true)}>{tc.connectWallet}</button>
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="page">
        <h1 className="page-h">{t.title}</h1>
        <p className="page-lede">{t.connectLede}</p>
        <div className="card connect">
          <Mark size={80} />
          <h3>{t.signInTitle}</h3>
          <p>{t.signInLede}</p>
          <div className="acts">
            <button className="btn btn-acc btn-lg" type="button" disabled={busy === "signin"} onClick={() => run("signin", async () => void (await ensureSignedIn()))}>
              {t.signInAs(short(addr))}
            </button>
            <button className="btn btn-line btn-lg" type="button" onClick={() => void wallet.disconnect()}>{t.disconnect}</button>
          </div>
        </div>
      </div>
    );
  }

  const claimable = me?.claimable ?? [];
  const waitingUsd = claimable.reduce((a, c) => a + c.usd, 0);
  // The newest round this wallet was paid in: every payout from that hour (the list is newest first).
  const lastHour = payouts?.items[0]?.hour ?? null;
  const lastRound = lastHour ? payouts!.items.filter((p) => p.hour === lastHour) : [];
  const lastRoundUsd = lastRound.reduce((a, p) => a + p.usd, 0);
  const lastRoundCoins = new Set(lastRound.map((p) => p.coin.mint)).size;
  const oneCoin = creator?.coins.length === 1 ? creator.coins[0] : null;
  return (
    <div className="page">
      <h1 className="page-h">{t.title}</h1>
      <p className="page-lede">
        {t.lede(short(addr) + (me?.x ? ` · @${me.x.handle}` : ""), claimModel)}
      </p>
      <div className="me-actions">
        <button className="btn btn-line btn-sm" type="button" onClick={() => void signOut()}>{t.signOut}</button>
        <button className="btn btn-line btn-sm" type="button" onClick={() => void signOut().then(() => wallet.disconnect())}>{t.disconnect}</button>
      </div>
      {me?.blocked && <p className="warn me-warn">{t.blocked}</p>}

      {/* First for creators, so their fees are easy to find. */}
      {creator && creator.coins.length > 0 && (
        <section className="card cfee" id="creatorFees" aria-label={t.creatorTitle}>
          {oneCoin ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tile" src={oneCoin.imageUrl} alt="" width={52} height={52} />
          ) : (
            <span className="tile cfee-ico" aria-hidden="true"><Icon name="wallet" size={24} /></span>
          )}
          <div>
            <b>{t.creatorAmount(sol(creator.claimable.ui))}</b>
            <span>{t.creatorNote((config.fees.creatorBps / 100).toFixed(2))}</span>
          </div>
          <button className="btn btn-acc" type="button" disabled={!!busy || creator.claimable.raw === "0"} onClick={() => void claimCreator()}>
            {busy === "creator" ? t.claiming : creator.claimable.raw === "0" ? t.nothingToClaim : t.claimAmount(sol(creator.claimable.ui))}
          </button>
          <div className="rtable cfee-coins">
            <table className="t">
              <thead><tr><th>{t.colCoin}</th><th className="hide-s">{t.colStatus}</th><th>{t.colEarned}</th></tr></thead>
              <tbody>
                {creator.coins.map((c) => (
                  <tr key={c.mint}>
                    <td>
                      <Link className="coin-cell" href={coinHref(c)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="tile" src={c.imageUrl} alt="" width={34} height={34} loading="lazy" />
                        <b>{c.name}</b>
                        <small>${c.ticker}</small>
                      </Link>
                    </td>
                    <td className="w hide-s">{c.status === "graduated" ? t.graduated : t.onCurve}</td>
                    <td className="n">{sol(c.creatorFees.ui)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mesum">
        <div className="card first">
          <span>{t.lastRound}</span>
          <b className="n">{payouts ? usd(lastRoundUsd) : "…"}</b>
          <small suppressHydrationWarning>{!payouts ? "\u00a0" : lastHour ? t.lastRoundNote(lastRoundCoins, ago(lastHour)) : t.noRoundYet}</small>
        </div>
        <div className="card">
          <span>{claimModel ? t.readyToClaim : t.waitingToSend}</span>
          <b className="n">{usd(waitingUsd)}</b>
          <small>{claimable.length ? t.stocks(claimable.length) : t.nothing}</small>
        </div>
        {nextRoundAt && (
          <div className="card">
            <span>{t.nextRound}</span>
            <b className="n"><Countdown nextAt={nextRoundAt} /></b>
            <small>{t.nextNote(usd(config.payouts.minHolderUsd))}</small>
          </div>
        )}
      </div>

      <div className="card hold">
        <h2 className="panel-h">{claimModel ? t.readyToClaim : t.waitingToSend}</h2>
        {claimable.length === 0 ? (
          <p className="note">{t.nothingYet}</p>
        ) : (
          <div className="rtable">
            <table className="t">
              <thead><tr><th>{t.colStock}</th><th>{t.colAmount}</th><th className="hide-s">{t.colValue}</th><th /></tr></thead>
              <tbody>
                {claimable.map((c) => (
                  <tr key={c.assetSymbol}>
                    <td><span className="coin-cell"><Chip sym={c.assetSymbol} /><b>{c.assetSymbol}</b></span></td>
                    <td className="n paid">{num(c.amount.ui)}</td>
                    <td className="n hide-s">{usd(c.usd)}</td>
                    <td>
                      {claimModel ? (
                        <button className="btn btn-acc btn-sm" type="button" disabled={!!busy || !!me?.blocked} onClick={() => void claim(c.assetSymbol)}>
                          {busy === c.assetSymbol ? t.claiming : t.claim}
                        </button>
                      ) : (
                        <span className="w">{t.sentOnce(usd(config.payouts.autoPushMinUsd ?? 1))}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card hold">
        <h2 className="panel-h">{t.history}</h2>
        {!payouts?.items.length ? (
          <p className="note">{t.noPayouts}</p>
        ) : (
          <div className="rtable">
            <table className="t">
              <thead><tr><th>{t.colCoin}</th><th>{t.colWhen}</th><th>{t.colAmount}</th><th className="hide-s">{t.colValue}</th><th className="hide-s">{t.colStatus}</th><th>{t.colTx}</th></tr></thead>
              <tbody>
                {payouts.items.map((p) => (
                  <tr key={`${p.coin.mint}-${p.hour}`}>
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
                    <td className="w hide-s">{t.status[p.status]}</td>
                    <td>{p.sig ? <a className="tx" href={explorerTx(p.sig, config.network)} target="_blank" rel="noreferrer" title={p.sig}>{t.view}</a> : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
