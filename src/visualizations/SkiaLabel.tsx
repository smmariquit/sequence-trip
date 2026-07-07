// src/visualizations/SkiaLabel.tsx
//
// Skia text with a translucent dark pill behind it — readable over neon
// strokes. Native twin of drawBackedLabel in canvasAxes.ts.

import React from "react";
import { RoundedRect, Text as SkiaText, type SkFont } from "@shopify/react-native-skia";

export default function SkiaLabel({
  text,
  x,
  y,
  font,
  fg,
  bg,
  align = "left",
}: {
  text: string;
  /** anchor: left edge or center, vertical middle */
  x: number;
  y: number;
  font: SkFont;
  fg: string;
  bg: string;
  align?: "left" | "center";
}) {
  const w = font.measureText(text).width;
  const size = font.getSize();
  const padX = 5;
  const boxH = size + 8;
  const left = align === "center" ? x - w / 2 : x;

  return (
    <>
      <RoundedRect
        x={left - padX}
        y={y - boxH / 2}
        width={w + padX * 2}
        height={boxH}
        r={5}
        color={bg}
        opacity={0.78}
      />
      <SkiaText x={left} y={y + size * 0.36} text={text} font={font} color={fg} />
    </>
  );
}
