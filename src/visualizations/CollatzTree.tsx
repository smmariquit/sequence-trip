// src/visualizations/CollatzTree.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Path as SkiaPath,
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
import { collatzSequence } from "../sequences/generators";
import { hslToHex } from "../theme";
import { usePlayback } from "../playback/PlaybackContext";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

export default function CollatzTree({ width, height, count = 40, preview }: Props) {
  const { speed } = usePlayback();
  const n = preview ? 18 : count;

  const hueShift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 12000 / speed, easing: Easing.linear }),
      -1,
      false
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 4000 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const branches = useMemo(() => {
    const cx = width / 2;
    const startY = height - 30;
    const stepLen = preview ? 4 : 7;
    const evenAngle = Math.PI / 12;
    const oddAngle = -Math.PI / 7;

    return Array.from({ length: n }, (_, i) => {
      const seq = collatzSequence(i + 2);
      const path = Skia.Path.Make();

      let x = cx;
      let y = startY;
      let angle = -Math.PI / 2;
      path.moveTo(x, y);

      for (let j = 0; j < seq.length - 1 && j < 120; j++) {
        angle += seq[j] % 2 === 0 ? evenAngle : oddAngle;
        x += Math.cos(angle) * stepLen;
        y += Math.sin(angle) * stepLen;
        path.lineTo(x, y);
      }

      return { path, len: seq.length, hue: (i * 360) / n };
    });
  }, [n, width, height, preview]);

  return (
    <Canvas style={{ width, height }}>
      {branches.map((branch, i) => {
        const color = useDerivedValue(() => {
          return hslToHex(
            (branch.hue + hueShift.value) % 360,
            85,
            55 + breathe.value * 10
          );
        });
        const strokeWidth = useDerivedValue(() => {
          return (preview ? 1 : 1.8) + breathe.value * 0.4;
        });

        return (
          <SkiaPath
            key={i}
            path={branch.path}
            style="stroke"
            strokeWidth={strokeWidth}
            color={color}
            strokeCap="round"
            strokeJoin="round"
          >
            {!preview && <BlurMask blur={2} style="solid" />}
          </SkiaPath>
        );
      })}
    </Canvas>
  );
}
