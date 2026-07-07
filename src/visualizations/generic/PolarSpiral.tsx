// src/visualizations/generic/PolarSpiral.tsx
//
// Term i at golden angle, radius scaled by signed-log value. Slow rotation.
// Full view: labeled reference rings make the radius→value mapping visible.

import React, { useMemo, useEffect } from "react";
import { Platform } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
  Text as SkiaText,
  matchFont,
} from "@shopify/react-native-skia";
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
import { normalize } from "../../sequences/normalize";
import { layoutPolar } from "./polarLayout";
import { formatTermLabel } from "./linePlotLayout";
import SkiaLabel from "../SkiaLabel";
import type { GenericVizProps } from "./types";

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const tickFont = matchFont({ fontFamily, fontSize: 11 });
const labelFont = matchFont({ fontFamily, fontSize: 13, fontWeight: "600" });

export default function PolarSpiral({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressSV, step: visible } = useBuildAnimation(stats.logs.length, preview);
  const fade = useItemFrac(progressSV, visible);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 24000 / speed, easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const layout = useMemo(
    () => layoutPolar(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { cx, cy, points, rings } = layout;

  const transform = useDerivedValue(() => [{ rotate: rotation.value }]);

  const headIdx = Math.min(visible, points.length - 1);
  const headLabel =
    !preview && headIdx >= 0 ? `a(${headIdx}) = ${formatTermLabel(stats.terms[headIdx])}` : "";

  return (
    <Canvas style={{ width, height }}>
      {!preview && (
        <>
          {rings.map((ring, i) => (
            <React.Fragment key={i}>
              <Circle
                cx={cx}
                cy={cy}
                r={ring.r}
                style="stroke"
                strokeWidth={1}
                color={colors.textMuted}
                opacity={0.35}
              />
              <SkiaText
                x={cx + ring.r + 5}
                y={cy + 4}
                text={`a = ${ring.label}`}
                font={tickFont}
                color={colors.textMuted}
              />
            </React.Fragment>
          ))}
          <SkiaText
            x={cx - tickFont.measureText("each dot turns 137.5° from the last · farther out = bigger value").width / 2}
            y={14}
            text="each dot turns 137.5° from the last · farther out = bigger value"
            font={tickFont}
            color={colors.textMuted}
            opacity={0.7}
          />
          {headLabel !== "" && (
            <SkiaLabel
              x={12}
              y={height - 72}
              text={headLabel}
              font={labelFont}
              fg={colors.text}
              bg={colors.bg}
            />
          )}
        </>
      )}
      <Group origin={{ x: cx, y: cy }} transform={transform}>
        {points.slice(0, visible).map((pt, i) => (
          <Circle
            key={i}
            cx={cx + pt.r * Math.cos(pt.angle)}
            cy={cy + pt.r * Math.sin(pt.angle)}
            r={pt.size}
            color={hslToHex(pt.hue, 95, 62)}
          >
            {!preview && <BlurMask blur={3} style="solid" />}
          </Circle>
        ))}
        {points[visible] && (
          <Group opacity={fade}>
            <Circle
              cx={cx + points[visible].r * Math.cos(points[visible].angle)}
              cy={cy + points[visible].r * Math.sin(points[visible].angle)}
              r={points[visible].size}
              color={hslToHex(points[visible].hue, 95, 62)}
            >
              {!preview && <BlurMask blur={3} style="solid" />}
            </Circle>
          </Group>
        )}
      </Group>
    </Canvas>
  );
}
