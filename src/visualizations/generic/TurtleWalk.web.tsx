// src/visualizations/generic/TurtleWalk.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { layoutTurtle, TURN_LABELS } from "./turtleLayout";
import { drawBackedLabel } from "../canvasAxes";
import type { GenericVizProps } from "./types";

export default function TurtleWalk({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const { progressRef } = useBuildAnimation(terms.length, preview);

  const layout = useMemo(
    () => layoutTurtle(terms, width, height, !!preview),
    [terms, width, height, preview]
  );
  const { points, mods, headings } = layout;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;

      if (points.length === 0 || progress <= 0) return;

      const hue = (time * 40) % 360;
      ctx.strokeStyle = hslString(hue, 85, 58);
      ctx.lineWidth = preview ? 1 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hue, 85, 58);
        ctx.shadowBlur = 2.5;
      }
      strokePolylineProgress(ctx, points, progress);
      ctx.shadowBlur = 0;

      if (!preview) {
        // turtle: arrowhead at the walk front, pointing along the heading
        const i = Math.min(Math.floor(progress), points.length - 1);
        const stepIdx = Math.max(Math.min(i - 1, mods.length - 1), 0);
        const p = points[i];
        const a = headings[stepIdx] ?? 0;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-5, 5.5);
        ctx.lineTo(-5, -5.5);
        ctx.closePath();
        ctx.fillStyle = hslString(hue, 100, 70);
        ctx.shadowColor = hslString(hue, 100, 70);
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;

        if (i > 0) {
          const m = mods[stepIdx];
          const label = `a(${stepIdx}) mod 4 = ${m}  →  ${TURN_LABELS[m]}`;
          ctx.font = "600 13px system-ui, sans-serif";
          const tw = ctx.measureText(label).width;
          const lx = p.x + 14 + tw > width ? p.x - 14 - tw : p.x + 14;
          drawBackedLabel(ctx, { text: label, x: lx, y: p.y - 16, fg: colors.text, bg: colors.bg });
        }
      }
    },
    [points, mods, headings, preview, progressRef, width, colors.textMuted, colors.text]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
