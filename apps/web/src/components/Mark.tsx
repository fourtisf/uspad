import { useId } from "react";
import { BRAND, BRAND_LATIN } from "@/lib/brand";

/** The infinity loop (owner, 2026-11-05): the dividend cycle, drawn as one continuous stroke. */
const LOOP = "M120 120 C120 80 92 64 76 64 C48 64 36 92 36 120 C36 148 48 176 76 176 C104 176 120 120 120 120 C120 120 136 64 164 64 C192 64 204 92 204 120 C204 148 192 176 164 176 C148 176 120 160 120 120 Z";

/**
 * The 红利 mark (owner, 2026-11-05: an emerald infinity loop — the dividend cycle — on a dark tile,
 * replacing the brush 红). brand/hongli/src/mark.cjs renders the same as the PNG files. The gradient ids
 * are per instance, so several marks on one page don't share them.
 */
export function Mark({ size = 34 }: { size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}t`} cx="32%" cy="22%" r="92%">
          <stop offset="0" stopColor="#0E2A1D" />
          <stop offset="1" stopColor="#05110B" />
        </radialGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6BFBB4" />
          <stop offset=".5" stopColor="#19D877" />
          <stop offset="1" stopColor="#06A452" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="224" height="224" rx="56" fill={`url(#${id}t)`} />
      <rect x="8.75" y="8.75" width="222.5" height="222.5" rx="55.25" fill="none" stroke="#FFFFFF" strokeOpacity={0.08} />
      <path d={LOOP} fill="none" stroke={`url(#${id}g)`} strokeWidth="22" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The 红利 wordmark: 红利 with "hongli" small beside it. It goes inside a `.brand` lockup next to the Mark
 * (prototype/hongli-prototype.html), which sets the faces and the gap.
 */
export function Wordmark() {
  return (
    <>
      {BRAND}
      <small>{BRAND_LATIN}</small>
    </>
  );
}
