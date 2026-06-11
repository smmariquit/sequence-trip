// src/visualizations/DigitFlow.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Circle,
  Skia,
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
import { piDigits } from "../sequences/generators";
import { hslToHex } from "../theme";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function DigitFlow({ width, height, count = 400, preview }: Props) {
  const n = preview ? 150 : count;
  const digits = useMemo(() => piDigits(n), [n]);

  const hueShift = useSharedValue(0);
  const flowOffset = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false
    );
    flowOffset.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const segments = useMemo(() => {
    const stepLen = preview ? 3 : 5;
    let x = width / 2;
    let y = height / 2;
    let angle = 0;
    const pts: { x: number; y: number; digit: number }[] = [{ x, y, digit: digits[0] }];

    for (let i = 0; i < digits.length; i++) {
      const d = digits[i];
      angle += ((d - 4.5) / 4.5) * (Math.PI / 3);
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      pts.push({ x, y, digit: d });
    }

    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = preview ? 10 : 30;

    return pts.map(p => ({
      x: ((p.x - minX) / rangeX) * (width - pad * 2) + pad,
      y: ((p.y - minY) / rangeY) * (height - pad * 2) + pad,
      digit: p.digit,
    }));
  }, [digits, width, height, preview]);

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    if (segments.length === 0) return p;
    p.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      p.lineTo(segments[i].x, segments[i].y);
    }
    return p;
  }, [segments]);

  const pathColor = useDerivedValue(() => {
    return hslToHex(hueShift.value, 70, 45);
  });

  const strokeW = useDerivedValue(() => {
    return (preview ? 0.8 : 1.5) + flowOffset.value * 0.5;
  });

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={strokeW}
        color={pathColor}
        strokeCap="round"
        strokeJoin="round"
      >
        {!preview && <BlurMask blur={2} style="solid" />}
      </SkiaPath>
      {!preview &&
        segments
          .filter((_, i) => i % 4 === 0)
          .map((seg, i) => {
            const c = useDerivedValue(() => {
              return hslToHex((seg.digit * 36 + hueShift.value) % 360, 100, 65);
            });
            return (
              <Circle key={i} cx={seg.x} cy={seg.y} r={2.5} color={c}>
                <BlurMask blur={3} style="solid" />
              </Circle>
            );
          })}
    </Canvas>
  );
}
