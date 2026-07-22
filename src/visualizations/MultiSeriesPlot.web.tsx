// src/visualizations/MultiSeriesPlot.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas } from "./useWebCanvas";
import { multiSeriesLines } from "./pairPoints";

export function seriesColor(i: number): string {
  return `hsl(${(i * 137.508) % 360}, 82%, 60%)`;
}

interface Props {
  series: string[][];
  width: number;
  height: number;
}

export default function MultiSeriesPlot({ series, width, height }: Props) {
  const lines = useMemo(
    () => multiSeriesLines(series, width, height, 24),
    [series, width, height]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      lines.forEach((pts, s) => {
        if (pts.length < 2) return;
        ctx.strokeStyle = seriesColor(s);
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      });
    },
    [lines]
  );

  const ref = useWebCanvas(width, height, draw, false);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
