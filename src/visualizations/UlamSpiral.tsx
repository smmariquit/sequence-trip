// src/visualizations/UlamSpiral.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ulamSpiralCoords } from "../sequences/generators";
import { hslToHex } from "../theme";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function UlamSpiral({ width, height, count = 2000, preview }: Props) {
  const n = preview ? 400 : count;

  const coords = useMemo(() => ulamSpiralCoords(n), [n]);

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

  const hueShift = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
      false
    );
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  return (
    <Canvas style={{ width, height }}>
      {coords.map((c, i) => {
        const px = cx + c.x * cellSize;
        const py = cy + c.y * cellSize;

        if (!c.prime) {
          if (preview && i % 3 !== 0) return null;
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

        const color = useDerivedValue(() => {
          const dist = Math.sqrt(c.x * c.x + c.y * c.y);
          const hue = (dist * 12 + hueShift.value) % 360;
          return hslToHex(hue, 100, 65);
        });

        const r = useDerivedValue(() => {
          const base = preview ? cellSize * 0.35 : cellSize * 0.45;
          return base + glowPulse.value * cellSize * 0.15;
        });

        return (
          <Circle key={i} cx={px} cy={py} r={r} color={color}>
            {!preview && <BlurMask blur={6} style="solid" />}
          </Circle>
        );
      })}
    </Canvas>
  );
}
