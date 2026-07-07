// src/visualizations/generic/modGridLayout.ts
//
// Shared ModGrid geometry: cells read left→right then top→bottom, one per
// term. Full view reserves rows for the legend and the caption overlay.

import { termMod } from "../../sequences/normalize";

export const MOD = 10;

export interface GridCell {
  x: number;
  y: number;
  w: number;
  h: number;
  m: number;
}

export interface ModGridLayout {
  cells: GridCell[];
  padTop: number;
  cols: number;
}

export function layoutModGrid(
  terms: string[],
  width: number,
  height: number,
  preview: boolean
): ModGridLayout {
  const padTop = preview ? 0 : 30; // legend line
  const padBottom = preview ? 0 : 64; // caption overlay
  const gridH = Math.max(height - padTop - padBottom, 1);
  const n = terms.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt((n * width) / gridH)));
  const cellW = width / cols;
  const rows = Math.ceil(n / cols);
  const cellH = gridH / Math.max(rows, 1);
  return {
    padTop,
    cols,
    cells: terms.map((t, i) => ({
      x: (i % cols) * cellW,
      y: padTop + Math.floor(i / cols) * cellH,
      w: cellW - 1,
      h: cellH - 1,
      m: termMod(t, MOD),
    })),
  };
}
