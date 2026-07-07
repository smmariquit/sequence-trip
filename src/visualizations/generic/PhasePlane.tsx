// src/visualizations/generic/PhasePlane.tsx
//
// Phase plane: a(n+1) vs a(n) in symlog space (OEIS plot2 mode, shift 1).
// Permutations and chaotic walks show their structure here.

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
import { phasePoints } from "./phasePoints";
import type { GenericVizProps } from "./types";

export default function PhasePlane({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const stats = useMemo(() => normalize(terms), [terms]);
  const points = useMemo(() => {
    const pad = preview ? 10 : 30;
    return phasePoints(stats.logs, stats.minLog, stats.maxLog, width, height, pad);
  }, [stats, width, height, preview]);

  const { progressSV, step } = useBuildAnimation(Math.max(points.length - 1, 0), preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 10000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const path = useDerivedValue(() => makePolylinePath(points, progressSV.value));
  const strokeColor = useDerivedValue(() => hslToHex(hueShift.value % 360, 85, 60));
  const head = points[Math.min(step, Math.max(points.length - 1, 0))];

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1 : 1.6}
        color={strokeColor}
        strokeJoin="round"
        strokeCap="round"
      >
        {!preview && <BlurMask blur={2.5} style="solid" />}
      </SkiaPath>
      {!preview && head && (
        <Circle cx={head.x} cy={head.y} r={4} color={hslToHex(0, 100, 70)} />
      )}
    </Canvas>
  );
}
