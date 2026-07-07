// src/theme.ts
//
// Brand palette + viz generators. UI chrome uses semantic aliases below.

import { useColorScheme } from "react-native";
import { resolveVizColor } from "./visualizations/vizColorStore";

export const darkColors = {
  // Surfaces
  bg: "#07060E",
  bgElevated: "#0E0C18",
  bgCard: "#12101F",
  bgCardHover: "#18152A",
  surface: "#1A1729",
  surfacePressed: "#242035",
  surfaceLight: "#2A2545",

  // Text
  text: "#F3F0FF",
  textDim: "#9B94B8",
  // ≥4.5:1 (WCAG AA) on every dark surface up to surfaceLight
  textMuted: "#8680AA",

  // Brand & interaction
  primary: "#B44AFF",
  primaryDim: "rgba(180, 74, 255, 0.14)",
  primaryBorder: "rgba(180, 74, 255, 0.35)",
  accent: "#B44AFF",
  accentAlt: "#FF4A8D",
  interactive: "#C4B5FD",

  // Structure
  border: "#2E2948",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  focusRing: "rgba(180, 74, 255, 0.45)",

  // Legacy aliases (viz + gradual migration)
  neonCyan: "#56E8FF",
  neonGreen: "#39FF14",
  neonPink: "#FF10F0",
  neonOrange: "#FF6B2B",
  neonYellow: "#FFE62B",
};

export const lightColors = {
  bg: "#FFFFFF",
  bgElevated: "#F3F4F6",
  bgCard: "#FFFFFF",
  bgCardHover: "#F9FAFB",
  surface: "#F3F4F6",
  surfacePressed: "#E5E7EB",
  surfaceLight: "#E5E7EB",
  
  text: "#111827",
  textDim: "#4B5563",
  // ≥4.5:1 (WCAG AA) on white and light cards/surfaces
  textMuted: "#5C6678",
  
  primary: "#9333EA",
  primaryDim: "rgba(147, 51, 234, 0.1)",
  primaryBorder: "rgba(147, 51, 234, 0.3)",
  accent: "#9333EA",
  accentAlt: "#E11D48",
  interactive: "#6D28D9",
  
  border: "#E5E7EB",
  borderSubtle: "rgba(0, 0, 0, 0.06)",
  focusRing: "rgba(147, 51, 234, 0.45)",
  
  neonCyan: "#0891B2",
  neonGreen: "#16A34A",
  neonPink: "#DB2777",
  neonOrange: "#EA580C",
  neonYellow: "#CA8A04",
};

export type Colors = typeof darkColors;

export const colors = darkColors; // Fallback for outside React

export function useThemeColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightColors : darkColors;
}

export { palettes } from "./theme/palettes";

export function hslToHex(h: number, s: number, l: number): string {
  "worklet";
  // route through viz color settings; worklet copies refresh on remount
  // (VizPreview keys every viz by the color-settings version)
  const resolved = resolveVizColor(h);
  if (resolved.kind === "hex") return resolved.hex;
  h = resolved.hue;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function indexToRainbow(i: number, offset = 0, saturation = 85, lightness = 60): string {
  return hslToHex((i * 37 + offset) % 360, saturation, lightness);
}
