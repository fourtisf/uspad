import { useId } from "react";
import { BRAND, BRAND_LATIN } from "@/lib/brand";

/**
 * The 红利 mark (owner, 2026-11-04: premium green): the brush 红 in white on an emerald tile. Drawn inline
 * from the Ma Shan Zheng face (loaded in layout); brand/hongli/src/mark.cjs renders the same as PNG files.
 * The gradient ids are per instance, so several marks on one page don't share them.
 */
export function Mark({ size = 34 }: { size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2DF08F" />
          <stop offset=".52" stopColor="#12D273" />
          <stop offset="1" stopColor="#04A455" />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
          <stop offset=".5" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="192" height="192" rx="46" fill={`url(#${id}t)`} />
      <rect x="4" y="4" width="192" height="192" rx="46" fill={`url(#${id}h)`} />
      <rect x="4.5" y="4.5" width="191" height="191" rx="45.5" fill="none" stroke="#FFFFFF" strokeOpacity={0.22} />
      <text x="100" y="106" textAnchor="middle" dominantBaseline="central" fontFamily="'Ma Shan Zheng', serif" fontSize="126" fill="#FFFFFF">
        红
      </text>
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
