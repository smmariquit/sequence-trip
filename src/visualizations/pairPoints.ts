// src/visualizations/pairPoints.ts
//
// Point math for two-sequence comparison plots (OEIS plot2 modes):
// phase — b(n) vs a(n) in symlog space; ratio — log10(a(n)/b(n)) over n.

import { normalize } from "../sequences/normalize";

export type PairMode = "phase" | "ratio";

type Point = { x: number; y: number };

export function pairPoints(
  termsA: string[],
  termsB: string[],
  mode: PairMode,
  width: number,
  height: number,
  pad: number
): Point[] {
  const a = normalize(termsA);
  const b = normalize(termsB);
  const n = Math.min(a.logs.length, b.logs.length);
  if (n === 0) return [];

  if (mode === "phase") {
    const minX = Math.min(...a.logs.slice(0, n));
    const maxX = Math.max(...a.logs.slice(0, n));
    const minY = Math.min(...b.logs.slice(0, n));
    const maxY = Math.max(...b.logs.slice(0, n));
    const rx = maxX - minX || 1;
    const ry = maxY - minY || 1;
    return Array.from({ length: n }, (_, i) => ({
      x: pad + ((a.logs[i] - minX) / rx) * (width - pad * 2),
      y: height - pad - ((b.logs[i] - minY) / ry) * (height - pad * 2),
    }));
  }

  // ratio: log10|a/b| ≈ |logs difference| in plain-log space; symlog logs are
  // close enough for pixels and finite for any term.
  const ratios = Array.from({ length: n }, (_, i) => a.logs[i] - b.logs[i]);
  const min = Math.min(...ratios);
  const max = Math.max(...ratios);
  const r = max - min || 1;
  return ratios.map((v, i) => ({
    x: pad + ((width - pad * 2) * i) / Math.max(n - 1, 1),
    y: height - pad - ((v - min) / r) * (height - pad * 2),
  }));
}
