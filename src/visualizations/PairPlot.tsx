// src/visualizations/PairPlot.tsx
//
// Static two-sequence comparison plot (phase plane or ratio). No build-up
// animation: construction order carries no information here (Tversky 2002).

import React, { useMemo } from "react";
import { Canvas, Path as SkiaPath, Skia, Circle } from "@shopify/react-native-skia";
import { hslToHex } from "../theme";
import { pairPoints, type PairMode } from "./pairPoints";

interface Props {
  termsA: string[];
  termsB: string[];
  mode: PairMode;
  width: number;
  height: number;
}

export default function PairPlot({ termsA, termsB, mode, width, height }: Props) {
  const points = useMemo(
    () => pairPoints(termsA, termsB, mode, width, height, 24),
    [termsA, termsB, mode, width, height]
  );

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    if (!points.length) return p;
    p.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) p.lineTo(points[i].x, points[i].y);
    return p;
  }, [points]);

  const dots = useMemo(() => {
    const every = Math.max(1, Math.floor(points.length / 40));
    return points.filter((_, i) => i % every === 0);
  }, [points]);

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={1.6}
        color={hslToHex(mode === "phase" ? 265 : 180, 80, 62)}
        strokeJoin="round"
        strokeCap="round"
      />
      {dots.map((pt, i) => (
        <Circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={2.5}
          color={hslToHex((i * 360) / Math.max(dots.length, 1), 90, 62)}
        />
      ))}
    </Canvas>
  );
}
