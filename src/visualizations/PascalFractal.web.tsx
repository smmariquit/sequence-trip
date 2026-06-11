// src/visualizations/PascalFractal.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

function computePascalMod(rows: number, mod: number): number[][] {
  const tri: number[][] = [[1]];
  for (let r = 1; r < rows; r++) {
    const prev = tri[r - 1];
    const row = [1];
    for (let k = 1; k < r; k++) {
      row.push((prev[k - 1] + prev[k]) % mod);
    }
    row.push(1);
    tri.push(row);
  }
  return tri;
}

export default function PascalFractal({ width, height, count = 128, preview }: Props) {
  const rows = preview ? 64 : count;

  const cells = useMemo(() => {
    const tri = computePascalMod(rows, 2);
    const result: { rNorm: number; cNorm: number; row: number; col: number; len: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < tri[r].length; c++) {
        if (tri[r][c] !== 0) {
          result.push({
            rNorm: r / rows,
            cNorm: tri[r].length > 1 ? c / (tri[r].length - 1) : 0.5,
            row: r,
            col: c,
            len: tri[r].length,
          });
        }
      }
    }
    return result;
  }, [rows]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const hueShift = (time * 51.4) % 360;
      const brightness = Math.sin(time * 2.51) * 0.5 + 0.5;
      const cellH = h / rows;

      for (const cell of cells) {
        const cellW = w / cell.len;
        const offsetX = (w - cellW * cell.len) / 2;
        const x = offsetX + cell.col * cellW;
        const y = cell.row * cellH;
        const hue = (cell.row * 3.5 + cell.col * 7 + hueShift) % 360;
        const lit = 50 + brightness * 15;

        ctx.fillStyle = hslString(hue, 90, lit);
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      }
    },
    [cells, rows]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
