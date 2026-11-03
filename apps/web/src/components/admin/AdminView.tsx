"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { useWallet } from "@solana/wallet-adapter-react";
import { ago, short, type AdminOverview, type AdminReportList } from "@divvy/shared";
import { api } from "@/lib/api";
import { errorText, useSession } from "@/lib/session";
import { useToast } from "../Toasts";
import { coinHref } from "@/lib/links";

const REASONS: Record<string, string> = { copy: "Copies another coin", scam: "Scam", nsfw: "Not safe for work", illegal: "Illegal", other: "Other" };

/** Admin page: launch switch, hot wallets, health, and the report queue. The API checks ADMIN_WALLETS. */
export function AdminView() {
  const toast = useToast();
  const { publicKey } = useWallet();
  const { me, ensureSignedIn } = useSession();
  const isAdmin = !!me?.isAdmin && me.wallet === publicKey?.toBase58();
  const { data: o, error: oError, mutate: reloadO } = useSWR<AdminOverview>(isAdmin ? "/api/admin/overview" : null, { refreshInterval: 30_000 });
  const { data: reports, mutate: reloadR } = useSWR<AdminReportList>(isAdmin ? "/api/admin/reports" : null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast(done);
      await Promise.all([reloadO(), reloadR()]);
    } catch (e) {
      const m = errorText(e, "That didn't work. Try again.");
      if (m) toast(m);
    } finally {
      setBusy(false);
    }
  };
  const post = (path: string, body: unknown) => api(path, { method: "POST", body: JSON.stringify(body) });

  if (!isAdmin) {
    return (
      <div className="page">
        <h1 className="page-h">Admin</h1>
        <p className="page-lede">{me?.wallet ? "This wallet isn't an admin." : "Sign in with an admin wallet."}</p>
        {!me?.wallet && (
          <button className="btn btn-acc btn-lg" type="button" onClick={() => void ensureSignedIn().catch((e) => toast(errorText(e, "Couldn't sign in") ?? ""))}>
            Sign in
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="page admin">
      <h1 className="page-h">Admin</h1>
      <p className="page-lede">
        {o ? `${o.mainnetEnabled ? "Mainnet sends are on" : "Mainnet sends are off"}. Payouts are ${o.dryRun ? "in dry-run" : "live"}.` : oError ? "Couldn't load the overview. It retries every 30 seconds." : "Loading…"}
      </p>
      {o && (
        <div className="card tiles">
          <div><b className={o.launchesOpen ? "ok" : "bad"}>{o.launchesOpen ? "Open" : "Paused"}</b><span>Launches</span></div>
          <div><b className="n">{o.pendingLaunches}</b><span>Launches in progress</span></div>
          <div><b className={"n" + (o.lateRounds ? " bad" : "")}>{o.lateRounds}</b><span>Late rounds, last 24h</span></div>
          <div><b className={"n" + ((o.indexerLagSec ?? 0) > 60 ? " bad" : "")}>{o.indexerLagSec === null ? "–" : `${o.indexerLagSec}s`}</b><span>Indexer lag</span></div>
        </div>
      )}

      <section className="card adm">
        <h2 className="panel-h">Launches</h2>
        {/* No switch until the real state is known (audit: it showed "paused" while loading). */}
        {!o ? (
          <p className="note">{oError ? "The launch switch shows once the overview loads." : "Loading…"}</p>
        ) : o.launchesOpen ? (
          <form
            className="adm-row"
            onSubmit={(e) => {
              e.preventDefault();
              void act(() => post("/api/admin/settings", { launchesOpen: false, reason: reason.trim() || null }), "Launches paused");
            }}
          >
            <label className="inp">
              <span className="sr">Reason</span>
              <input placeholder="Reason shown on the create page" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <button className="btn btn-danger" type="submit" disabled={busy}>Pause launches</button>
          </form>
        ) : (
          <div className="adm-row">
            <p className="note" style={{ margin: 0 }}>Paused: {o.launchesPausedReason ?? "no reason given"}</p>
            <button className="btn btn-acc" type="button" disabled={busy} onClick={() => void act(() => post("/api/admin/settings", { launchesOpen: true, reason: null }), "Launches open")}>
              Open launches
            </button>
          </div>
        )}
      </section>

      <section className="card adm">
        <h2 className="panel-h">Hot wallets</h2>
        {!o?.wallets.length ? (
          <p className="note">No wallet status yet. The worker reports balances every minute.</p>
        ) : (
          <div className="rtable">
            <table className="t">
              <thead><tr><th>Role</th><th>Address</th><th>Balance</th></tr></thead>
              <tbody>
                {o.wallets.map((w) => (
                  <tr key={w.role}>
                    <td>{w.role.replace("_", " ")}</td>
                    <td className="w" title={w.address}>{short(w.address)}</td>
                    <td className={"n" + (w.lowBalance ? " bad" : "")}>{w.sol.toFixed(3)} SOL{w.lowBalance ? ", low" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card adm">
        <h2 className="panel-h">Reports</h2>
        {!reports?.items.length ? (
          <p className="note">No open reports.</p>
        ) : (
          <div className="rtable">
            <table className="t">
              <thead><tr><th>Coin</th><th>Reason</th><th>When</th><th /></tr></thead>
              <tbody>
                {reports.items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link className="coin-cell" href={coinHref(r.coin)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="tile" src={r.coin.imageUrl} alt="" width={34} height={34} loading="lazy" />
                        <b>${r.coin.ticker}</b>
                        {r.coin.hidden && <small>hidden</small>}
                      </Link>
                    </td>
                    <td className="adm-reason">
                      {REASONS[r.reason] ?? r.reason}
                      {r.details && <small>{r.details}</small>}
                    </td>
                    <td className="w" suppressHydrationWarning>{ago(r.createdAt)}</td>
                    <td>
                      <div className="adm-acts">
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          disabled={busy}
                          onClick={() => void act(() => post(`/api/admin/coins/${r.coin.mint}/hide`, { hidden: !r.coin.hidden, reason: r.coin.hidden ? null : REASONS[r.reason] ?? r.reason }), r.coin.hidden ? "Coin shown again" : "Coin hidden")}
                        >
                          {r.coin.hidden ? "Unhide" : "Hide coin"}
                        </button>
                        <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => void act(() => post(`/api/admin/reports/${r.id}`, { status: "resolved" }), "Report resolved")}>Resolve</button>
                        <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => void act(() => post(`/api/admin/reports/${r.id}`, { status: "dismissed" }), "Report dismissed")}>Dismiss</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
