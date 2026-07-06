// src/visualizations/CollatzTree.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { useBuildAnimation } from "../playback/useBuildAnimation";
import { strokePolylineProgress } from "../playback/drawProgress";
import { collatzSequence } from "../sequences/generators";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function CollatzTree({ width, height, count = 40, preview }: Props) {
  const n = preview ? 18 : count;
  const { progressRef } = useBuildAnimation(n, preview);

  const branches = useMemo(() => {
    const stepLen = preview ? 4 : 7;
    const evenAngle = Math.PI / 12;
    const oddAngle = -Math.PI / 7;

    return Array.from({ length: n }, (_, i) => {
      const seq = collatzSequence(i + 2);
      const pts: { x: number; y: number }[] = [];
      let x = 0, y = 0, angle = -Math.PI / 2;
      pts.push({ x, y });
      for (let j = 0; j < seq.length - 1 && j < 120; j++) {
        angle += seq[j] % 2 === 0 ? evenAngle : oddAngle;
        x += Math.cos(angle) * stepLen;
        y += Math.sin(angle) * stepLen;
        pts.push({ x, y });
      }
      return { pts, hue: (i * 360) / n };
    });
  }, [n, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const progress = progressRef.current;
      const cx = w / 2;
      const startY = h - 30;
      const hueShift = (time * 30) % 360;
      const breathe = Math.sin(time * 1.57) * 0.5 + 0.5;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let bi = 0; bi < branches.length; bi++) {
        const branchProgress = progress - bi;
        if (branchProgress <= 0) continue;

        const branch = branches[bi];
        const hue = (branch.hue + hueShift) % 360;
        const lw = (preview ? 1 : 1.8) + breathe * 0.4;

        ctx.strokeStyle = hslString(hue, 85, 55 + breathe * 10);
        ctx.lineWidth = lw;
        if (!preview) {
          ctx.shadowColor = hslString(hue, 100, 60);
          ctx.shadowBlur = 4;
        }

        const shifted = branch.pts.map((p) => ({ x: cx + p.x, y: startY + p.y }));
        strokePolylineProgress(ctx, shifted, branchProgress);
        ctx.shadowBlur = 0;
      }
    },
    [branches, preview, progressRef]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
