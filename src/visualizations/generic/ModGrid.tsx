// src/visualizations/generic/ModGrid.tsx
//
// Raster of term mod N — reveals residue patterns (Pascal-fractal generalized).
// Full view: reading-order legend + newest-cell outline, matching web.

import React, { useMemo, useEffect } from "react";
import { Platform } from "react-native";
import { Canvas, Rect, Group, matchFont } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { hslToHex, useThemeColors } from "../../theme";
import { useAnimSpeed } from "../../playback/PlaybackContext";
import { useBuildAnimation, useItemFrac } from "../../playback/useBuildAnimation";
import { layoutModGrid } from "./modGridLayout";
import { formatTermLabel } from "./linePlotLayout";
import SkiaLabel from "../SkiaLabel";
import type { GenericVizProps } from "./types";

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const tickFont = matchFont({ fontFamily, fontSize: 11 });
const labelFont = matchFont({ fontFamily, fontSize: 13, fontWeight: "600" });

const LEGEND = "one cell per term, reading left → right, row by row ↓ · color = a(n)";

function cellColor(m: number): string {
  return m === 0 ? "rgba(40, 35, 70, 0.6)" : hslToHex((m * 360) / 10, 85, 55);
}

export default function ModGrid({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const colors = useThemeColors();
  const breathe = useSharedValue(0.8);
  const { progressSV, step: visible } = useBuildAnimation(terms.length, preview);
  const fade = useItemFrac(progressSV, visible);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2500 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [speed]);

  const layout = useMemo(
    () => layoutModGrid(terms, width, height, !!preview),
    [terms, width, height, preview]
  );
  const { cells } = layout;

  const opacity = useDerivedValue(() => breathe.value);
  const headIdx = Math.min(visible, cells.length - 1);
  const head = !preview && headIdx >= 0 ? cells[headIdx] : null;
  const headLabel = head ? `a(${headIdx}) = ${formatTermLabel(terms[headIdx])}` : "";
  const headLabelW = headLabel ? labelFont.measureText(headLabel).width : 0;

  return (
    <Canvas style={{ width, height }}>
      {!preview && (
        <SkiaLabel
          x={width / 2}
          y={15}
          text={LEGEND}
          font={tickFont}
          fg={colors.textMuted}
          bg={colors.bg}
          align="center"
        />
      )}
      <Group opacity={opacity}>
        {cells.slice(0, visible).map((c, i) => (
          <Rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} color={cellColor(c.m)} />
        ))}
        {cells[visible] && (
          <Group opacity={fade}>
            <Rect
              x={cells[visible].x}
              y={cells[visible].y}
              width={cells[visible].w}
              height={cells[visible].h}
              color={cellColor(cells[visible].m)}
            />
          </Group>
        )}
      </Group>
      {head && (
        <>
          <Rect
            x={head.x - 1}
            y={head.y - 1}
            width={head.w + 2}
            height={head.h + 2}
            style="stroke"
            strokeWidth={2}
            color={colors.text}
          />
          <SkiaLabel
            x={head.x + head.w + 8 + headLabelW > width ? head.x - 8 - headLabelW : head.x + head.w + 8}
            y={head.y + head.h / 2}
            text={headLabel}
            font={labelFont}
            fg={colors.text}
            bg={colors.bg}
          />
        </>
      )}
    </Canvas>
  );
}
