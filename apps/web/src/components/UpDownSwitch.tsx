"use client";

import { useMsgs, useUpDown } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";

/**
 * Green up / red up (prototype footer `.ud`). Crypto apps mostly show gains in green, the default; Chinese
 * stock apps in red. Kept in a cookie.
 */
export function UpDownSwitch() {
  const [upDown, setUpDown] = useUpDown();
  const t = useMsgs(common);
  return (
    <div className="ud" role="group" aria-label={t.upDown}>
      <span>{t.upDown}</span>
      <div className="seg sm">
        <button type="button" aria-pressed={upDown === "intl"} onClick={() => setUpDown("intl")}>{t.upDownIntl}</button>
        <button type="button" aria-pressed={upDown === "cn"} onClick={() => setUpDown("cn")}>{t.upDownCn}</button>
      </div>
    </div>
  );
}
