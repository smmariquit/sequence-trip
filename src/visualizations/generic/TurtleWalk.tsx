// src/visualizations/generic/TurtleWalk.tsx
//
// Turtle turns by term mod 4 each step — every sequence draws its own path.
// Full view: legend + turtle arrowhead + current-turn readout, matching web.

import React, { useMemo, useEffect } from "react";
import { Platform } from "react-native";
import {
  Canvas,
  Path as SkiaPath,
  BlurMask,
  Group,
  Skia,
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
import { useBuildAnimation } from "../../playback/useBuildAnimation";
import { makePolylinePath } from "../../playback/smoothPath";
import { layoutTurtle, TURN_LABELS } from "./turtleLayout";
import SkiaLabel from "../SkiaLabel";
import type { GenericVizProps } from "./types";

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const tickFont = matchFont({ fontFamily, fontSize: 11 });
const labelFont = matchFont({ fontFamily, fontSize: 13, fontWeight: "600" });

const LEGEND =
  "turn by a(n) mod 4:  0 = hard left · 1 = soft left · 2 = soft right · 3 = hard right";

function arrowPath(): ReturnType<typeof Skia.Path.Make> {
  const p = Skia.Path.Make();
  p.moveTo(9, 0);
  p.lineTo(-5, 5.5);
  p.lineTo(-5, -5.5);
  p.close();
  return p;
}

export default function TurtleWalk({ terms, width, height, preview }: GenericVizProps) {
  const speed = useAnimSpeed();
  const colors = useThemeColors();
  const { progressSV, step } = useBuildAnimation(terms.length, preview);
  const hueShift = useSharedValue(0);

  useEffect(() => {
    hueShift.value = withRepeat(
      withTiming(360, { duration: 9000 / Math.max(speed, 0.25), easing: Easing.linear }),
      -1,
      false
    );
  }, [speed]);

  const layout = useMemo(
    () => layoutTurtle(terms, width, height, !!preview),
    [terms, width, height, preview]
  );
  const { points, mods, headings } = layout;

  const path = useDerivedValue(() => makePolylinePath(points, progressSV.value));
  const color = useDerivedValue(() => hslToHex(hueShift.value % 360, 85, 58));
  const arrow = useMemo(() => arrowPath(), []);

  const i = Math.min(step, points.length - 1);
  const stepIdx = Math.max(Math.min(i - 1, mods.length - 1), 0);
  const head = points[i];
  const heading = headings[stepIdx] ?? 0;
  const m = mods[stepIdx];
  const headLabel = !preview && i > 0 ? `a(${stepIdx}) mod 4 = ${m}  →  ${TURN_LABELS[m]}` : "";
  const headLabelW = headLabel ? labelFont.measureText(headLabel).width : 0;

  return (
    <Canvas style={{ width, height }}>
      {!preview && (
        <SkiaLabel
          x={width / 2}
          y={18}
          text={LEGEND}
          font={tickFont}
          fg={colors.textMuted}
          bg={colors.bg}
          align="center"
        />
      )}
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={preview ? 1 : 2}
        color={color}
        strokeCap="round"
        strokeJoin="round"
      >
        {!preview && <BlurMask blur={2.5} style="solid" />}
      </SkiaPath>
      {!preview && head && (
        <>
          <Group
            origin={{ x: 0, y: 0 }}
            transform={[
              { translateX: head.x },
              { translateY: head.y },
              { rotate: heading },
            ]}
          >
            <SkiaPath path={arrow} color={color}>
              <BlurMask blur={4} style="solid" />
            </SkiaPath>
          </Group>
          {headLabel !== "" && (
            <SkiaLabel
              x={head.x + 14 + headLabelW > width ? head.x - 14 - headLabelW : head.x + 14}
              y={head.y - 16}
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
