// src/visualizations/generic/BarWaveform.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { itemRevealAlpha } from "../../playback/drawProgress";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function BarWaveform({ terms, width, height, preview }: GenericVizProps) {
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressRef } = useBuildAnimation(stats.logs.length, preview);

  const bars = useMemo(() => {
    const n = stats.logs.length;
    if (n === 0) return [];
    const gap = preview ? 1 : 2;
    const barW = Math.max((width - gap * n) / n, 1);
    const amp = Math.max(Math.abs(stats.maxLog), Math.abs(stats.minLog)) || 1;
    const midY = stats.hasNegative ? height / 2 : height * 0.85;
    const maxH = stats.hasNegative ? height * 0.42 : height * 0.75;
    return stats.logs.map((v, i) => {
      const h = Math.max((Math.abs(v) / amp) * maxH, 1.5);
      return {
        x: i * (barW + gap) + gap / 2,
        y: v >= 0 ? midY - h : midY,
        w: barW,
        h,
        hue: v >= 0 ? (i * 360) / n : ((i * 360) / n + 180) % 360,
        i,
      };
    });
  }, [stats, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const breathe = 0.875 + 0.125 * Math.sin(time * Math.PI);

      for (const b of bars) {
        const alpha = itemRevealAlpha(progress, b.i) * breathe;
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = hslString(b.hue, 90, 60);
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.globalAlpha = 1;
    },
    [bars, progressRef]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
