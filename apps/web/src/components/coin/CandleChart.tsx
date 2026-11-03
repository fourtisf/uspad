"use client";

import { useEffect, useRef, useState } from "react";
import type { CandleList } from "@divvy/shared";
import type { IChartApi, ISeriesApi, ISeriesMarkersPluginApi, Time } from "lightweight-charts";
import { useLang, useMsgs, useUpDown } from "@/i18n/client";
import { chart as chartMsgs } from "@/i18n/msgs/chart";

/** USD with k/M/B, and enough significant digits for a memecoin's tiny price ($0.000002829). */
export function fmtUsd(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `$${+(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${+(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${+(v / 1e3).toFixed(2)}k`;
  if (a >= 1) return `$${v.toFixed(2)}`;
  if (a < 1e-12) return "$0";
  return `$${v.toFixed(Math.min(14, 3 - Math.floor(Math.log10(a))))}`;
}

/** The price axis also spans the volume strip below the candles: no labels below zero there. */
const axisUsd = (v: number) => (v < 0 ? "" : fmtUsd(v));
// Dates in the page's language (the visitor's own time zone either way).
const pageLang = () => (typeof document === "undefined" ? undefined : document.documentElement.lang || undefined);
const clock = (t: number) => new Date(t * 1000).toLocaleTimeString(pageLang(), { hour: "2-digit", minute: "2-digit" });
const stamp = (t: number) => new Date(t * 1000).toLocaleString(pageLang(), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const css = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
/** The prototype's tokens (globals.css): up/down follow the footer's switch, the dots are the gold accent. */
const colors = () => ({
  up: css("--up", "#13A04A"),
  down: css("--dn", "#E23B3B"),
  faint: css("--tx3", "#A3A3A3"),
  line: css("--line", "#EEEEEE"),
  ink: css("--tx", "#0A0A0A"),
  dot: css("--acc", "#FFC21A"),
  font: css("--ff", "system-ui, sans-serif"),
});

/** A candle as the legend shows it, volume in USD. */
type Shown = { o: number; h: number; l: number; c: number; volUsd: number };

/**
 * Candlesticks with volume underneath (TradingView's lightweight-charts), in local time, drawn in the
 * prototype's look (its `svg.kl`: light grid lines, up/down candles). Gold dots under the bars mark the
 * hours the coin paid its holders. The legend (`.legend`) shows the hovered candle, else the last.
 */
export function CandleChart({ candles, solUsd, payoutHours, label }: { candles: CandleList | undefined; solUsd: number; payoutHours: number[]; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<{ chart: IChartApi; bars: ISeriesApi<"Candlestick">; vol: ISeriesApi<"Histogram">; marks: ISeriesMarkersPluginApi<Time> } | null>(null);
  const fitted = useRef("");
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<Shown | null>(null);
  const items = candles?.items ?? [];
  const t = useMsgs(chartMsgs);
  const [upDown] = useUpDown();
  const [lang] = useLang();

  useEffect(() => {
    let off = false;
    let chart: IChartApi | undefined;
    void import("lightweight-charts").then((lw) => {
      if (off || !box.current) return;
      const c = colors();
      chart = lw.createChart(box.current, {
        autoSize: true,
        layout: { background: { type: lw.ColorType.Solid, color: "transparent" }, textColor: c.faint, fontFamily: c.font, fontSize: 11 },
        grid: { vertLines: { visible: false }, horzLines: { color: c.line } },
        crosshair: { mode: lw.CrosshairMode.Normal, vertLine: { labelBackgroundColor: c.ink }, horzLine: { labelBackgroundColor: c.ink } },
        rightPriceScale: { borderVisible: false },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          tickMarkFormatter: (t: Time, type: number) =>
            type <= lw.TickMarkType.DayOfMonth ? new Date((t as number) * 1000).toLocaleDateString(pageLang(), { month: "short", day: "numeric" }) : clock(t as number),
        },
        localization: { timeFormatter: (t: Time) => stamp(t as number), priceFormatter: axisUsd },
      });
      const bars = chart.addSeries(lw.CandlestickSeries, {
        upColor: c.up,
        downColor: c.down,
        wickUpColor: c.up,
        wickDownColor: c.down,
        borderVisible: false,
        priceFormat: { type: "custom", formatter: axisUsd, minMove: 1e-12 },
      });
      bars.priceScale().applyOptions({ scaleMargins: { top: 0.12, bottom: 0.26 } });
      const vol = chart.addSeries(lw.HistogramSeries, { priceScaleId: "", priceFormat: { type: "custom", formatter: fmtUsd }, lastValueVisible: false, priceLineVisible: false });
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      const marks = lw.createSeriesMarkers(bars, []);
      chart.subscribeCrosshairMove((p) => {
        const b = p.time === undefined ? undefined : (p.seriesData.get(bars) as { time: Time; open: number; high: number; low: number; close: number } | undefined);
        setHover(b ? { o: b.open, h: b.high, l: b.low, c: b.close, volUsd: (p.seriesData.get(vol) as { value?: number } | undefined)?.value ?? 0 } : null);
      });
      api.current = { chart, bars, vol, marks };
      setReady(true);
    });
    return () => {
      off = true;
      chart?.remove();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const a = api.current;
    if (!ready || !a || !candles) return;
    // Read on every update so the footer's up/down switch recolours the chart in place.
    const { up, down, dot } = colors();
    a.bars.applyOptions({ upColor: up, downColor: down, wickUpColor: up, wickDownColor: down });
    a.bars.setData(candles.items.map((b) => ({ time: b.t as Time, open: b.o, high: b.h, low: b.l, close: b.c })));
    a.vol.setData(candles.items.map((b) => ({ time: b.t as Time, value: b.vol.ui * solUsd, color: (b.c >= b.o ? up : down) + "40" })));
    // A payout hour sits on the candle that contains it; hours before the first candle are left out.
    const times = candles.items.map((b) => b.t);
    const marks = payoutHours
      .map((h) => times.filter((t) => t <= h).pop())
      .filter((t): t is number => t !== undefined)
      .filter((t, i, all) => all.indexOf(t) === i)
      .sort((x, y) => x - y)
      .map((t) => ({ time: t as Time, position: "belowBar" as const, shape: "circle" as const, color: dot, size: 1 }));
    a.marks.setMarkers(marks);
    // Fit once per time frame and unit; later refreshes keep where the viewer scrolled to.
    const key = `${candles.tf}:${candles.unit}`;
    if (fitted.current !== key && candles.items.length) {
      a.chart.timeScale().fitContent();
      fitted.current = key;
    }
    // upDown and lang aren't read directly: they change the CSS variables and the date labels.
  }, [ready, candles, solUsd, payoutHours, upDown, lang]);

  const last = items[items.length - 1];
  const shown: Shown | undefined = hover ?? (last && { ...last, volUsd: last.vol.ui * solUsd });
  const change = shown && shown.o ? ((shown.c - shown.o) / shown.o) * 100 : 0;
  return (
    <>
      <div className="legend">
        {shown ? (
          <>
            <span>{t.o} <b className="n">{fmtUsd(shown.o)}</b></span>
            <span>{t.h} <b className="n">{fmtUsd(shown.h)}</b></span>
            <span>{t.l} <b className="n">{fmtUsd(shown.l)}</b></span>
            <span>{t.c} <b className="n">{fmtUsd(shown.c)}</b></span>
            <span className={"n " + (change >= 0 ? "up" : "dn")}>{(change >= 0 ? "+" : "") + change.toFixed(2)}%</span>
            <span>{t.vol} <b className="n">{fmtUsd(shown.volUsd)}</b></span>
          </>
        ) : (
          <span>{t.empty}</span>
        )}
      </div>
      <div ref={box} className="kl" role="img" aria-label={label} />
    </>
  );
}
