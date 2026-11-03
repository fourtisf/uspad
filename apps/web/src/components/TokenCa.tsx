"use client";

/**
 * The platform's own token: its contract address from NEXT_PUBLIC_TOKEN_CA and its ticker from
 * NEXT_PUBLIC_TOKEN_TICKER (both read at build time, set with `go-live.sh token-ca <CA> <TICKER>`), as a pill
 * in the pool card's eyebrow (TokenCa) and a card on the home page (OfficialToken). Without a CA the pill says
 * "CA：即将公布" / "CA: coming soon" and there is no card (owner, 2026-11-02: $HWAI stays hidden until the 金牛
 * token launches).
 */
import { short } from "@divvy/shared";
import { Icon } from "./Icon";
import { Mark } from "./Mark";
import { useToast } from "./Toasts";
import { BRAND, BRAND_LATIN, DOMAIN } from "@/lib/brand";
import { useLang } from "@/i18n/client";
import { useMsgs } from "@/i18n/client";
import { hero } from "@/i18n/msgs/hero";

const raw = (process.env.NEXT_PUBLIC_TOKEN_CA ?? "").trim();
const CA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw) ? raw : "";
const rawTicker = (process.env.NEXT_PUBLIC_TOKEN_TICKER ?? "").trim().replace(/^\$/, "").toUpperCase();
const TICKER = /^[A-Z0-9]{1,12}$/.test(rawTicker) ? rawTicker : BRAND_LATIN.toUpperCase();
const X_HANDLE = (process.env.NEXT_PUBLIC_X_HANDLE ?? "").trim().replace(/^@/, "");
/**
 * Where the button buys it: pump.fun for its mints (they end in "pump"), DexScreener for any other. The
 * card doesn't name the venue (owner, 2026-11-02: no pump.fun branding on the site).
 */
const BUY_URL = !CA ? "" : CA.endsWith("pump") ? `https://pump.fun/coin/${CA}` : `https://dexscreener.com/solana/${CA}`;

/** The pill in the pool card's eyebrow (prototype `#caPill`): the CA to copy, or "coming soon". */
export function TokenCa() {
  const toast = useToast();
  const t = useMsgs(hero);
  if (!CA) return <span className="pill">{t.officialPill(t.caSoon)}</span>;
  const copy = () => navigator.clipboard?.writeText(CA).then(() => toast(t.caCopied), () => {});
  return (
    <button type="button" className="pill" onClick={copy} title={CA} aria-label={t.copyCa(CA)}>
      <span className="n">{t.officialPill(short(CA))}</span>
      <Icon name="copy" size={13} />
    </button>
  );
}

/** The official token's card on the home page: what it is, its CA to copy, and where it trades. */
export function OfficialToken() {
  const toast = useToast();
  const t = useMsgs(hero);
  const [lang] = useLang();
  if (!CA) return null;
  const copy = () => navigator.clipboard?.writeText(CA).then(() => toast(t.caCopied), () => {});
  return (
    <section className="card otk" aria-labelledby="officialH">
      <Mark size={64} />
      <div className="otk-info">
        <span className="pill gold">{t.officialTag}</span>
        <h2 id="officialH">${TICKER}</h2>
        <p>{t.officialP(lang === "zh" ? BRAND : BRAND_LATIN, DOMAIN, X_HANDLE)}</p>
      </div>
      <button type="button" className="otk-ca" onClick={copy} title={CA} aria-label={t.copyCa(CA)}>
        <span>CA</span>
        <b className="n">{CA}</b>
        <Icon name="copy" size={15} />
      </button>
      <a className="btn btn-acc" href={BUY_URL} target="_blank" rel="noopener noreferrer">
        {t.buyToken(TICKER)}
        <Icon name="ext" size={16} />
      </a>
    </section>
  );
}
