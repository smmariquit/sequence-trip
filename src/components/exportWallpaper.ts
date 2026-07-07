// src/components/exportWallpaper.ts
//
// Save the current visualization as a wallpaper image. Native captures an
// offscreen full-resolution render (view-shot); web downloads the on-screen
// canvas.

import React from "react";
import { Alert, Platform, type View } from "react-native";
import { currentWebCanvas } from "../visualizations/useWebCanvas";

export const WALLPAPER_W = 1080;
export const WALLPAPER_H = 2340;

function exportWeb(): void {
  const el = currentWebCanvas;
  if (!el) return;
  // ponytail: web downloads the on-screen canvas at its render size, not
  // 1080x2340. Add an offscreen upscale only if wallpaper resolution matters.
  el.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sequence-wallpaper.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

/**
 * @param shotRef  ref to the offscreen capture View (native)
 * @param setExporting  mounts/unmounts the offscreen render
 */
export async function exportWallpaper(
  shotRef: React.RefObject<View | null>,
  setExporting: (on: boolean) => void
): Promise<void> {
  if (Platform.OS === "web") {
    exportWeb();
    return;
  }
  try {
    const MediaLibrary = await import("expo-media-library");
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to save the wallpaper.");
      return;
    }

    setExporting(true);
    // let Skia render a frame into the offscreen view before capturing
    await new Promise((r) => setTimeout(r, 600));

    const { captureRef } = await import("react-native-view-shot");
    const uri = await captureRef(shotRef, {
      format: "png",
      quality: 1,
      width: WALLPAPER_W,
      height: WALLPAPER_H,
    });
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Saved", "Wallpaper saved to your gallery.");
  } catch (err) {
    Alert.alert("Could not save", "Something went wrong exporting the image.");
    console.warn("export failed", err);
  } finally {
    setExporting(false);
  }
}
