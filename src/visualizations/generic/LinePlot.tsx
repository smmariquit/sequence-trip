// src/visualizations/generic/LinePlot.tsx
//
// Polyline of signed-log values — works for any growth rate.

import React, { useMemo, useEffect } from "react";
import { Canvas, Path as SkiaPath, Circle, BlurMask } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../../theme";
import { useAnimSpeed } from "../../playback/PlaybackContext";
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { makePolylinePath } from "../../playback/smoothPath";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressSV, step } = useBuildAnimation(stats.logs.length, preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 8000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const { allPoints, dotStep } = useMemo(() => {
    const pad = preview ? 10 : 30;
    const n = stats.logs.length;
    const range = stats.maxLog - stats.minLog || 1;
    const pts = stats.logs.map((v, i) => ({
      x: pad + ((width - pad * 2) * i) / Math.max(n - 1, 1),
      y: height - pad - ((v - stats.minLog) / range) * (height - pad * 2),
    }));
    return {
      allPoints: pts,
      dotStep: Math.max(1, Math.floor(pts.length / (preview ? 20 : 60))),
    };
  }, [stats, width, height, preview]);

  const path = useDerivedValue(() => makePolylinePath(allPoints, progressSV.value));
  const strokeColor = useDerivedValue(() => hslToHex(hueShift.value % 360, 90, 60));
  const visible = step;

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1.2 : 2}
        color={strokeColor}
        strokeJoin="round"
      >
        {!preview && <BlurMask blur={3} style="solid" />}
      </SkiaPath>
      {allPoints
        .filter((_, i) => i < visible && i % dotStep === 0)
        .map((pt, i) => (
          <Circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={preview ? 1.5 : 3}
            color={hslToHex((i * dotStep * 360) / Math.max(allPoints.length, 1), 95, 65)}
          />
        ))}
    </Canvas>
  );
}
