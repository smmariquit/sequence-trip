// src/visualizations/collatzLayout.ts
//
// Shared Collatz-tree geometry for native and web. Branch walks are built in
// abstract units from the origin, then fitted to the canvas — fixed-length
// steps left the tree a tiny sprout at the bottom of large screens.

import { collatzSequence } from "../sequences/generators";

export interface CollatzBranch {
  pts: { x: number; y: number }[];
  hue: number;
}

export interface CollatzFit {
  scale: number;
  dx: number;
  dy: number;
}

/** Branch polylines in abstract units, trunk root at (0,0), growing upward. */
export function buildCollatzBranches(n: number): CollatzBranch[] {
  const evenAngle = Math.PI / 12;
  const oddAngle = -Math.PI / 7;

  return Array.from({ length: n }, (_, i) => {
    const seq = collatzSequence(i + 2);
    const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    let x = 0,
      y = 0,
      angle = -Math.PI / 2;
    for (let j = 0; j < seq.length - 1 && j < 120; j++) {
      angle += seq[j] % 2 === 0 ? evenAngle : oddAngle;
      x += Math.cos(angle);
      y += Math.sin(angle);
      pts.push({ x, y });
    }
    return { pts, hue: (i * 360) / n };
  });
}

/** Uniform scale + translation fitting all branches into the canvas,
 * horizontally centered, root near the bottom (clear of the caption bar). */
export function fitCollatz(
  branches: CollatzBranch[],
  width: number,
  height: number,
  preview: boolean
): CollatzFit {
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;
  for (const b of branches) {
    for (const p of b.pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const padX = preview ? 8 : 24;
  const padTop = preview ? 8 : 24;
  const padBottom = preview ? 8 : 64; // caption overlay sits at the bottom
  const scale = Math.min(
    (width - padX * 2) / spanX,
    (height - padTop - padBottom) / spanY
  );
  return {
    scale,
    dx: padX + ((width - padX * 2) - spanX * scale) / 2 - minX * scale,
    dy: height - padBottom - maxY * scale,
  };
}
