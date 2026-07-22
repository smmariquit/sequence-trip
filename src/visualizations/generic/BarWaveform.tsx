// src/visualizations/generic/BarWaveform.tsx
//
// Signed bars around a midline — negatives dive below. Audio "now playing" view.

import React, { useMemo, useEffect } from "react";
import { Rect, Group } from "@shopify/react-native-skia";
import VizCanvas from "../VizCanvas";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../../theme";
import { useAnimSpeed } from "../../playback/PlaybackContext";
import { useBuildAnimation, useItemFrac } from "../../playback/useBuildAnimation";
import { normalize } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function BarWaveform({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressSV, step: visible } = useBuildAnimation(stats.logs.length, preview);
  const fade = useItemFrac(progressSV, visible);
  const breathe = useSharedValue(0.75);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2000 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const bars = useMemo(() => {
    const n = stats.logs.length;
    if (n === 0) return [];
    const gap = preview ? 1 : 2;
    const barW = Math.max((width - gap * n) / n, 1);
    const amp = Math.max(Math.abs(stats.maxLog), Math.abs(stats.minLog)) || 1;
    const midY = stats.hasNegative ? height / 2 : height * 0.85;
    const maxH = stats.hasNegative ? height * 0.42 : height * 0.75;
    return stats.logs.map((v, i) => {
      const h = Math.max((Math.abs(v) / amp) * maxH, 1.5);
      return {
        x: i * (barW + gap) + gap / 2,
        y: v >= 0 ? midY - h : midY,
        w: barW,
        h,
        hue: v >= 0 ? (i * 360) / n : ((i * 360) / n + 180) % 360,
      };
    });
  }, [stats, width, height, preview]);

  const opacity = useDerivedValue(() => breathe.value);

  return (
    <VizCanvas width={width} height={height}>
      <Group opacity={opacity}>
        {bars.slice(0, visible).map((b, i) => (
          <Rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            color={hslToHex(b.hue, 90, 60)}
          />
        ))}
        {bars[visible] && (
          <Group opacity={fade}>
            <Rect
              x={bars[visible].x}
              y={bars[visible].y}
              width={bars[visible].w}
              height={bars[visible].h}
              color={hslToHex(bars[visible].hue, 90, 60)}
            />
          </Group>
        )}
      </Group>
    </VizCanvas>
  );
}
