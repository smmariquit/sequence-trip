// src/visualizations/generic/TurtleWalk.tsx
//
// Turtle turns by term mod 4 each step — every sequence draws its own path.

import React, { useMemo, useEffect } from "react";
import { Canvas, Path as SkiaPath, BlurMask } from "@shopify/react-native-skia";
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
import { termMod } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function TurtleWalk({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const { progressSV } = useBuildAnimation(terms.length, preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 9000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    let x = 0;
    let y = 0;
    let angle = 0;
    for (const t of terms) {
      angle += (termMod(t, 4) - 1.5) * (Math.PI / 3);
      x += Math.cos(angle);
      y += Math.sin(angle);
      pts.push({ x, y });
    }
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const pad = preview ? 10 : 30;
    const sx = (width - pad * 2) / (maxX - minX || 1);
    const sy = (height - pad * 2) / (maxY - minY || 1);
    const s = Math.min(sx, sy);
    const ox = (width - (maxX - minX) * s) / 2;
    const oy = (height - (maxY - minY) * s) / 2;
    return pts.map((p) => ({ x: ox + (p.x - minX) * s, y: oy + (p.y - minY) * s }));
  }, [terms, width, height, preview]);

  const path = useDerivedValue(() => makePolylinePath(points, progressSV.value));
  const color = useDerivedValue(() => hslToHex(hueShift.value % 360, 85, 58));

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1 : 2}
        color={color}
        strokeCap="round"
        strokeJoin="round"
      >
        {!preview && <BlurMask blur={2.5} style="solid" />}
      </SkiaPath>
    </Canvas>
  );
}
