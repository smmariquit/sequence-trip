// src/visualizations/generic/ModGrid.tsx
//
// Raster of term mod N — reveals residue patterns (Pascal-fractal generalized).

import React, { useMemo, useEffect } from "react";
import { Canvas, Rect, Group } from "@shopify/react-native-skia";
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
import { termMod } from "../../sequences/normalize";
import type { GenericVizProps } from "./types";

export default function ModGrid({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const breathe = useSharedValue(0.8);
  const { progressSV, step: visible } = useBuildAnimation(terms.length, preview);
  const fade = useItemFrac(progressSV, visible);
  const mod = 10;

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2500 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const cells = useMemo(() => {
    const n = terms.length;
    const cols = Math.ceil(Math.sqrt((n * width) / height));
    const cellW = width / cols;
    const rows = Math.ceil(n / cols);
    const cellH = height / Math.max(rows, 1);
    return terms.map((t, i) => ({
      x: (i % cols) * cellW,
      y: Math.floor(i / cols) * cellH,
      w: cellW - 1,
      h: cellH - 1,
      m: termMod(t, mod),
    }));
  }, [terms, width, height]);

  const opacity = useDerivedValue(() => breathe.value);

  return (
    <Canvas style={{ width, height }}>
      <Group opacity={opacity}>
        {cells.slice(0, visible).map((c, i) => (
          <Rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            color={c.m === 0 ? "rgba(40, 35, 70, 0.6)" : hslToHex((c.m * 360) / 10, 85, 55)}
          />
        ))}
        {cells[visible] && (
          <Group opacity={fade}>
            <Rect
              x={cells[visible].x}
              y={cells[visible].y}
              width={cells[visible].w}
              height={cells[visible].h}
              color={
                cells[visible].m === 0
                  ? "rgba(40, 35, 70, 0.6)"
                  : hslToHex((cells[visible].m * 360) / 10, 85, 55)
              }
            />
          </Group>
        )}
      </Group>
    </Canvas>
  );
}
