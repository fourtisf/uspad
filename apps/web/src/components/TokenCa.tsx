"use client";

/**
 * hwai's own token, $HWAI on pump.fun (owner, 2026-11-02): its contract address from NEXT_PUBLIC_TOKEN_CA
 * (read at build time, set with `go-live.sh token-ca`), as a pill in the hero (TokenCa) and a card on the
 * board (OfficialToken). Without one the pill says "coming soon" and there is no card.
 */
import { short } from "@divvy/shared";
import { Icon } from "./Icon";
import { Mark } from "./Mark";
import { useToast } from "./Toasts";
import { BRAND } from "@/lib/brand";
import { useMsgs } from "@/i18n/client";
import { hero } from "@/i18n/msgs/hero";

const raw = (process.env.NEXT_PUBLIC_TOKEN_CA ?? "").trim();
const CA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw) ? raw : "";
/**
 * Where the button buys it: pump.fun for its mints (they end in "pump"), DexScreener for any other. The
 * card doesn't name the venue (owner, 2026-11-02: no pump.fun branding on hwai).
 */
const BUY_URL = !CA ? "" : CA.endsWith("pump") ? `https://pump.fun/coin/${CA}` : `https://dexscreener.com/solana/${CA}`;

export function TokenCa() {
  const toast = useToast();
  const t = useMsgs(hero);
  if (!CA) {
    return (
      <span className="pill ca-pill">
        <span>
          <b>CA:</b> {t.caSoon}
        </span>
      </span>
    );
  }
  const copy = () => navigator.clipboard?.writeText(CA).then(() => toast(t.caCopied), () => {});
  return (
    <button type="button" className="pill ca-pill" onClick={copy} title={CA} aria-label={t.copyCa(CA)}>
      <span>
        <b>CA:</b> {short(CA)}
      </span>
      <Icon name="copy" size={13} />
    </button>
  );
}

/** The official token's card on the board: what it is, its CA to copy, and where it trades. */
export function OfficialToken() {
  const toast = useToast();
  const t = useMsgs(hero);
  if (!CA) return null;
  const copy = () => navigator.clipboard?.writeText(CA).then(() => toast(t.caCopied), () => {});
  return (
    <section className="official" aria-labelledby="officialH">
      <span className="official-mark"><Mark size={64} /></span>
      <div className="official-info">
        <span className="official-tag">{t.officialTag}</span>
        <h2 id="officialH">${BRAND.toUpperCase()}</h2>
        <p>{t.officialP(BRAND)}</p>
      </div>
      <button type="button" className="official-ca" onClick={copy} title={CA} aria-label={t.copyCa(CA)}>
        <span>CA</span>
        <b className="num">{CA}</b>
        <Icon name="copy" size={15} />
      </button>
      <a className="btn btn-lime" href={BUY_URL} target="_blank" rel="noopener noreferrer">{t.buyToken(BRAND.toUpperCase())} ↗</a>
    </section>
  );
}
