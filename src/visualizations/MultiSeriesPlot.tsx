// src/visualizations/MultiSeriesPlot.tsx
//
// Static overlay of N sequences on a shared symlog scale, one colored
// polyline each. Series i gets the golden-angle hue so any count stays
// distinguishable. Legend renders outside the canvas (compare screen).

import React, { useMemo } from "react";
import { Path as SkiaPath } from "@shopify/react-native-skia";
import VizCanvas from "./VizCanvas";
import { hslToHex } from "../theme";
import { makePolylinePath } from "../playback/smoothPath";
import { multiSeriesLines } from "./pairPoints";

export function seriesColor(i: number): string {
  return hslToHex((i * 137.508) % 360, 82, 60);
}

interface Props {
  series: string[][];
  width: number;
  height: number;
}

export default function MultiSeriesPlot({ series, width, height }: Props) {
  const lines = useMemo(
    () => multiSeriesLines(series, width, height, 24),
    [series, width, height]
  );
  const paths = useMemo(
    () => lines.map((pts) => makePolylinePath(pts, Math.max(pts.length - 1, 0))),
    [lines]
  );

  return (
    <VizCanvas width={width} height={height}>
      {paths.map((path, i) => (
        <SkiaPath
          key={i}
          path={path}
          style="stroke"
          strokeWidth={2}
          color={seriesColor(i)}
          strokeJoin="round"
          strokeCap="round"
        />
      ))}
    </VizCanvas>
  );
}
