// src/visualizations/generic/polarLayout.ts
//
// Shared PolarSpiral geometry: golden-angle points plus labeled reference
// rings so the radius→value mapping is visible on both platforms.

import type { SeqStats } from "../../sequences/normalize";
import { formatTermLabel } from "./linePlotLayout";

export const GOLDEN_ANGLE = (137.508 * Math.PI) / 180;

export interface PolarRing {
  r: number;
  label: string;
}

export interface PolarPoint {
  angle: number;
  r: number;
  hue: number;
  size: number;
}

export interface PolarLayout {
  cx: number;
  cy: number;
  maxR: number;
  points: PolarPoint[];
  /** Reference rings labeled with real term values. Empty in preview. */
  rings: PolarRing[];
}

export function layoutPolar(
  stats: SeqStats,
  width: number,
  height: number,
  preview: boolean
): PolarLayout {
  const n = stats.logs.length;
  // full view: keep the disc clear of the caption overlay at the bottom
  const usableH = height - (preview ? 0 : 56);
  const cx = width / 2;
  const cy = usableH / 2 + (preview ? 0 : 4);
  const maxR = Math.min(width, usableH) * 0.44;
  const range = stats.maxLog - stats.minLog || 1;

  const rOf = (v: number) => maxR * (0.12 + 0.88 * ((v - stats.minLog) / range));

  const points = stats.logs.map((v, i) => {
    const norm = (v - stats.minLog) / range;
    return {
      angle: i * GOLDEN_ANGLE,
      r: rOf(v),
      hue: (i * 360) / Math.max(n, 1),
      size: (preview ? 1.5 : 3) + norm * (preview ? 1.5 : 4),
    };
  });

  // rings at the log-quantile nearest actual terms — same honesty rule as
  // the line plot's y ticks
  const rings: PolarRing[] = [];
  if (!preview && n > 1) {
    const seen = new Set<string>();
    for (const f of [0, 0.5, 1]) {
      const target = stats.minLog + range * f;
      let best = 0;
      for (let i = 1; i < n; i++) {
        if (Math.abs(stats.logs[i] - target) < Math.abs(stats.logs[best] - target)) best = i;
      }
      const label = formatTermLabel(stats.terms[best]);
      if (seen.has(label)) continue;
      seen.add(label);
      rings.push({ r: rOf(stats.logs[best]), label });
    }
  }

  return { cx, cy, maxR, points, rings };
}
