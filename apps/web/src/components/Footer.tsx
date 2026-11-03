import Link from "next/link";
import { TELEGRAM_HANDLE, TELEGRAM_URL, X_HANDLE, X_URL } from "@/lib/social";
import { BRAND, BRAND_LATIN } from "@/lib/brand";
import { getLang, getMsgs } from "@/i18n/server";
import { common } from "@/i18n/msgs/common";
import { Mark } from "./Mark";
import { UpDownSwitch } from "./UpDownSwitch";

/** The footer (prototype `footer.foot`): the brand, what the site is, the terms, and the up/down colours. */
export async function Footer({ demo }: { demo: boolean }) {
  const [t, lang] = await Promise.all([getMsgs(common), getLang()]);
  return (
    <footer className="foot">
      <div className="wrap">
        <span className="brand">
          <Mark size={28} />
          {BRAND}
          {lang === "en" && <small>{BRAND_LATIN}</small>}
        </span>
        <span>
          {demo && <>{t.footDemo} </>}
          {/* Each account shows once its handle is set (lib/social.ts). */}
          {X_HANDLE && (
            <>
              {t.footFollow} <a href={X_URL} target="_blank" rel="noopener noreferrer">@{X_HANDLE}</a> {TELEGRAM_HANDLE ? t.footOnX : t.footOnXEnd}
              {TELEGRAM_HANDLE ? " " : ""}
            </>
          )}
          {TELEGRAM_HANDLE && (
            <>
              {X_HANDLE ? "" : `${t.footJoin} `}
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Telegram</a>
              {t.footEnd}
            </>
          )}
          {(X_HANDLE || TELEGRAM_HANDLE) && " "}
          {t.footStocks} <Link href="/terms">{t.terms}</Link>
        </span>
        <UpDownSwitch />
      </div>
    </footer>
  );
}
