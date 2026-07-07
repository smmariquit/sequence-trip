// src/visualizations/RecamanArcs.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { useThemeColors } from "../theme";
import { useBuildAnimation } from "../playback/useBuildAnimation";
import { splitProgress, strokeRecamanArc } from "../playback/drawProgress";
import { drawNumberLine } from "./canvasAxes";
import { recaman } from "../sequences/generators";
import { layoutRecaman } from "./recamanLayout";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function RecamanArcs({ width, height, count = 64, preview }: Props) {
  const colors = useThemeColors();
  const n = preview ? 28 : count;

  const seq = useMemo(() => recaman(n), [n]);

  // layout is constant per sequence/canvas — keep it out of the rAF loop
  const layout = useMemo(
    () => layoutRecaman(seq, width, height, !!preview),
    [seq, width, height, preview]
  );

  const { progressRef } = useBuildAnimation(Math.max(seq.length - 1, 0), preview);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const { x0: pad, axisY, midY, scaleX, span, maxVal } = layout;
      const { complete, frac } = splitProgress(progress);
      const hueOffset = (time * 45) % 360;
      const breathe = Math.sin(time * 2.1) * 0.5 + 0.5;

      if (!preview) {
        drawNumberLine(ctx, { x0: pad, y: axisY, span, maxVal, ink: colors.textMuted });
        ctx.fillStyle = colors.textMuted;
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("value on number line (low to high)", pad, axisY - 6);
      }

      ctx.lineCap = "round";

      for (let i = 0; i < complete; i++) {
        const val = seq[i];
        const next = seq[i + 1];
        const left = Math.min(val, next);
        const right = Math.max(val, next);
        const radius = ((right - left) * scaleX) / 2;
        const cx = left * scaleX + pad + radius;
        const above = i % 2 === 0;
        const hue = ((i * 360) / seq.length + hueOffset) % 360;
        const lw = (preview ? 1.2 : 2.5) + breathe * (preview ? 0.3 : 0.8);

        ctx.strokeStyle = hslString(hue, 90, 55);
        ctx.lineWidth = lw;
        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 60);
          ctx.shadowBlur = 6;
        }
        strokeRecamanArc(ctx, cx, midY, radius, above, 1);
        ctx.shadowBlur = 0;
      }

      if (frac > 0 && complete < seq.length - 1) {
        const i = complete;
        const val = seq[i];
        const next = seq[i + 1];
        const left = Math.min(val, next);
        const right = Math.max(val, next);
        const radius = ((right - left) * scaleX) / 2;
        const cx = left * scaleX + pad + radius;
        const above = i % 2 === 0;
        const hue = ((i * 360) / seq.length + hueOffset) % 360;
        const lw = (preview ? 1.2 : 2.5) + breathe * (preview ? 0.3 : 0.8);

        ctx.strokeStyle = hslString(hue, 90, 55);
        ctx.lineWidth = lw;
        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 60);
          ctx.shadowBlur = 6;
        }
        strokeRecamanArc(ctx, cx, midY, radius, above, frac);
        ctx.shadowBlur = 0;
      }

      if (progress > 0) {
        const headIdx = Math.min(Math.ceil(progress), seq.length - 1);
        const term = seq[headIdx];
        const hx = term * scaleX + pad;
        ctx.beginPath();
        ctx.arc(hx, midY, preview ? 3 : 6, 0, Math.PI * 2);
        ctx.fillStyle = hslString(hueOffset, 100, 70);
        if (!preview) {
          ctx.shadowColor = hslString(hueOffset, 100, 70);
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!preview) {
          ctx.strokeStyle = "rgba(255, 120, 120, 0.6)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(hx, midY);
          ctx.lineTo(hx, axisY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    },
    [seq, layout, preview, progressRef, colors.textMuted]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
