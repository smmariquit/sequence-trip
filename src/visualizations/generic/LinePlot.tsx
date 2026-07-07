// src/visualizations/generic/LinePlot.tsx
//
// Polyline of signed-log values — works for any growth rate.
// Full view draws labeled axes + a head marker so the index→value
// mapping is legible, mirroring LinePlot.web.tsx.

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
import { layoutLinePlot, formatTermLabel } from "./linePlotLayout";
import SkiaLabel from "../SkiaLabel";
import type { GenericVizProps } from "./types";

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const tickFont = matchFont({ fontFamily, fontSize: 11 });
const labelFont = matchFont({ fontFamily, fontSize: 13, fontWeight: "600" });

export default function LinePlot({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const colors = useThemeColors();
  const stats = useMemo(() => normalize(terms), [terms]);
  const { progressSV, step } = useBuildAnimation(stats.logs.length, preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 8000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const layout = useMemo(
    () => layoutLinePlot(stats, width, height, !!preview),
    [stats, width, height, preview]
  );
  const { points: allPoints, pad } = layout;
  const dotStep = Math.max(1, Math.floor(allPoints.length / (preview ? 20 : 60)));

  const path = useDerivedValue(() => makePolylinePath(allPoints, progressSV.value));
  const strokeColor = useDerivedValue(() => hslToHex(hueShift.value % 360, 90, 60));
  const visible = step;
  const head = Math.min(visible, allPoints.length) - 1;
  const headLabel =
    head >= 0 ? `a(${head}) = ${formatTermLabel(stats.terms[head])}` : "";
  const headLabelW = labelFont.measureText(headLabel).width;

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
            x={axisRight - 4 - tickFont.measureText("n  (term index)").width}
            y={axisBottom - 8}
            text="n  (term index)"
            font={tickFont}
            color={colors.textMuted}
          />
          <SkiaText
            x={pad.left}
            y={pad.top - 4}
            text={layout.logScale ? "a(n)  (log scale)" : "a(n)"}
            font={tickFont}
            color={colors.textMuted}
          />
        </>
      )}
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1.2 : 2}
        color={strokeColor}
        strokeJoin="round"
      >
        {!preview && <BlurMask blur={3} style="solid" />}
      </SkiaPath>
      {allPoints
        .filter((_, i) => i < visible && i % dotStep === 0)
        .map((pt, i) => (
          <Circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={preview ? 1.5 : 3}
            color={hslToHex((i * dotStep * 360) / Math.max(allPoints.length, 1), 95, 65)}
          />
        ))}
      {!preview && head >= 0 && (
        <>
          <Circle cx={allPoints[head].x} cy={allPoints[head].y} r={6} color={strokeColor}>
            <BlurMask blur={6} style="solid" />
          </Circle>
          <SkiaLabel
            x={
              allPoints[head].x + 12 + headLabelW > axisRight
                ? allPoints[head].x - 12 - headLabelW
                : allPoints[head].x + 12
            }
            y={allPoints[head].y < pad.top + 32 ? allPoints[head].y + 24 : allPoints[head].y - 5}
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
