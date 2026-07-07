// src/visualizations/generic/PhasePlane.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import { drawPlotAxes } from "../canvasAxes";
import type { GenericVizProps } from "./types";

export default function PhasePlane({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);

  const points = useMemo(() => {
    const pad = preview ? 10 : 30;
    const range = stats.maxLog - stats.minLog || 1;
    const sx = (v: number) => pad + ((v - stats.minLog) / range) * (width - pad * 2);
    const sy = (v: number) =>
      height - pad - ((v - stats.minLog) / range) * (height - pad * 2);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i + 1 < stats.logs.length; i++) {
      pts.push({ x: sx(stats.logs[i]), y: sy(stats.logs[i + 1]) });
    }
    return pts;
  }, [stats, width, height, preview]);

  const { progressRef } = useBuildAnimation(Math.max(points.length - 1, 0), preview);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const pad = preview ? 10 : 30;
      const progress = progressRef.current;
      if (!preview) {
        drawPlotAxes(ctx, {
          pad,
          width,
          height,
          xLabel: "a(n)",
          yLabel: "a(n+1)",
          preview,
          ink: colors.textMuted,
        });
      }
      if (points.length === 0 || progress <= 0) return;

      const hue = (time * 45) % 360;
      ctx.strokeStyle = hslString(hue, 85, 60);
      ctx.lineWidth = preview ? 1 : 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hue, 85, 60);
        ctx.shadowBlur = 3;
      }
      strokePolylineProgress(ctx, points, progress);
      ctx.shadowBlur = 0;

      if (!preview) {
        const head = points[Math.min(Math.floor(progress), points.length - 1)];
        ctx.beginPath();
        ctx.fillStyle = hslString(0, 100, 70);
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [points, preview, progressRef, width, height, colors.textMuted]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
