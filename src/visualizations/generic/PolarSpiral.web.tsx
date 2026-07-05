// src/visualizations/generic/PolarSpiral.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

const GOLDEN_ANGLE = (137.508 * Math.PI) / 180;

export default function PolarSpiral({ terms, width, height, preview }: GenericVizProps) {
  const stats = useMemo(() => normalize(terms), [terms]);

  const points = useMemo(() => {
    const n = stats.logs.length;
    const maxR = Math.min(width, height) * 0.44;
    const range = stats.maxLog - stats.minLog || 1;
    return stats.logs.map((v, i) => {
      const norm = (v - stats.minLog) / range;
      return {
        angle: i * GOLDEN_ANGLE,
        r: maxR * (0.12 + 0.88 * norm),
        hue: (i * 360) / Math.max(n, 1),
        size: (preview ? 1.5 : 3) + norm * (preview ? 1.5 : 4),
      };
    });
  }, [stats, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const rotation = time * 0.2618;

      for (const pt of points) {
        const a = pt.angle + rotation;
        const x = cx + pt.r * Math.cos(a);
        const y = cy + pt.r * Math.sin(a);
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
    },
    [points, width, height, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
