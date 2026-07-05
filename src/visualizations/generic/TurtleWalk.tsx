// src/visualizations/generic/TurtleWalk.tsx
//
// Turtle turns by term mod 4 each step — every sequence draws its own path.

import React, { useMemo, useEffect } from "react";
import { Canvas, Path as SkiaPath, Skia, BlurMask } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../../theme";
import { usePlayback } from "../../playback/PlaybackContext";
import { termMod } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function TurtleWalk({ terms, width, height, preview }: GenericVizProps) {
  const { speed } = usePlayback();
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 9000 / speed, easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const path = useMemo(() => {
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
    const p = Skia.Path.Make();
    p.moveTo(ox + (pts[0].x - minX) * s, oy + (pts[0].y - minY) * s);
    for (const pt of pts.slice(1)) {
      p.lineTo(ox + (pt.x - minX) * s, oy + (pt.y - minY) * s);
    }
    return p;
  }, [terms, width, height, preview]);

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
