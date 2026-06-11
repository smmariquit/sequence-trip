// src/visualizations/UlamSpiral.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { ulamSpiralCoords } from "../sequences/generators";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function UlamSpiral({ width, height, count = 2000, preview }: Props) {
  const n = preview ? 400 : count;

  const data = useMemo(() => {
    const coords = ulamSpiralCoords(n);
    let maxC = 0;
    for (const c of coords) maxC = Math.max(maxC, Math.abs(c.x), Math.abs(c.y));
    return { coords, maxC };
  }, [n]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const cellSize = (Math.min(w, h) * 0.9) / (data.maxC * 2 + 1);
      const hueShift = (time * 36) % 360;
      const glowPulse = Math.sin(time * 4.2) * 0.5 + 0.5;

      for (let i = 0; i < data.coords.length; i++) {
        const c = data.coords[i];
        const px = cx + c.x * cellSize;
        const py = cy + c.y * cellSize;

        if (!c.prime) {
          if (preview && i % 3 !== 0) continue;
          ctx.beginPath();
          ctx.arc(px, py, cellSize * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(90, 80, 140, 0.15)";
          ctx.fill();
          continue;
        }

        const dist = Math.sqrt(c.x * c.x + c.y * c.y);
        const hue = (dist * 12 + hueShift) % 360;
        const r = (preview ? cellSize * 0.35 : cellSize * 0.45) + glowPulse * cellSize * 0.15;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = hslString(hue, 100, 65);
        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 70);
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
    [data, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
