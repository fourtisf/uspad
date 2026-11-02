/**
 * A coin's share image (1200 x 630), the card X and Telegram show for its link (owner, 2026-11-02): its
 * picture, name and ticker, market cap and 24h move, holders, what holders were paid, the stock it pays
 * in, its sparkline, and hwai's seal and wordmark. The coin page's metadata points here by mint (coins can
 * share a ticker). Rendered by next/og; the picture is stored as WebP, which next/og can't read, so sharp
 * turns it into a PNG first. Fonts: Noto Sans SC from Google Fonts, only the characters drawn.
 */
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { pct, usd, type CoinDetail } from "@divvy/shared";
import { api, ApiRequestError } from "@/lib/api";
import { BRAND, DOMAIN } from "@/lib/brand";
import { stockLogo } from "@/lib/logos";
import { NIU, SEAL, TILT, WORD, WORD_BOX } from "@/components/markPaths";

const MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const W = 1200;
const H = 630;
const LIME = "#C3FF3C";
const GREEN = "#2EF08A";
const RED = "#FF4D61";
const GOLD = "#FFC84A";

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const SEAL_URI = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="rotate(${TILT} 50 50)"><path d="${SEAL}" fill="${LIME}" fill-rule="evenodd"/><path d="${NIU}" fill="#061006"/></g></svg>`);
const WORD_URI = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORD_BOX}"><path d="${WORD}" fill="#ECF5EF"/></svg>`);
const [, , WORD_W, WORD_H] = WORD_BOX.split(" ").map(Number) as [number, number, number, number];

/** A sparkline as an image: an area under the line, green when it ends higher, red otherwise. */
function sparkUri(values: number[], w: number, h: number): string | null {
  if (values.length < 2) return null;
  const up = values[values.length - 1]! >= values[0]!;
  const col = up ? GREEN : RED;
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1, pad = 8;
  const d = values.map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * w).toFixed(1)} ${(pad + (1 - (v - min) / range) * (h - 2 * pad)).toFixed(1)}`).join("");
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${d}L${w} ${h}L0 ${h}Z" fill="url(#g)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  );
}

/** The coin's picture as a PNG data URI (it's stored as WebP), or null when it can't be had. */
async function pictureUri(url: string): Promise<string | null> {
  try {
    const abs = url.startsWith("http") ? url : (process.env.API_INTERNAL_URL || "http://127.0.0.1:4000") + url;
    const res = await fetch(abs, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 10 * 1024 * 1024) return null;
    const png = await sharp(buf, { animated: false, limitInputPixels: 40_000_000 }).resize(320, 320, { fit: "cover" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

async function stockUri(symbol: string): Promise<string | null> {
  const rel = stockLogo(symbol);
  if (!rel) return null;
  try {
    return `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", rel))).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Noto Sans SC at one weight, only the characters drawn (Google Fonts subsets by `text`), as TrueType. */
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();
function font(weight: 500 | 900, text: string): Promise<ArrayBuffer | null> {
  const chars = [...new Set(text)].sort().join("");
  const key = `${weight}:${chars}`;
  let hit = fontCache.get(key);
  if (!hit) {
    hit = (async () => {
      try {
        const css = await (
          await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@${weight}&text=${encodeURIComponent(chars)}`, {
            // An old browser gets TrueType, which next/og reads (it can't read WOFF2).
            headers: { "user-agent": "Mozilla/4.0" },
            signal: AbortSignal.timeout(5000),
          })
        ).text();
        const src = css.match(/src: url\((.+?)\)/)?.[1];
        if (!src) return null;
        return await (await fetch(src, { signal: AbortSignal.timeout(5000) })).arrayBuffer();
      } catch {
        return null;
      }
    })();
    if (fontCache.size > 500) fontCache.clear();
    fontCache.set(key, hit);
    void hit.then((f) => f ?? fontCache.delete(key));
  }
  return hit;
}

export async function GET(_req: Request, { params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  if (!MINT.test(mint)) return new Response("Not found", { status: 404 });
  let c: CoinDetail;
  try {
    c = await api<CoinDetail>(`/api/coins/${mint}`);
  } catch (e) {
    return new Response(e instanceof ApiRequestError && e.status === 404 ? "Not found" : "Unavailable", { status: e instanceof ApiRequestError && e.status === 404 ? 404 : 503 });
  }

  const graduated = c.status === "graduated";
  // Chinese and English labels; English only if the font couldn't be fetched (Han would draw as boxes).
  const label = (zh: string, en: string, both: boolean) => (both ? `${zh} · ${en}` : en);
  const texts = (both: boolean) => ({
    stats: [
      [label("市值", "Market cap", both), usd(c.marketCapUsd)],
      ["24h", pct(c.change24hPct), c.change24hPct >= 0 ? GREEN : RED],
      [label("持有人", "Holders", both), c.holders.toLocaleString("en-US")],
      [label("已分红", "Paid to holders", both), usd(c.paidUsd), GOLD],
    ] as [string, string, string?][],
    curve: graduated ? label("已毕业", "Graduated", both) : label("内盘", `Curve ${Math.round(c.progress * 100)}%`, both),
    payLine: label("每小时分红", `Pays holders in ${c.dividendAsset} every hour`, both),
  });
  const full = texts(true);
  const allText = [c.name, `$${c.ticker}`, ...full.stats.flat().filter(Boolean), full.curve, full.payLine, DOMAIN, BRAND, "New coin0123456789$.,%+-KMB·"].join("");

  const [picture, stock, bold, regular] = await Promise.all([pictureUri(c.imageUrl), stockUri(c.dividendAsset), font(900, allText), font(500, allText)]);
  const { stats, curve, payLine } = texts(!!bold && !!regular);
  const spark = sparkUri(c.spark, 520, 200);
  const fonts = [
    ...(bold ? [{ name: "Noto Sans SC", data: bold, weight: 900 as const, style: "normal" as const }] : []),
    ...(regular ? [{ name: "Noto Sans SC", data: regular, weight: 500 as const, style: "normal" as const }] : []),
  ];

  const image = new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          padding: "52px 60px 44px",
          color: "#ECF5EF",
          fontFamily: fonts.length ? "Noto Sans SC" : undefined,
          backgroundColor: "#060807",
          backgroundImage: "radial-gradient(circle at 82% 30%, rgba(46,240,138,0.20), rgba(6,8,7,0) 55%), radial-gradient(circle at 10% 90%, rgba(195,255,60,0.08), rgba(6,8,7,0) 50%)",
        }}
      >
        {/* the coin */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picture} width={150} height={150} style={{ borderRadius: 36, border: "2px solid #27352E" }} alt="" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={SEAL_URI} width={150} height={150} alt="" />
          )}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.25, letterSpacing: -1, display: "flex", maxWidth: 640, paddingBottom: 4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 2 }}>
              <span style={{ fontSize: 34, fontWeight: 500, color: "#9DB0A6" }}>${c.ticker}</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: graduated ? LIME : "#9DB0A6", border: `1.5px solid ${graduated ? LIME : "#27352E"}`, borderRadius: 999, padding: "4px 16px" }}>{curve}</span>
            </div>
          </div>
        </div>

        {/* the numbers and the chart */}
        <div style={{ display: "flex", marginTop: 40, gap: 30, flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 560, rowGap: 26 }}>
            {stats.map(([label, value, color]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", width: 280 }}>
                <span style={{ fontSize: 21, fontWeight: 500, color: "#64776D" }}>{label}</span>
                <span style={{ fontSize: 48, fontWeight: 900, color: color ?? "#ECF5EF", letterSpacing: -1 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1, borderRadius: 24, border: "1.5px solid #1D2823", backgroundColor: "rgba(15,21,18,0.85)", overflow: "hidden", alignItems: "flex-end" }}>
            {spark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={spark} width={520} height={200} alt="" />
            ) : (
              <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#64776D" }}>New coin</div>
            )}
          </div>
        </div>

        {/* what holders earn, and hwai */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 30, gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 12px", borderRadius: 999, backgroundColor: "rgba(255,200,74,0.10)", border: "1.5px solid rgba(255,200,74,0.35)" }}>
            {stock ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stock} width={44} height={44} style={{ borderRadius: 999 }} alt="" />
            ) : null}
            <span style={{ fontSize: 24, fontWeight: 500, color: GOLD }}>{payLine}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SEAL_URI} width={56} height={56} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORD_URI} width={Math.round((36 * WORD_W) / WORD_H)} height={36} alt="" />
            <span style={{ fontSize: 24, fontWeight: 500, color: "#64776D", marginLeft: 6 }}>{DOMAIN}</span>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fonts.length ? fonts : undefined },
  );
  // Market cap and payouts move: crawlers may keep it for a few minutes, no longer.
  image.headers.set("cache-control", "public, max-age=300, s-maxage=300");
  return image;
}
