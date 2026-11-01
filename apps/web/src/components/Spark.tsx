import { useId } from "react";

/**
 * A sparkline with a fading area under it (prototype `spark`): green when the series ends higher than it
 * starts, red otherwise, following the up/down setting. `values` are oldest first; fewer than two draws nothing.
 */
export function Spark({ values, className = "spark", w = 260, h = 54 }: { values: number[]; className?: string; w?: number; h?: number }) {
  const id = useId();
  if (values.length < 2) return null;
  const up = values[values.length - 1]! >= values[0]!;
  const col = up ? "var(--up)" : "var(--down)";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 5;
  const d = values
    .map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * w).toFixed(1)} ${(pad + (1 - (v - min) / range) * (h - 2 * pad)).toFixed(1)}`)
    .join("");
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={{ stopColor: col, stopOpacity: 0.3 }} />
          <stop offset="1" style={{ stopColor: col, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${d}L${w} ${h}L0 ${h}Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" style={{ stroke: col }} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
