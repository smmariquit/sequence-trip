// src/visualizations/FibonacciSpiral.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";

const GOLDEN_ANGLE = 137.508;

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function FibonacciSpiral({ width, height, count = 300, preview }: Props) {
  const n = preview ? 120 : count;

  const basePoints = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      const rNorm = Math.sqrt(i / n);
      return { angle, rNorm, baseHue: (i * 360) / n };
    });
  }, [n]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.45;
      const rotation = time * 0.314;
      const hueShift = (time * 60) % 360;
      const pulse = Math.sin(time * 3.14) * 0.5 + 0.5;

      for (let i = 0; i < basePoints.length; i++) {
        const pt = basePoints[i];
        const r = maxR * pt.rNorm;
        const a = pt.angle + rotation;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);

        const hue = (pt.baseHue + hueShift) % 360;
        const baseR = preview ? 1.5 : 3;
        const pr = baseR * (1 + pulse * 0.5 * Math.sin(i * 0.1));

        ctx.beginPath();
        ctx.arc(x, y, pr, 0, Math.PI * 2);
        ctx.fillStyle = hslString(hue, 95, 60);

        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 70);
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
    [basePoints, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
