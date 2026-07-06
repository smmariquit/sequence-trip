// src/visualizations/FibonacciSpiral.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Circle,
} from "@shopify/react-native-skia";
import { hslToHex } from "../theme";
import { useBuildAnimation } from "../playback/useBuildAnimation";

const GOLDEN_ANGLE = 137.508;

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export function FibonacciSpiralPreview({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.45;
  const n = 80;

  const points = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      const r = maxR * Math.sqrt(i / n);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        color: hslToHex((i * 360) / n, 95, 60),
      };
    });
  }, [cx, cy, maxR, n]);

  return (
    <Canvas style={{ width, height }}>
      {points.map((pt, i) => (
        <Circle key={i} cx={pt.x} cy={pt.y} r={1.5} color={pt.color} />
      ))}
    </Canvas>
  );
}

export function FibonacciSpiralFull({ width, height, count = 300 }: Omit<Props, "preview">) {
  const { step: visible } = useBuildAnimation(count, false);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.45;

  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      const r = maxR * Math.sqrt(i / count);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        color: hslToHex((i * 360) / count, 95, 60),
      };
    });
  }, [count, maxR, cx, cy]);

  return (
    <Canvas style={{ width, height }}>
      {points.slice(0, visible).map((pt, i) => (
        <Circle key={i} cx={pt.x} cy={pt.y} r={3} color={pt.color} />
      ))}
    </Canvas>
  );
}

export default function FibonacciSpiral({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <FibonacciSpiralPreview width={width} height={height} />;
  }
  return <FibonacciSpiralFull width={width} height={height} count={count} />;
}
