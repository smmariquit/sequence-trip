// src/visualizations/generic/turtleLayout.ts
//
// Shared TurtleWalk geometry: the walk in canvas space plus per-step turn
// data (a(n) mod 4) so both platforms can show WHY the path bends.

import { termMod } from "../../sequences/normalize";

export const TURN_LABELS = ["hard left", "soft left", "soft right", "hard right"] as const;

export interface TurtleLayout {
  points: { x: number; y: number }[];
  /** a(n) mod 4 for each step (drives the turn into points[i+1]). */
  mods: number[];
  /** Heading (radians) after each step. */
  headings: number[];
}

export function layoutTurtle(
  terms: string[],
  width: number,
  height: number,
  preview: boolean
): TurtleLayout {
  const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  const mods: number[] = [];
  const headings: number[] = [];
  let x = 0,
    y = 0,
    angle = 0;
  for (const t of terms) {
    const m = termMod(t, 4);
    // mod 0..3 maps to −90°, −30°, +30°, +90°
    angle += (m - 1.5) * (Math.PI / 3);
    x += Math.cos(angle);
    y += Math.sin(angle);
    pts.push({ x, y });
    mods.push(m);
    headings.push(angle);
  }

  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const padX = preview ? 10 : 30;
  const padTop = preview ? 10 : 44; // legend row at the top in full view
  const padBottom = preview ? 10 : 64; // caption overlay
  const s = Math.min(
    (width - padX * 2) / (maxX - minX || 1),
    (height - padTop - padBottom) / (maxY - minY || 1)
  );
  const ox = padX + ((width - padX * 2) - (maxX - minX) * s) / 2 - minX * s;
  const oy = padTop + ((height - padTop - padBottom) - (maxY - minY) * s) / 2 - minY * s;

  return {
    points: pts.map((p) => ({ x: ox + p.x * s, y: oy + p.y * s })),
    mods,
    headings,
  };
}
