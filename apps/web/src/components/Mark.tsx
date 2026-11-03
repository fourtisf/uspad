import { useId } from "react";
import { GLYPH } from "./jinniuMark";
import { BRAND, BRAND_LATIN } from "@/lib/brand";

/**
 * The 金牛 mark (owner, 2026-11-02 and 03: a white logo, no gold coin): the brush 牛 in glossy white, like
 * porcelain, on a soft grey tile. brand/jinniu/src/mark.cjs draws the same mark as files; the filter ids
 * are per instance, so several marks on one page don't share them.
 */
export function Mark({ size = 34 }: { size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F3F1" />
          <stop offset="1" stopColor="#DADAD6" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".6" stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#E2E2E0" />
        </linearGradient>
        <filter id={`${id}p`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b" />
          <feSpecularLighting in="b" surfaceScale={4.5} specularConstant={0.85} specularExponent={26} lightingColor="#fff" result="s">
            <feDistantLight azimuth={235} elevation={42} />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
          <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1={0} k2={1} k3={0.9} k4={0} result="lit" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="eb" />
          <feOffset in="eb" dx="0" dy="1.2" result="eo" />
          <feComposite in="SourceAlpha" in2="eo" operator="out" result="edge" />
          <feFlood floodColor="#000" floodOpacity={0.22} />
          <feComposite in2="edge" operator="in" result="edgeC" />
          <feMerge>
            <feMergeNode in="lit" />
            <feMergeNode in="edgeC" />
          </feMerge>
        </filter>
        <filter id={`${id}l`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2A2A26" floodOpacity={0.3} />
        </filter>
      </defs>
      <rect x="4" y="4" width="192" height="192" rx="46" fill={`url(#${id}t)`} />
      <rect x="4.5" y="4.5" width="191" height="191" rx="45.5" fill="none" stroke="#000" strokeOpacity={0.06} />
      <g filter={`url(#${id}l)`}>
        <path d={GLYPH} fill={`url(#${id}g)`} filter={`url(#${id}p)`} />
      </g>
    </svg>
  );
}

/** The 金牛 wordmark: 金牛 in the site's Han face at 900 and "jinniu" small beside it (owner, 2026-11-02). */
export function Wordmark() {
  return (
    <span className="word" aria-hidden="true">
      {BRAND}
      <small>{BRAND_LATIN}</small>
    </span>
  );
}
