// src/visualizations/generic/phasePoints.ts
//
// Shared point math for the phase-plane viz: (a(n), a(n+1)) in symlog space,
// scaled into a padded box. One copy for native and web.

import type { SeqStats } from "../../sequences/normalize";
import { formatTermLabel, type Tick } from "./linePlotLayout";

export function phasePoints(
  logs: number[],
  minLog: number,
  maxLog: number,
  width: number,
  height: number,
  pad: number
): { x: number; y: number }[] {
  const range = maxLog - minLog || 1;
  const sx = (v: number) => pad + ((v - minLog) / range) * (width - pad * 2);
  const sy = (v: number) => height - pad - ((v - minLog) / range) * (height - pad * 2);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < logs.length; i++) {
    pts.push({ x: sx(logs[i]), y: sy(logs[i + 1]) });
  }
  return pts;
}

export interface PhaseLayout {
  points: { x: number; y: number }[];
  pad: { left: number; right: number; top: number; bottom: number };
  /** Same value scale on both axes: ticks labeled with real terms. */
  xTicks: Tick[];
  yTicks: Tick[];
  logScale: boolean;
}

/** Full phase-plane layout: asymmetric padding that clears the caption
 * overlay and leaves room for value labels, plus honest axis ticks. */
export function layoutPhasePlane(
  stats: SeqStats,
  width: number,
  height: number,
  preview: boolean
): PhaseLayout {
  const { logs, minLog, maxLog } = stats;
  const n = logs.length;
  const range = maxLog - minLog || 1;

  // pick tick terms first so left padding fits the widest label
  const tickIdx: number[] = [];
  if (!preview && n > 1) {
    const seen = new Set<number>();
    for (const f of [0, 0.5, 1]) {
      const target = minLog + range * f;
      let best = 0;
      for (let i = 1; i < n; i++) {
        if (Math.abs(logs[i] - target) < Math.abs(logs[best] - target)) best = i;
      }
      if (!seen.has(best)) {
        seen.add(best);
        tickIdx.push(best);
      }
    }
  }
  const widest = tickIdx.reduce(
    (w, i) => Math.max(w, formatTermLabel(stats.terms[i]).length),
    0
  );

  const pad = preview
    ? { left: 10, right: 10, top: 10, bottom: 10 }
    : {
        left: Math.min(110, Math.max(48, 30 + widest * 7)),
        right: Math.min(80, Math.max(24, widest * 4)), // last x tick label centers on the axis end
        top: 28,
        bottom: 96, // caption overlay + x tick labels
      };

  const sx = (v: number) =>
    pad.left + ((v - minLog) / range) * (width - pad.left - pad.right);
  const sy = (v: number) =>
    height - pad.bottom - ((v - minLog) / range) * (height - pad.top - pad.bottom);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < n; i++) {
    points.push({ x: sx(logs[i]), y: sy(logs[i + 1]) });
  }

  const xTicks: Tick[] = [];
  const yTicks: Tick[] = [];
  const seenLabel = new Set<string>();
  for (const i of tickIdx) {
    const label = formatTermLabel(stats.terms[i]);
    if (seenLabel.has(label)) continue;
    seenLabel.add(label);
    xTicks.push({ pos: sx(logs[i]), label });
    yTicks.push({ pos: sy(logs[i]), label });
  }

  return { points, pad, xTicks, yTicks, logScale: range > 3 };
}
