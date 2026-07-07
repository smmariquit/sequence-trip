// src/visualizations/generic/PhasePlane.tsx
//
// Phase plane: a(n+1) vs a(n) in symlog space (OEIS plot2 mode, shift 1).
// Permutations and chaotic walks show their structure here.
// Full view: labeled axes + current-pair readout, mirroring the web version.

import React, { useMemo, useEffect } from "react";
import { Platform } from "react-native";
import {
  Canvas,
  Path as SkiaPath,
  Circle,
  Line,
  Text as SkiaText,
  BlurMask,
  matchFont,
  vec,
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
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { makePolylinePath } from "../../playback/smoothPath";
import { normalize } from "../../sequences/normalize";
import { layoutPhasePlane } from "./phasePoints";
import { formatTermLabel } from "./linePlotLayout";
import SkiaLabel from "../SkiaLabel";
import type { GenericVizProps } from "./types";

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const tickFont = matchFont({ fontFamily, fontSize: 11 });
const labelFont = matchFont({ fontFamily, fontSize: 13, fontWeight: "600" });

export default function PhasePlane({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const layout = useMemo(
    () => layoutPhasePlane(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { points, pad } = layout;

  const { progressSV, step } = useBuildAnimation(Math.max(points.length - 1, 0), preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 10000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const path = useDerivedValue(() => makePolylinePath(points, progressSV.value));
  const strokeColor = useDerivedValue(() => hslToHex(hueShift.value % 360, 85, 60));
  const headIdx = Math.min(step, Math.max(points.length - 1, 0));
  const head = points[headIdx];
  const headLabel =
    !preview && head && terms[headIdx + 1] !== undefined
      ? `(a(${headIdx}), a(${headIdx + 1})) = (${formatTermLabel(stats.terms[headIdx])}, ${formatTermLabel(stats.terms[headIdx + 1])})`
      : "";
  const headLabelW = headLabel ? labelFont.measureText(headLabel).width : 0;

  const axisBottom = height - pad.bottom;
  const axisRight = width - pad.right;

  return (
    <Canvas style={{ width, height }}>
      {!preview && (
        <>
          <Line p1={vec(pad.left, axisBottom)} p2={vec(axisRight, axisBottom)} color={colors.textMuted} strokeWidth={1} />
          <Line p1={vec(pad.left, pad.top)} p2={vec(pad.left, axisBottom)} color={colors.textMuted} strokeWidth={1} />
          {layout.xTicks.map((t) => (
            <React.Fragment key={`x${t.pos}`}>
              <Line p1={vec(t.pos, axisBottom)} p2={vec(t.pos, axisBottom + 5)} color={colors.textMuted} strokeWidth={1} />
              <SkiaText
                x={t.pos - tickFont.measureText(t.label).width / 2}
                y={axisBottom + 18}
                text={t.label}
                font={tickFont}
                color={colors.textMuted}
              />
            </React.Fragment>
          ))}
          {layout.yTicks.map((t) => (
            <React.Fragment key={`y${t.pos}`}>
              <Line p1={vec(pad.left - 5, t.pos)} p2={vec(pad.left, t.pos)} color={colors.textMuted} strokeWidth={1} />
              <Line p1={vec(pad.left, t.pos)} p2={vec(axisRight, t.pos)} color={colors.textMuted} strokeWidth={1} opacity={0.15} />
              <SkiaText
                x={pad.left - 8 - tickFont.measureText(t.label).width}
                y={t.pos + 4}
                text={t.label}
                font={tickFont}
                color={colors.textMuted}
              />
            </React.Fragment>
          ))}
          <SkiaText
            x={axisRight - 4 - tickFont.measureText("a(n)").width}
            y={axisBottom - 8}
            text="a(n)"
            font={tickFont}
            color={colors.textMuted}
          />
          <SkiaText
            x={pad.left}
            y={pad.top - 4}
            text="a(n+1)"
            font={tickFont}
            color={colors.textMuted}
          />
        </>
      )}
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1 : 1.6}
        color={strokeColor}
        strokeJoin="round"
        strokeCap="round"
      >
        {!preview && <BlurMask blur={2.5} style="solid" />}
      </SkiaPath>
      {!preview && head && (
        <>
          <Circle cx={head.x} cy={head.y} r={4} color={hslToHex(0, 100, 70)} />
          {headLabel !== "" && (
            <SkiaLabel
              x={head.x + 10 + headLabelW > axisRight ? head.x - 10 - headLabelW : head.x + 10}
              y={head.y < pad.top + 32 ? head.y + 20 : head.y - 14}
              text={headLabel}
              font={labelFont}
              fg={colors.text}
              bg={colors.bg}
            />
          )}
        </>
      )}
    </Canvas>
  );
}
