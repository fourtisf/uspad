/**
 * "Share on X" (owner, 2026-11-02): opens X's composer with a line and the coin's link, whose card is the
 * coin's own share image (app/og/coin/[mint]). The link is this site's origin, read at click time.
 */
export function shareOnX(text: string, path: string): void {
  const url = new URL(path, window.location.origin).toString();
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
}
