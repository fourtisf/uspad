"use client";

import type { CSSProperties } from "react";
import { useAssets } from "@/lib/config";
import { stockLogo } from "@/lib/logos";

/**
 * A dividend stock's round icon (prototype `.stk`): the token's own logo, or its monogram on its colour when
 * there's none. `chip-stock` stays on it for the places that size it by that name.
 */
export function Chip({ sym }: { sym: string }) {
  const a = useAssets()[sym];
  const logo = stockLogo(sym);
  if (logo) {
    return (
      <span className="stk chip-stock chip-logo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }
  const mono = a?.mono ?? sym.slice(0, 2);
  const style = { "--c": a?.chipBg ?? "var(--tx3)", color: a?.chipFg } as CSSProperties;
  return (
    <span className={"stk chip-stock" + (mono.length > 2 ? " m3" : "")} style={style} aria-hidden="true">
      {mono}
    </span>
  );
}
