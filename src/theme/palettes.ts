// src/theme/palettes.ts
//
// Named viz palettes — separate module so vizColorStore can import them
// without a circular dependency on theme.ts.

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
