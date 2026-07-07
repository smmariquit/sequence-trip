// src/playback/smoothPath.ts
//
// Skia path construction from fractional build progress.

import { Skia, type SkPath } from "@shopify/react-native-skia";

type Point = { x: number; y: number };

export function makePolylinePath(points: Point[], progress: number): SkPath {
  "worklet"; // called from useDerivedValue on the UI thread — crashes without this
  const p = Skia.Path.Make();
  if (points.length === 0 || progress <= 0) return p;

  const maxIdx = points.length - 1;
  const clamped = Math.min(Math.max(0, progress), maxIdx);
  const complete = Math.floor(clamped);
  const frac = clamped - complete;

  p.moveTo(points[0].x, points[0].y);
  for (let i = 1; i <= complete && i < points.length; i++) {
    p.lineTo(points[i].x, points[i].y);
  }
  if (frac > 0 && complete + 1 < points.length) {
    const a = points[complete];
    const b = points[complete + 1];
    p.lineTo(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
  }
  return p;
}
