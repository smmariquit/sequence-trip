// src/visualizations/UlamSpiral.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { useThemeColors } from "../theme";
import { useBuildAnimation } from "../playback/useBuildAnimation";
import { drawBackedLabel } from "./canvasAxes";
import { itemRevealAlpha } from "../playback/drawProgress";
import { ulamSpiralCoords } from "../sequences/generators";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function UlamSpiral({ width, height, count = 2000, preview }: Props) {
  const colors = useThemeColors();
  const n = preview ? 400 : count;
  const { progressRef } = useBuildAnimation(n, preview);

  const data = useMemo(() => {
    const coords = ulamSpiralCoords(n);
    let maxC = 0;
    for (const c of coords) maxC = Math.max(maxC, Math.abs(c.x), Math.abs(c.y));
    return { coords, maxC };
  }, [n]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const progress = progressRef.current;
      const topPad = preview ? 0 : 30;
      const bottomPad = preview ? 0 : 64;
      const usableH = h - topPad - bottomPad;
      const cx = w / 2;
      const cy = topPad + usableH / 2;
      const cellSize = (Math.min(w, usableH) * 0.94) / (data.maxC * 2 + 1);
      const hueShift = (time * 36) % 360;
      const glowPulse = Math.sin(time * 4.2) * 0.5 + 0.5;

      if (!preview) {
        drawBackedLabel(ctx, {
          text: "integers spiral outward from 1 at the center; bright dots are primes",
          x: cx,
          y: 18,
          fg: colors.textMuted,
          bg: colors.bg,
          size: 14,
          weight: "400",
          align: "center",
        });
      }

      let head: { x: number; y: number; i: number; prime: boolean } | null = null;
      for (let i = 0; i < data.coords.length; i++) {
        const alpha = itemRevealAlpha(progress, i);
        if (alpha <= 0) continue;

        const c = data.coords[i];
        const px = cx + c.x * cellSize;
        const py = cy + c.y * cellSize;

        head = { x: px, y: py, i, prime: c.prime };
        if (!c.prime) {
          if (preview && i % 3 !== 0) continue;
          ctx.globalAlpha = alpha * 0.15;
          ctx.beginPath();
          ctx.arc(px, py, cellSize * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(90, 80, 140, 1)";
          ctx.fill();
          continue;
        }

        const dist = Math.sqrt(c.x * c.x + c.y * c.y);
        const hue = (dist * 12 + hueShift) % 360;
        const r = (preview ? cellSize * 0.35 : cellSize * 0.45) + glowPulse * cellSize * 0.15;

        ctx.globalAlpha = alpha;
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
      ctx.globalAlpha = 1;

      if (!preview) {
        drawBackedLabel(ctx, { text: "1", x: cx + 8, y: cy, fg: colors.textMuted, bg: colors.bg, size: 13 });
        if (head) {
          const label = `n = ${head.i + 1}${head.prime ? ", prime" : ""}`;
          const lx = head.x + 12 > w - 150 ? head.x - 12 - 110 : head.x + 12;
          drawBackedLabel(ctx, { text: label, x: lx, y: head.y - 14, fg: colors.text, bg: colors.bg, size: 15 });
        }
      }
    },
    [data, preview, progressRef, colors.text, colors.textMuted, colors.bg]
  );

  const ref = useWebCanvas(width, height, draw, !preview);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
