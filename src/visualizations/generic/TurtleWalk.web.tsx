// src/visualizations/generic/TurtleWalk.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { strokePolylineProgress } from "../../playback/drawProgress";
import { termMod } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function TurtleWalk({ terms, width, height, preview }: GenericVizProps) {
  const { progressRef } = useBuildAnimation(terms.length, preview);

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    let x = 0;
    let y = 0;
    let angle = 0;
    for (const t of terms) {
      angle += (termMod(t, 4) - 1.5) * (Math.PI / 3);
      x += Math.cos(angle);
      y += Math.sin(angle);
      pts.push({ x, y });
    }
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const pad = preview ? 10 : 30;
    const sx = (width - pad * 2) / (maxX - minX || 1);
    const sy = (height - pad * 2) / (maxY - minY || 1);
    const s = Math.min(sx, sy);
    const ox = (width - (maxX - minX) * s) / 2;
    const oy = (height - (maxY - minY) * s) / 2;
    return pts.map((p) => ({ x: ox + (p.x - minX) * s, y: oy + (p.y - minY) * s }));
  }, [terms, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      if (points.length === 0 || progressRef.current <= 0) return;
      const hue = (time * 40) % 360;
      ctx.strokeStyle = hslString(hue, 85, 58);
      ctx.lineWidth = preview ? 1 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hue, 85, 58);
        ctx.shadowBlur = 2.5;
      }
      strokePolylineProgress(ctx, points, progressRef.current);
      ctx.shadowBlur = 0;
    },
    [points, preview, progressRef]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
