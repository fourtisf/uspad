import { useId } from "react";

/**
 * A sparkline (prototype `line`): green when the series ends higher than it starts, red otherwise, following
 * the up/down setting. `area` adds the fading fill under it (the featured coin's chart). `values` are oldest
 * first; fewer than two draws nothing.
 */
export function Spark({ values, className, w = 200, h = 40, area = false }: { values: number[]; className?: string; w?: number; h?: number; area?: boolean }) {
  const id = "sp" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  if (values.length < 2) return null;
  const up = values[values.length - 1]! >= values[0]!;
  const col = up ? "var(--up)" : "var(--dn)";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const y = (v: number) => h - 4 - ((v - min) / range) * (h - 10);
  const d = values.map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * w).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      {area && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: col, stopOpacity: 0.22 }} />
              <stop offset="1" style={{ stopColor: col, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={`${d} L${w} ${h} L0 ${h}Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" style={{ stroke: col }} strokeWidth={area ? 2.2 : 1.8} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
