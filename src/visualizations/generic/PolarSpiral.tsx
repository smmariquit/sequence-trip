// src/visualizations/generic/PolarSpiral.tsx
//
// Term i at golden angle, radius scaled by signed-log value. Slow rotation.

import React, { useMemo, useEffect } from "react";
import { Canvas, Circle, Group, BlurMask } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../../theme";
import { usePlayback } from "../../playback/PlaybackContext";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

const GOLDEN_ANGLE = (137.508 * Math.PI) / 180;

export default function PolarSpiral({ terms, width, height, preview }: GenericVizProps) {
  const { speed } = usePlayback();
  const stats = useMemo(() => normalize(terms), [terms]);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 24000 / speed, easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const points = useMemo(() => {
    const n = stats.logs.length;
    const maxR = Math.min(width, height) * 0.44;
    const range = stats.maxLog - stats.minLog || 1;
    return stats.logs.map((v, i) => {
      const norm = (v - stats.minLog) / range;
      return {
        angle: i * GOLDEN_ANGLE,
        r: maxR * (0.12 + 0.88 * norm),
        hue: (i * 360) / Math.max(n, 1),
        size: (preview ? 1.5 : 3) + norm * (preview ? 1.5 : 4),
      };
    });
  }, [stats, width, height, preview]);

  const cx = width / 2;
  const cy = height / 2;
  const transform = useDerivedValue(() => [{ rotate: rotation.value }]);

  return (
    <Canvas style={{ width, height }}>
      <Group origin={{ x: cx, y: cy }} transform={transform}>
        {points.map((pt, i) => (
          <Circle
            key={i}
            cx={cx + pt.r * Math.cos(pt.angle)}
            cy={cy + pt.r * Math.sin(pt.angle)}
            r={pt.size}
            color={hslToHex(pt.hue, 95, 62)}
          >
            {!preview && <BlurMask blur={3} style="solid" />}
          </Circle>
        ))}
      </Group>
    </Canvas>
  );
}
