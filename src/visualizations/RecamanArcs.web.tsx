// src/visualizations/RecamanArcs.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function RecamanArcs({ width, height, count = 64, preview }: Props) {
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

  const maxVal = Math.max(...seq);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const pad = preview ? 8 : 20;
      const scaleX = (w - pad * 2) / maxVal;
      const midY = h / 2;
      const hueOffset = (time * 45) % 360;
      const breathe = Math.sin(time * 2.1) * 0.5 + 0.5;

      ctx.lineCap = "round";

      for (let i = 0; i < seq.length - 1; i++) {
        const val = seq[i];
        const next = seq[i + 1];
        const left = Math.min(val, next);
        const right = Math.max(val, next);
        const radius = ((right - left) * scaleX) / 2;
        const cx = left * scaleX + pad + radius;
        const above = i % 2 === 0;

        const hue = ((i * 360) / seq.length + hueOffset) % 360;
        const lw = (preview ? 1.2 : 2.5) + breathe * (preview ? 0.3 : 0.8);

        ctx.beginPath();
        ctx.arc(cx, midY, radius, above ? Math.PI : 0, above ? 0 : Math.PI);
        ctx.strokeStyle = hslString(hue, 90, 55);
        ctx.lineWidth = lw;

        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 60);
          ctx.shadowBlur = 6;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    },
    [seq, maxVal, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
