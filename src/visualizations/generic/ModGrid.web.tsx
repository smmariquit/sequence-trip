// src/visualizations/generic/ModGrid.web.tsx

import React, { useCallback, useMemo } from "react";
import { useWebCanvas, hslString } from "../useWebCanvas";
import { useThemeColors } from "../../theme";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { itemRevealAlpha } from "../../playback/drawProgress";
import { layoutModGrid } from "./modGridLayout";
import { drawBackedLabel } from "../canvasAxes";
import { formatTermLabel } from "./linePlotLayout";
import type { GenericVizProps } from "./types";

export default function ModGrid({ terms, width, height, preview }: GenericVizProps) {
  const colors = useThemeColors();
  const { progressRef } = useBuildAnimation(terms.length, preview);

  const layout = useMemo(
    () => layoutModGrid(terms, width, height, !!preview),
    [terms, width, height, preview]
  );
  const { cells } = layout;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const progress = progressRef.current;
      const breathe = 0.9 + 0.1 * Math.sin(time * 2.513);

      if (!preview) {
        drawBackedLabel(ctx, {
          text: "one cell per term, reading left → right, row by row ↓ · color = a(n)",
          x: width / 2,
          y: 15,
          fg: colors.textMuted,
          bg: colors.bg,
          size: 12,
          weight: "400",
          align: "center",
        });
      }

      let head: (typeof cells)[number] | null = null;
      let headIdx = -1;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const alpha = itemRevealAlpha(progress, i) * breathe;
        if (alpha <= 0) continue;
        head = c;
        headIdx = i;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.m === 0 ? "rgba(40, 35, 70, 0.6)" : hslString((c.m * 360) / 10, 85, 55);
        ctx.fillRect(c.x, c.y, c.w, c.h);
      }
      ctx.globalAlpha = 1;

      // outline the newest cell and name its term
      if (!preview && head) {
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.strokeRect(head.x - 1, head.y - 1, head.w + 2, head.h + 2);

        const label = `a(${headIdx}) = ${formatTermLabel(terms[headIdx])}`;
        ctx.font = "600 13px system-ui, sans-serif";
        const tw = ctx.measureText(label).width;
        const lx = head.x + head.w + 8 + tw > width ? head.x - 8 - tw : head.x + head.w + 8;
        drawBackedLabel(ctx, { text: label, x: lx, y: head.y + head.h / 2, fg: colors.text, bg: colors.bg });
      }
    },
    [cells, terms, preview, progressRef, width, colors.textMuted, colors.text]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
