// src/visualizations/generic/LinePlot.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import { drawPlotAxes, drawBackedLabel } from "../canvasAxes";
import { layoutLinePlot, formatTermLabel } from "./linePlotLayout";
import type { GenericVizProps } from "./types";

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressRef } = useBuildAnimation(stats.logs.length, preview);
  // mouse position in canvas CSS pixels; null when the pointer is outside
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null);

  const layout = useMemo(
    () => layoutLinePlot(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { points } = layout;

  const dotStep = Math.max(1, Math.floor(points.length / (preview ? 20 : 60)));

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      if (!preview) {
        drawPlotAxes(ctx, {
          pad: layout.pad,
          width,
          height,
          xLabel: "n  (term index)",
          yLabel: layout.logScale ? "a(n)  (log scale)" : "a(n)",
          preview,
          ink: colors.textMuted,
          xTicks: layout.xTicks,
          yTicks: layout.yTicks,
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

      // hover: nearest plotted point within reach shows its coordinates
      if (!preview && mouseRef.current) {
        const m = mouseRef.current;
        let best = -1;
        let bestD = 14 * 14;
        for (let i = 0; i < visible && i < points.length; i++) {
          const dx = points[i].x - m.x;
          const dy = points[i].y - m.y;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        if (best >= 0) {
          const p = points[best];
          ctx.beginPath();
          ctx.strokeStyle = colors.text;
          ctx.lineWidth = 1.5;
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.stroke();
          const label = `(n = ${best}, a(n) = ${formatTermLabel(stats.terms[best])})`;
          ctx.font = "600 15px system-ui, sans-serif";
          const tw = ctx.measureText(label).width;
          const lx = p.x + 12 + tw > width - layout.pad.right ? p.x - 12 - tw : p.x + 12;
          const ly = p.y < layout.pad.top + 40 ? p.y + 24 : p.y - 18;
          drawBackedLabel(ctx, { text: label, x: lx, y: ly, fg: colors.text, bg: colors.bg });
        }
      }

      // head marker: pulsing dot + "a(n) = value" pinned to the newest term,
      // so the caption readout is visibly anchored to a point on the line
      if (!preview) {
        const head = Math.min(visible, points.length) - 1;
        if (head >= 0) {
          const p = points[head];
          const pulse = 5 + Math.sin(time * 5) * 1.5;
          ctx.beginPath();
          ctx.fillStyle = hslString(hue, 100, 70);
          ctx.shadowColor = hslString(hue, 100, 70);
          ctx.shadowBlur = 10;
          ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = "600 13px system-ui, sans-serif";
          const label = `a(${head}) = ${formatTermLabel(stats.terms[head])}`;
          const tw = ctx.measureText(label).width;
          // keep the label inside the plot: flip left near the right edge,
          // drop below the point near the top (viz switcher chips live there)
          const lx = p.x + 12 + tw > width - layout.pad.right ? p.x - 12 - tw : p.x + 12;
          const ly = p.y < layout.pad.top + 32 ? p.y + 24 : p.y;
          drawBackedLabel(ctx, { text: label, x: lx, y: ly, fg: colors.text, bg: colors.bg });
        }
      }
    },
    [points, layout, stats.terms, dotStep, preview, progressRef, width, height, colors.textMuted, colors.text]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  const setRef = React.useCallback(
    (el: HTMLCanvasElement | null) => {
      ref(el);
      if (!el || preview) return;
      el.onmousemove = (e) => {
        const rect = el.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };
      el.onmouseleave = () => {
        mouseRef.current = null;
      };
    },
    [ref, preview]
  );
  return <canvas ref={setRef} style={{ width, height, display: "block" }} />;
}
