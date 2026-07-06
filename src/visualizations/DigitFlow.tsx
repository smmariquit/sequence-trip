// src/visualizations/DigitFlow.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Path as SkiaPath,
  Circle,
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
import { useAnimSpeed } from "../playback/PlaybackContext";
import { useBuildAnimation } from "../playback/useBuildAnimation";
import { makePolylinePath } from "../playback/smoothPath";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

type Segment = { x: number; y: number; digit: number };

function buildSegments(
  digits: number[],
  width: number,
  height: number,
  stepLen: number,
  pad: number
): Segment[] {
  let x = width / 2;
  let y = height / 2;
  let angle = 0;
  const pts: Segment[] = [{ x, y, digit: digits[0] }];

  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    angle += ((d - 4.5) / 4.5) * (Math.PI / 3);
    x += Math.cos(angle) * stepLen;
    y += Math.sin(angle) * stepLen;
    pts.push({ x, y, digit: d });
  }

  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return pts.map((p) => ({
    x: ((p.x - minX) / rangeX) * (width - pad * 2) + pad,
    y: ((p.y - minY) / rangeY) * (height - pad * 2) + pad,
    digit: p.digit,
  }));
}

export function DigitFlowPreview({ width, height }: { width: number; height: number }) {
  const digits = useMemo(() => piDigits(120), []);
  const segments = useMemo(
    () => buildSegments(digits, width, height, 3, 10),
    [digits, width, height]
  );
  const path = useMemo(() => makePolylinePath(segments, segments.length - 1), [segments]);

  return (
    <Canvas style={{ width, height }}>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={0.8}
        color={hslToHex(200, 70, 45)}
        strokeCap="round"
        strokeJoin="round"
      />
    </Canvas>
  );
}

export function DigitFlowFull({ width, height, count = 400 }: Omit<Props, "preview">) {
  const speed = useAnimSpeed();
  const n = count;
  const { progressSV, step } = useBuildAnimation(n, false);
  const digits = useMemo(() => piDigits(n), [n]);

  const hueShift = useSharedValue(0);
  const flowOffset = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 9000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
    flowOffset.value = withRepeat(
      withTiming(1, { duration: 5000 / Math.max(speed, 0.25), easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed, hueShift, flowOffset]);

  const segments = useMemo(
    () => buildSegments(digits, width, height, 5, 30),
    [digits, width, height]
  );

  const path = useDerivedValue(() => makePolylinePath(segments, progressSV.value));
  const pathColor = useDerivedValue(() => hslToHex(hueShift.value, 70, 45));
  const strokeW = useDerivedValue(() => 1.5 + flowOffset.value * 0.5);
  const visible = step;

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
        <BlurMask blur={2} style="solid" />
      </SkiaPath>
      {segments
        .filter((_, i) => i < visible && i % 4 === 0)
        .map((seg, i) => (
          <Circle
            key={i}
            cx={seg.x}
            cy={seg.y}
            r={2.5}
            color={hslToHex((seg.digit * 36) % 360, 100, 65)}
          >
            <BlurMask blur={3} style="solid" />
          </Circle>
        ))}
    </Canvas>
  );
}

export default function DigitFlow({ width, height, count, preview }: Props) {
  if (preview !== false) {
    return <DigitFlowPreview width={width} height={height} />;
  }
  return <DigitFlowFull width={width} height={height} count={count} />;
}
