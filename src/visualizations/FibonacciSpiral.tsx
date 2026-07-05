// src/visualizations/FibonacciSpiral.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../theme";
import { usePlayback } from "../playback/PlaybackContext";

const GOLDEN_ANGLE = 137.508;

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function FibonacciSpiral({ width, height, count = 300, preview }: Props) {
  const { speed } = usePlayback();
  const n = preview ? 120 : count;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.45;

  const rotation = useSharedValue(0);
  const hueShift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 20000 / speed, easing: Easing.linear }),
      -1,
      false
    );
    hueShift.value = withRepeat(
      withTiming(360, { duration: 6000 / speed, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const points = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      const r = maxR * Math.sqrt(i / n);
      return { angle, r, baseHue: (i * 360) / n };
    });
  }, [n, maxR]);

  return (
    <Canvas style={{ width, height }}>
      {points.map((pt, i) => {
        const x = useDerivedValue(() => {
          return cx + pt.r * Math.cos(pt.angle + rotation.value);
        });
        const y = useDerivedValue(() => {
          return cy + pt.r * Math.sin(pt.angle + rotation.value);
        });
        const color = useDerivedValue(() => {
          return hslToHex((pt.baseHue + hueShift.value) % 360, 95, 60);
        });
        const radius = useDerivedValue(() => {
          const base = preview ? 1.5 : 3;
          const p = 1 + pulse.value * 0.5 * Math.sin(i * 0.1);
          return base * p;
        });

        return (
          <Circle key={i} cx={x} cy={y} r={radius} color={color}>
            {!preview && <BlurMask blur={4} style="solid" />}
          </Circle>
        );
      })}
    </Canvas>
  );
}
