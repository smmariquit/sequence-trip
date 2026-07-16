// src/components/Logo.tsx
//
// Hand-drawn mark: flat steps on a number line, semicircle hop, rising term.
// Source SVG: assets/logo.svg

import React from "react";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";
import { useThemeColors } from "../theme";

interface Props {
  size?: number;
  /** Rounded square backdrop (app icon style). Off for inline UI marks. */
  showBackground?: boolean;
}

export default function Logo({ size = 48, showBackground = true }: Props) {
  const colors = useThemeColors();

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityRole="image"
      accessibilityLabel="Sequence Trip"
    >
      {showBackground ? (
        <Rect width="64" height="64" rx="14" fill={colors.bg} />
      ) : null}
      <G stroke={colors.surfaceLight} strokeWidth={1.5} strokeLinecap="round" opacity={0.85}>
        <Line x1="12" y1="48" x2="52" y2="48" />
        <Line x1="18" y1="48" x2="18" y2="51" />
        <Line x1="30" y1="48" x2="30" y2="51" />
        <Line x1="42" y1="48" x2="42" y2="51" />
      </G>
      <Path d="M18 48h12" stroke={colors.primary} strokeWidth={2.8} strokeLinecap="round" />
      <Path
        d="M30 48a6 6 0 0 1 12-6"
        stroke={colors.primary}
        strokeWidth={2.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M42 42l10-12" stroke={colors.accentAlt} strokeWidth={2.8} strokeLinecap="round" />
      <Circle cx="18" cy="48" r="3.2" fill={colors.neonCyan} />
      <Circle cx="30" cy="48" r="3.2" fill={colors.neonCyan} />
      <Circle cx="42" cy="42" r="3.6" fill={colors.primary} />
      <Circle cx="52" cy="30" r="4.2" fill={colors.accentAlt} />
    </Svg>
  );
}
