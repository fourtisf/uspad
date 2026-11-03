"use client";

import { LANG_COOKIE, htmlLang, parseLang } from "@/i18n/lang";
import { common } from "@/i18n/msgs/common";

/**
 * Last resort when the root layout itself fails (e.g. /api/config is unreachable). No providers and no
 * stylesheet here, so it carries the 金牛 look inline: the white page, a card and the gold button.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const lang = parseLang(typeof document === "undefined" ? null : document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))?.[1]);
  const t = common[lang];
  return (
    <html lang={htmlLang(lang)}>
      <body
        style={{
          background: "#FFFFFF",
          color: "#0A0A0A",
          fontFamily: '"Inter Tight","Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div role="alert" style={{ textAlign: "center", padding: "40px 32px", borderRadius: 24, boxShadow: "0 0 0 1px #EEEEEE", maxWidth: 420 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t.serverDown}</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 18, height: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#FFC21A", color: "#111", font: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {t.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
