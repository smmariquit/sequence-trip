// src/theme/tokens.ts
//
// Semantic design tokens — single source for spacing, radii, and UI chrome.

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const touch = {
  minHeight: 44,
  iconSize: 20,
  iconSizeSm: 18,
} as const;

export const typography = {
  label: { fontSize: 14, fontWeight: "600" as const },
  labelSm: { fontSize: 13, fontWeight: "600" as const },
  caption: { fontSize: 12, fontWeight: "500" as const },
} as const;
