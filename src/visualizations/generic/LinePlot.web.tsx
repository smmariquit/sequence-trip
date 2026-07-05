// src/visualizations/generic/LinePlot.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const stats = useMemo(() => normalize(terms), [terms]);

  const points = useMemo(() => {
    const pad = preview ? 10 : 30;
    const n = stats.logs.length;
    const range = stats.maxLog - stats.minLog || 1;
    return stats.logs.map((v, i) => ({
      x: pad + ((width - pad * 2) * i) / Math.max(n - 1, 1),
      y: height - pad - ((v - stats.minLog) / range) * (height - pad * 2),
    }));
  }, [stats, width, height, preview]);

  const dotStep = Math.max(1, Math.floor(points.length / (preview ? 20 : 60)));

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      if (points.length === 0) return;
      const hue = (time * 45) % 360;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = hslString(hue, 90, 60);
      ctx.lineWidth = preview ? 1.2 : 2;
      ctx.lineJoin = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hue, 90, 60);
        ctx.shadowBlur = 3;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      points.forEach((p, i) => {
        if (i % dotStep !== 0) return;
        ctx.beginPath();
        ctx.fillStyle = hslString((i * dotStep * 360) / Math.max(points.length, 1), 95, 65);
        ctx.arc(p.x, p.y, preview ? 1.5 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [points, dotStep, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
