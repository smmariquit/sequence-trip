// src/visualizations/generic/PhasePlane.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import { layoutPhasePlane } from "./phasePoints";
import { drawPlotAxes, drawBackedLabel } from "../canvasAxes";
import { formatTermLabel } from "./linePlotLayout";
import type { GenericVizProps } from "./types";

export default function PhasePlane({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);

  const layout = useMemo(
    () => layoutPhasePlane(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { points } = layout;

  const { progressRef } = useBuildAnimation(Math.max(points.length - 1, 0), preview);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      if (!preview) {
        drawPlotAxes(ctx, {
          pad: layout.pad,
          width,
          height,
          xLabel: layout.logScale ? "a(n)  (log scale)" : "a(n)",
          yLabel: layout.logScale ? "a(n+1)  (log scale)" : "a(n+1)",
          preview,
          ink: colors.textMuted,
          xTicks: layout.xTicks,
          yTicks: layout.yTicks,
        });
      }
      if (points.length === 0 || progress <= 0) return;

      const hue = (time * 36) % 360; // 10s cycle — matches native
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
        const i = Math.min(Math.floor(progress), points.length - 1);
        const head = points[i];
        ctx.beginPath();
        ctx.fillStyle = hslString(0, 100, 70);
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // the head IS the current pair — spell it out
        const label = `(a(${i}), a(${i + 1})) = (${formatTermLabel(stats.terms[i])}, ${formatTermLabel(stats.terms[i + 1])})`;
        ctx.font = "600 13px system-ui, sans-serif";
        const tw = ctx.measureText(label).width;
        const lx = head.x + 10 + tw > width - layout.pad.right ? head.x - 10 - tw : head.x + 10;
        const ly = head.y < layout.pad.top + 32 ? head.y + 20 : head.y - 14;
        drawBackedLabel(ctx, { text: label, x: lx, y: ly, fg: colors.text, bg: colors.bg });
      }
    },
    [points, layout, stats.terms, preview, progressRef, width, height, colors.textMuted, colors.text]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
