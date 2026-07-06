// src/theme/layout.ts

import { Platform } from "react-native";

export const PAGE_PADDING = 20;
export const MAX_PAGE_WIDTH = 1280;
export const MAX_INFO_WIDTH = 720;
export const MAX_CARD_PAGE_WIDTH = 1120;

export type SafeAreaVariant = "home" | "info" | "controls";

export function safeAreaTop(variant: SafeAreaVariant): number {
  switch (variant) {
    case "home":
      return Platform.OS === "web" ? 40 : Platform.OS === "ios" ? 70 : 50;
    case "info":
      return Platform.OS === "web" ? 24 : Platform.OS === "ios" ? 56 : 40;
    case "controls":
      return Platform.OS === "web" ? 12 : Platform.OS === "ios" ? 56 : 40;
  }
}

export function safeAreaBottomCaption(): number {
  return Platform.OS === "ios" ? 24 : Platform.OS === "web" ? 14 : 16;
}

/** Extra scroll padding so tab screens clear the bottom tab bar. */
export function tabBarScrollPadding(): number {
  switch (Platform.OS) {
    case "ios":
      return 88;
    case "android":
      return 76;
    default:
      return 72;
  }
}

export function webContentColumn(maxWidth: number) {
  return Platform.OS === "web"
    ? ({ maxWidth, alignSelf: "center" as const, width: "100%" as const })
    : null;
}
