import { NIU, SEAL, TILT, WORD, WORD_BOX, WORD_RATIO } from "./markPaths";

/** The hwai mark: 牛 brushed in a hand-stamped lime seal (design 牛; its generator brand/hwai was deleted on 2026-11-02 and the 金牛 mark replaces this). */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g transform={`rotate(${TILT} 50 50)`}>
        <path d={SEAL} fill="#C3FF3C" fillRule="evenodd" />
        <path d={NIU} fill="#061006" />
      </g>
    </svg>
  );
}

/** The brush "hwai" wordmark, in the current text colour. */
export function Wordmark({ height = 24 }: { height?: number }) {
  return (
    <svg className="word" height={height} width={Math.round(height * WORD_RATIO)} viewBox={WORD_BOX} aria-hidden="true">
      <path d={WORD} fill="currentColor" />
    </svg>
  );
}
