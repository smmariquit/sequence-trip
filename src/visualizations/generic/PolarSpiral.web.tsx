// src/visualizations/generic/PolarSpiral.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { itemRevealAlpha } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import { layoutPolar } from "./polarLayout";
import { formatTermLabel } from "./linePlotLayout";
import type { GenericVizProps } from "./types";

export default function PolarSpiral({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressRef } = useBuildAnimation(stats.logs.length, preview);

  const layout = useMemo(
    () => layoutPolar(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { cx, cy, points, rings } = layout;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const rotation = time * 0.2618;

      // reference rings: distance from center = size of a(n)
      if (!preview) {
        ctx.strokeStyle = colors.textMuted;
        ctx.fillStyle = colors.textMuted;
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.setLineDash([3, 5]);
        ctx.globalAlpha = 0.5;
        for (const ring of rings) {
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillText(`a = ${ring.label}`, cx + ring.r + 5, cy);
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.6;
        ctx.textAlign = "center";
        ctx.fillText("each dot turns 137.5° from the last · farther out = bigger value", cx, 14);
        ctx.globalAlpha = 1;
      }

      let headPos: { x: number; y: number; i: number } | null = null;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const alpha = itemRevealAlpha(progress, i);
        if (alpha <= 0) continue;

        const a = pt.angle + rotation;
        const x = cx + pt.r * Math.cos(a);
        const y = cy + pt.r * Math.sin(a);
        headPos = { x, y, i };

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.fillStyle = hslString(pt.hue, 95, 62);
        if (!preview) {
          ctx.shadowColor = hslString(pt.hue, 95, 62);
          ctx.shadowBlur = 3;
        }
        ctx.arc(x, y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // head label rides the newest dot
      if (!preview && headPos) {
        const label = `a(${headPos.i}) = ${formatTermLabel(stats.terms[headPos.i])}`;
        ctx.font = "600 13px system-ui, sans-serif";
        const tw = ctx.measureText(label).width;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = colors.text;
        const lx = headPos.x + 10 + tw > width ? headPos.x - 10 - tw : headPos.x + 10;
        ctx.fillText(label, lx, headPos.y);
      }
    },
    [points, rings, cx, cy, preview, progressRef, stats.terms, width, colors.textMuted, colors.text]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
