// src/visualizations/generic/PolarSpiral.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { itemRevealAlpha } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

const GOLDEN_ANGLE = (137.508 * Math.PI) / 180;

export default function PolarSpiral({ terms, width, height, preview }: GenericVizProps) {
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressRef } = useBuildAnimation(stats.logs.length, preview);

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
        i,
      };
    });
  }, [stats, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const cx = width / 2;
      const cy = height / 2;
      const rotation = time * 0.2618;

      for (const pt of points) {
        const alpha = itemRevealAlpha(progress, pt.i);
        if (alpha <= 0) continue;

        const a = pt.angle + rotation;
        const x = cx + pt.r * Math.cos(a);
        const y = cy + pt.r * Math.sin(a);

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
    },
    [points, width, height, preview, progressRef]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
