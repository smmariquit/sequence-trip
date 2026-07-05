// src/visualizations/generic/ModGrid.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { termMod } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function ModGrid({ terms, width, height, preview }: GenericVizProps) {
  const mod = 10;

  const cells = useMemo(() => {
    const n = terms.length;
    const cols = Math.ceil(Math.sqrt((n * width) / height));
    const cellW = width / cols;
    const rows = Math.ceil(n / cols);
    const cellH = height / Math.max(rows, 1);
    return terms.map((t, i) => ({
      x: (i % cols) * cellW,
      y: Math.floor(i / cols) * cellH,
      w: cellW - 1,
      h: cellH - 1,
      m: termMod(t, mod),
    }));
  }, [terms, width, height]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const breathe = 0.9 + 0.1 * Math.sin(time * 2.513);
      ctx.globalAlpha = breathe;
      for (const c of cells) {
        ctx.fillStyle = c.m === 0 ? "rgba(40, 35, 70, 0.6)" : hslString((c.m * 360) / 10, 85, 55);
        ctx.fillRect(c.x, c.y, c.w, c.h);
      }
      ctx.globalAlpha = 1;
    },
    [cells]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
