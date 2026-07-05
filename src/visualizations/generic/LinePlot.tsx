// src/visualizations/generic/LinePlot.tsx
//
// Polyline of signed-log values — works for any growth rate.

import React, { useMemo, useEffect } from "react";
import { Canvas, Path as SkiaPath, Skia, Circle, BlurMask } from "@shopify/react-native-skia";
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

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const { speed } = usePlayback();
  const stats = useMemo(() => normalize(terms), [terms]);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 8000 / speed, easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const { path, points } = useMemo(() => {
    const pad = preview ? 10 : 30;
    const n = stats.logs.length;
    const range = stats.maxLog - stats.minLog || 1;
    const pts = stats.logs.map((v, i) => ({
      x: pad + ((width - pad * 2) * i) / Math.max(n - 1, 1),
      y: height - pad - ((v - stats.minLog) / range) * (height - pad * 2),
    }));
    const p = Skia.Path.Make();
    if (pts.length > 0) {
      p.moveTo(pts[0].x, pts[0].y);
      for (const pt of pts.slice(1)) p.lineTo(pt.x, pt.y);
    }
    return { path: p, points: pts };
  }, [stats, width, height, preview]);

  const strokeColor = useDerivedValue(() => hslToHex(hueShift.value % 360, 90, 60));

  const dotStep = Math.max(1, Math.floor(points.length / (preview ? 20 : 60)));

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
      {points
        .filter((_, i) => i % dotStep === 0)
        .map((pt, i) => (
          <Circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={preview ? 1.5 : 3}
            color={hslToHex((i * dotStep * 360) / Math.max(points.length, 1), 95, 65)}
          />
        ))}
    </Canvas>
  );
}
