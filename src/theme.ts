// src/theme.ts

export const colors = {
  bg: "#07060E",
  bgCard: "#110F1B",
  bgCardHover: "#1A1726",
  surface: "#16132A",
  surfaceLight: "#221E3A",
  text: "#F0ECFF",
  textDim: "#8A84A6",
  textMuted: "#5C5677",
  accent: "#B44AFF",
  accentAlt: "#FF4A8D",
  neonCyan: "#00F5FF",
  neonGreen: "#39FF14",
  neonPink: "#FF10F0",
  neonOrange: "#FF6B2B",
  neonYellow: "#FFE62B",
  border: "#2A2545",
};

export const palettes = {
  rainbow: [
    "#FF0040", "#FF4000", "#FF8000", "#FFC000",
    "#FFFF00", "#80FF00", "#00FF40", "#00FFB0",
    "#00FFFF", "#0080FF", "#4000FF", "#8000FF",
    "#FF00FF", "#FF0080",
  ],
  neon: [
    "#FF10F0", "#B44AFF", "#4A6AFF", "#00F5FF",
    "#39FF14", "#FFE62B", "#FF6B2B", "#FF4A8D",
  ],
  acid: [
    "#00FF00", "#39FF14", "#7FFF00", "#ADFF2F",
    "#DFFF00", "#FFE62B", "#FF6B2B", "#FF0040",
  ],
  ocean: [
    "#001B48", "#003B73", "#0074B7", "#00A8CC",
    "#00F5FF", "#7FECFF", "#C4F5FC", "#00FFCC",
  ],
  plasma: [
    "#0D0887", "#46039F", "#7201A8", "#9C179E",
    "#BD3786", "#D8576B", "#ED7953", "#FB9F3A",
    "#FDCA26", "#F0F921",
  ],
};

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
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
