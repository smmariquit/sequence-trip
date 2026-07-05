// src/visualizations/PascalFractal.tsx

import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Rect,
  Group,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex } from "../theme";
import { usePlayback } from "../playback/PlaybackContext";

interface Props {
  width: number;
  height: number;
  count?: number;
  preview?: boolean;
}

function computePascalMod(rows: number, mod: number): number[][] {
  const tri: number[][] = [[1]];
  for (let r = 1; r < rows; r++) {
    const prev = tri[r - 1];
    const row = [1];
    for (let k = 1; k < r; k++) {
      row.push((prev[k - 1] + prev[k]) % mod);
    }
    row.push(1);
    tri.push(row);
  }
  return tri;
}

export default function PascalFractal({ width, height, count = 128, preview }: Props) {
  const { speed } = usePlayback();
  const rows = preview ? 64 : count;
  const mod = 2;

  const hueShift = useSharedValue(0);
  const brightness = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 7000 / speed, easing: Easing.linear }),
      -1,
      false
    );
    brightness.value = withRepeat(
      withTiming(1, { duration: 2500 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const cells = useMemo(() => {
    const tri = computePascalMod(rows, mod);
    const cellH = height / rows;
    const result: { x: number; y: number; w: number; h: number; row: number; col: number; val: number }[] = [];

    for (let r = 0; r < rows; r++) {
      const cellW = width / (r + 1);
      const offsetX = (width - cellW * tri[r].length) / 2;
      for (let c = 0; c < tri[r].length; c++) {
        if (tri[r][c] !== 0) {
          result.push({
            x: offsetX + c * cellW,
            y: r * cellH,
            w: cellW,
            h: cellH,
            row: r,
            col: c,
            val: tri[r][c],
          });
        }
      }
    }
    return result;
  }, [rows, mod, width, height]);

  return (
    <Canvas style={{ width, height }}>
      {cells.map((cell, i) => {
        const color = useDerivedValue(() => {
          const hue = (cell.row * 3.5 + cell.col * 7 + hueShift.value) % 360;
          const lit = 50 + brightness.value * 15;
          return hslToHex(hue, 90, lit);
        });

        return (
          <Rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cell.w}
            height={cell.h}
            color={color}
          />
        );
      })}
    </Canvas>
  );
}
