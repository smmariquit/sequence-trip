// src/visualizations/CollatzTree.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { useThemeColors } from "../theme";
import { useBuildAnimation, } from "../playback/useBuildAnimation";
import { strokePolylineProgress } from "../playback/drawProgress";
import { buildCollatzBranches, fitCollatz } from "./collatzLayout";
import { drawBackedLabel } from "./canvasAxes";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function CollatzTree({ width, height, count = 40, preview }: Props) {
  const colors = useThemeColors();
  const n = preview ? 18 : count;
  const { progressRef } = useBuildAnimation(n, preview);

  const { branches, root } = useMemo(() => {
    const raw = buildCollatzBranches(n);
    const { scale, dx, dy } = fitCollatz(raw, width, height, !!preview);
    return {
      root: { x: dx, y: dy },
      branches: raw.map((b) => ({
        hue: b.hue,
        pts: b.pts.map((p) => ({ x: dx + p.x * scale, y: dy + p.y * scale })),
      })),
    };
  }, [n, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const hueShift = (time * 30) % 360;
      const breathe = Math.sin(time * 1.57) * 0.5 + 0.5;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (!preview) {
        // ghost of the finished tree so the fitted frame makes sense while
        // early (short) paths are still drawing
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = "#8a84b0";
        ctx.lineWidth = 1;
        for (const b of branches) {
          strokePolylineProgress(ctx, b.pts, b.pts.length);
        }
        ctx.globalAlpha = 1;
      }

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

        strokePolylineProgress(ctx, branch.pts, branchProgress);
        ctx.shadowBlur = 0;
      }

      if (!preview) {
        drawBackedLabel(ctx, {
          text: "one glowing branch per starting number; every path ends at 1 (the shared root)",
          x: width / 2,
          y: 18,
          fg: colors.textMuted,
          bg: colors.bg,
          size: 14,
          weight: "400",
          align: "center",
        });
        drawBackedLabel(ctx, { text: "1", x: root.x + 8, y: root.y + 10, fg: colors.textMuted, bg: colors.bg, size: 13 });
      }
    },
    [branches, root, preview, progressRef, width, colors.textMuted, colors.bg]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
