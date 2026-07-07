// src/visualizations/PairPlot.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { pairPoints, type PairMode } from "./pairPoints";

interface Props {
  termsA: string[];
  termsB: string[];
  mode: PairMode;
  width: number;
  height: number;
}

export default function PairPlot({ termsA, termsB, mode, width, height }: Props) {
  const points = useMemo(
    () => pairPoints(termsA, termsB, mode, width, height, 24),
    [termsA, termsB, mode, width, height]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!points.length) return;
      ctx.strokeStyle = hslString(mode === "phase" ? 265 : 180, 80, 62);
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      const every = Math.max(1, Math.floor(points.length / 40));
      points.forEach((p, i) => {
        if (i % every !== 0) return;
        ctx.beginPath();
        ctx.fillStyle = hslString((i * 360) / points.length, 90, 62);
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [points, mode]
  );

  const ref = useWebCanvas(width, height, draw, false);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
