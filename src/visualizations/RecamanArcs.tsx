// src/visualizations/RecamanArcs.tsx

import React, { useMemo } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Skia,
  Group,
  BlurMask,
  Shadow,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { hslToHex } from "../theme";
import { usePlayback } from "../playback/PlaybackContext";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function RecamanArcs({ width, height, count = 64, preview }: Props) {
  const { speed } = usePlayback();
  const n = preview ? 28 : count;

  const seq = useMemo(() => {
    const s = [0];
    const seen = new Set([0]);
    for (let i = 1; i < n; i++) {
      const back = s[i - 1] - i;
      if (back > 0 && !seen.has(back)) s.push(back);
      else s.push(s[i - 1] + i);
      seen.add(s[i]);
    }
    return s;
  }, [n]);

  const maxVal = Math.max(...seq);
  const hueOffset = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    hueOffset.value = withRepeat(
      withTiming(360, { duration: 8000 / speed, easing: Easing.linear }),
      -1,
      false
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 3000 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const arcs = useMemo(() => {
    const pad = preview ? 8 : 20;
    const scaleX = (width - pad * 2) / maxVal;
    const midY = height / 2;

    return seq.slice(0, -1).map((val, i) => {
      const next = seq[i + 1];
      const left = Math.min(val, next);
      const right = Math.max(val, next);
      const radius = ((right - left) * scaleX) / 2;
      const cx = left * scaleX + pad + radius;
      const above = i % 2 === 0;

      const path = Skia.Path.Make();
      path.addArc(
        {
          x: cx - radius,
          y: above ? midY - radius : midY,
          width: radius * 2,
          height: radius * 2,
        },
        above ? 180 : 0,
        180
      );
      return { path, hue: (i * 360) / seq.length };
    });
  }, [seq, width, height, maxVal, preview]);

  return (
    <Canvas style={{ width, height }}>
      {arcs.map((arc, i) => {
        const color = useDerivedValue(() => {
          return hslToHex((arc.hue + hueOffset.value) % 360, 90, 55);
        });
        const strokeWidth = useDerivedValue(() => {
          const base = preview ? 1.2 : 2.5;
          return base + breathe.value * (preview ? 0.3 : 0.8);
        });
        return (
          <Group key={i}>
            <SkiaPath
              path={arc.path}
              style="stroke"
              strokeWidth={strokeWidth}
              color={color}
            >
              {!preview && <BlurMask blur={3} style="solid" />}
            </SkiaPath>
          </Group>
        );
      })}
    </Canvas>
  );
}
