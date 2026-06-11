// src/visualizations/DigitFlow.web.tsx

import React, { useMemo, useCallback } from "react";
import { useWebCanvas, hslString } from "./useWebCanvas";
import { piDigits } from "../sequences/generators";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function DigitFlow({ width, height, count = 400, preview }: Props) {
  const n = preview ? 150 : count;
  const digits = useMemo(() => piDigits(n), [n]);

  const segments = useMemo(() => {
    const stepLen = preview ? 3 : 5;
    let x = 0, y = 0, angle = 0;
    const pts: { x: number; y: number; digit: number }[] = [{ x, y, digit: digits[0] }];

    for (let i = 0; i < digits.length; i++) {
      const d = digits[i];
      angle += ((d - 4.5) / 4.5) * (Math.PI / 3);
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      pts.push({ x, y, digit: d });
    }

    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = preview ? 10 : 30;

    return pts.map((p) => ({
      x: ((p.x - minX) / rangeX) * (width - pad * 2) + pad,
      y: ((p.y - minY) / rangeY) * (height - pad * 2) + pad,
      digit: p.digit,
    }));
  }, [digits, width, height, preview]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
      const hueShift = (time * 40) % 360;
      const flowPulse = Math.sin(time * 1.26) * 0.5 + 0.5;
      const strokeW = (preview ? 0.8 : 1.5) + flowPulse * 0.5;

      ctx.beginPath();
      ctx.moveTo(segments[0].x, segments[0].y);
      for (let i = 1; i < segments.length; i++) {
        ctx.lineTo(segments[i].x, segments[i].y);
      }
      ctx.strokeStyle = hslString(hueShift, 70, 45);
      ctx.lineWidth = strokeW;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (!preview) {
        ctx.shadowColor = hslString(hueShift, 80, 55);
        ctx.shadowBlur = 4;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (!preview) {
        for (let i = 0; i < segments.length; i += 4) {
          const seg = segments[i];
          const hue = (seg.digit * 36 + hueShift) % 360;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hslString(hue, 100, 65);
          ctx.shadowColor = hslString(hue, 100, 70);
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    },
    [segments, preview]
  );

  const ref = useWebCanvas(width, height, draw);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}
