// src/visualizations/RecamanArcs.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { useThemeColors } from "../theme";
import { useBuildAnimation } from "../playback/useBuildAnimation";
import { splitProgress, strokeRecamanArc } from "../playback/drawProgress";
import { drawNumberLine } from "./canvasAxes";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function RecamanArcs({ width, height, count = 64, preview }: Props) {
  const colors = useThemeColors();
  const n = preview ? 28 : count;

  const seq = useMemo(() => {
    const s = [0];
    const seen = new Set([0]);
    for (let i = 1; i < n; i++) {
      const back = s[i - 1] - i;
      if (back > 0 && !seen.has(back)) s.push(back);
      else s.push(s[i - 1] + i);
      seen.add(s[i]);
    }
    return s;
  }, [n]);

  const { progressRef } = useBuildAnimation(Math.max(seq.length - 1, 0), preview);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const progress = progressRef.current;
      const basePad = preview ? 8 : 24;
      const axisY = h - (preview ? 14 : 56);
      const usable = axisY - (preview ? 6 : 16);
      const midY = usable / 2 + (preview ? 3 : 8);
      const { complete, frac } = splitProgress(progress);
      // static full-walk scale — per-step rescaling reads as jumpy
      const maxVal = Math.max(...seq, 1);
      const fullSpan = w - basePad * 2;
      const scaleX = Math.min(fullSpan, usable) / maxVal;
      const pad = basePad + (fullSpan - maxVal * scaleX) / 2;
      const span = maxVal * scaleX;
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
    [seq, preview, progressRef, colors.textMuted]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
