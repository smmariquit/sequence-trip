// src/visualizations/UlamSpiral.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Circle,
  Group,
} from "@shopify/react-native-skia";
import { ulamSpiralCoords } from "../sequences/generators";
import { hslToHex } from "../theme";
import { useBuildAnimation, useItemFrac } from "../playback/useBuildAnimation";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export function UlamSpiralPreview({ width, height }: { width: number; height: number }) {
  const coords = useMemo(() => ulamSpiralCoords(180), []);
  const maxCoord = useMemo(() => {
    let m = 0;
    for (const c of coords) {
      m = Math.max(m, Math.abs(c.x), Math.abs(c.y));
    }
    return m;
  }, [coords]);

  const cx = width / 2;
  const cy = height / 2;
  const cellSize = Math.min(width, height) * 0.9 / (maxCoord * 2 + 1);

  return (
    <Canvas style={{ width, height }}>
      {coords.map((c, i) => {
        const px = cx + c.x * cellSize;
        const py = cy + c.y * cellSize;
        if (!c.prime) {
          if (i % 3 !== 0) return null;
          return (
            <Circle
              key={i}
              cx={px}
              cy={py}
              r={cellSize * 0.15}
              color="rgba(90, 80, 140, 0.15)"
            />
          );
        }
        const dist = Math.sqrt(c.x * c.x + c.y * c.y);
        return (
          <Circle
            key={i}
            cx={px}
            cy={py}
            r={cellSize * 0.35}
            color={hslToHex((dist * 12) % 360, 100, 65)}
          />
        );
      })}
    </Canvas>
  );
}

export function UlamSpiralFull({ width, height, count = 2000 }: Omit<Props, "preview">) {
  const { progressSV, step: visible } = useBuildAnimation(count, false);
  const fade = useItemFrac(progressSV, visible);
  const coords = useMemo(() => ulamSpiralCoords(count), [count]);

  const maxCoord = useMemo(() => {
    let m = 0;
    for (const c of coords) {
      m = Math.max(m, Math.abs(c.x), Math.abs(c.y));
    }
    return m;
  }, [coords]);

  const cx = width / 2;
  const cy = height / 2;
  const cellSize = Math.min(width, height) * 0.9 / (maxCoord * 2 + 1);

  return (
    <Canvas style={{ width, height }}>
      {coords.slice(0, visible).map((c, i) => {
        if (!c.prime) return null;
        const px = cx + c.x * cellSize;
        const py = cy + c.y * cellSize;
        const dist = Math.sqrt(c.x * c.x + c.y * c.y);
        return (
          <Circle
            key={i}
            cx={px}
            cy={py}
            r={cellSize * 0.45}
            color={hslToHex((dist * 12) % 360, 100, 65)}
          />
        );
      })}
      {coords[visible]?.prime && (
        <Group opacity={fade}>
          <Circle
            cx={cx + coords[visible].x * cellSize}
            cy={cy + coords[visible].y * cellSize}
            r={cellSize * 0.45}
            color={hslToHex(
              (Math.sqrt(
                coords[visible].x * coords[visible].x +
                  coords[visible].y * coords[visible].y
              ) *
                12) %
                360,
              100,
              65
            )}
          />
        </Group>
      )}
    </Canvas>
  );
}

export default function UlamSpiral({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <UlamSpiralPreview width={width} height={height} />;
  }
  return <UlamSpiralFull width={width} height={height} count={count} />;
}
