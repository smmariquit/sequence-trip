// src/visualizations/generic/linePlotLayout.ts
//
// Shared LinePlot geometry for native and web: padded plot frame that clears
// the caption overlay, tick positions labeled with REAL term values (not raw
// symlog units), and the head-marker anchor — so the "how does the sequence
// become this line" mapping is visible on both platforms.

import type { SeqStats } from "../../sequences/normalize";

export interface Tick {
  /** Pixel position: x for xTicks, y for yTicks. */
  pos: number;
  label: string;
}

export interface LinePlotLayout {
  points: { x: number; y: number }[];
  /** Tick marks on the n (index) axis. Empty in preview. */
  xTicks: Tick[];
  /** Tick marks on the a(n) axis, labeled with actual term values. */
  yTicks: Tick[];
  /** True when the y spread spans enough decades that spacing is logarithmic. */
  logScale: boolean;
  pad: { left: number; right: number; top: number; bottom: number };
}

/** Compact human label for a term: exact when short, mantissa×10^k when huge. */
export function formatTermLabel(t: string): string {
  const neg = t.startsWith("-");
  const digits = neg ? t.slice(1) : t;
  if (digits.length <= 7) return t;
  const mantissa = `${digits[0]}.${digits.slice(1, 3)}`;
  return `${neg ? "-" : ""}${mantissa}×10^${digits.length - 1}`;
}

export function layoutLinePlot(
  stats: SeqStats,
  width: number,
  height: number,
  preview: boolean
): LinePlotLayout {
  const n = stats.logs.length;
  const range = stats.maxLog - stats.minLog || 1;

  // pick y-tick terms first (log-quantile nearest actual terms), so the left
  // padding can be sized to the widest label
  const yTickIdx: number[] = [];
  if (!preview && n > 1) {
    const seen = new Set<number>();
    for (const f of [0, 0.5, 1]) {
      const target = stats.minLog + range * f;
      let best = 0;
      for (let i = 1; i < n; i++) {
        if (Math.abs(stats.logs[i] - target) < Math.abs(stats.logs[best] - target)) best = i;
      }
      if (!seen.has(best)) {
        seen.add(best);
        yTickIdx.push(best);
      }
    }
  }
  const widestYLabel = yTickIdx.reduce(
    (w, i) => Math.max(w, formatTermLabel(stats.terms[i]).length),
    0
  );

  // full view: room for y labels on the left, caption overlay at the bottom
  const pad = preview
    ? { left: 10, right: 10, top: 10, bottom: 10 }
    : {
        left: Math.min(110, Math.max(48, 30 + widestYLabel * 7)),
        right: 16,
        top: 28,
        bottom: 72,
      };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const points = stats.logs.map((v, i) => ({
    x: pad.left + (plotW * i) / Math.max(n - 1, 1),
    y: pad.top + plotH - ((v - stats.minLog) / range) * plotH,
  }));

  const xTicks: Tick[] = [];
  const yTicks: Tick[] = [];

  if (!preview && n > 1) {
    // n axis: a handful of integer indices
    const count = Math.min(6, n - 1);
    const seenIdx = new Set<number>();
    for (let i = 0; i <= count; i++) {
      const idx = Math.round(((n - 1) * i) / count);
      if (seenIdx.has(idx)) continue;
      seenIdx.add(idx);
      xTicks.push({ pos: points[idx].x, label: String(idx) });
    }

    // a(n) axis: rows labeled with the nearest ACTUAL term value — honest for
    // the symlog scale without inverting it
    const seenLabel = new Set<string>();
    for (const i of yTickIdx) {
      const label = formatTermLabel(stats.terms[i]);
      if (seenLabel.has(label)) continue;
      seenLabel.add(label);
      yTicks.push({ pos: points[i].y, label });
    }
  }

  return {
    points,
    xTicks,
    yTicks,
    logScale: stats.maxLog - stats.minLog > 3,
    pad,
  };
}
