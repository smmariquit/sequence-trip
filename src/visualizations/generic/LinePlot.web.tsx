// src/visualizations/generic/LinePlot.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import { drawPlotAxes } from "../canvasAxes";
import type { GenericVizProps } from "./types";

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressRef } = useBuildAnimation(stats.logs.length, preview);

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
      const pad = preview ? 10 : 30;
      const progress = progressRef.current;
      if (!preview) {
        drawPlotAxes(ctx, {
          pad,
          width,
          height,
          xLabel: "n  (term index)",
          yLabel: "a(n)",
          preview,
          ink: colors.textMuted,
        });
      }
      if (points.length === 0 || progress <= 0) return;

      const hue = (time * 45) % 360;
      ctx.strokeStyle = hslString(hue, 90, 60);
      ctx.lineWidth = preview ? 1.2 : 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hue, 90, 60);
        ctx.shadowBlur = 3;
      }
      strokePolylineProgress(ctx, points, progress);
      ctx.shadowBlur = 0;

      const visible = Math.ceil(progress);
      points.forEach((p, i) => {
        if (i >= visible || i % dotStep !== 0) return;
        ctx.beginPath();
        ctx.fillStyle = hslString((i * dotStep * 360) / Math.max(points.length, 1), 95, 65);
        ctx.arc(p.x, p.y, preview ? 1.5 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [points, dotStep, preview, progressRef, width, height, colors.textMuted]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
