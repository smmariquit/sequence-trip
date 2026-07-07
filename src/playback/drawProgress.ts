// src/playback/drawProgress.ts
//
// Canvas helpers for smooth (fractional) construction progress.

export function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** Alpha 0-1 for discrete item at index given fractional progress. */
export function itemRevealAlpha(progress: number, index: number): number {
  return smoothstep(progress - index);
}

export function splitProgress(progress: number): { complete: number; frac: number } {
  const clamped = Math.max(0, progress);
  const complete = Math.floor(clamped);
  return { complete, frac: clamped - complete };
}

type Point = { x: number; y: number };

/** Stroke a polyline up to fractional progress along segment indices. */
export function strokePolylineProgress(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  progress: number
): void {
  if (points.length === 0 || progress <= 0) return;

  const maxIdx = points.length - 1;
  const clamped = Math.min(progress, maxIdx);
  const { complete, frac } = splitProgress(clamped);

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i <= complete && i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (frac > 0 && complete + 1 < points.length) {
    const a = points[complete];
    const b = points[complete + 1];
    ctx.lineTo(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
  }
  ctx.stroke();
}

/** Partial Recamán semicircle for arc index i in [0, frac]. */
export function strokeRecamanArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  midY: number,
  radius: number,
  above: boolean,
  frac: number
): void {
  if (frac <= 0 || radius <= 0) return;
  const t = Math.min(1, frac);
  ctx.beginPath();
  if (above) {
    // canvas y grows downward: the top half-circle is the (PI, 2PI) sweep.
    // The old (PI -> 0, anticlockwise) sweep passed through PI/2 and drew
    // BELOW the line, so no arc ever rendered above it.
    ctx.arc(cx, midY, radius, Math.PI, Math.PI * (1 + t), false);
  } else {
    ctx.arc(cx, midY, radius, 0, Math.PI * t, false);
  }
  ctx.stroke();
}
