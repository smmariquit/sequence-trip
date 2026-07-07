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

    // Share sheet instead of a direct gallery write: no photo permission
    // (which would trigger a Google Play permissions declaration) and it
    // still offers "Save to Photos" / set-as-wallpaper on both platforms.
    const Sharing = await import("expo-sharing");
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Save or set your sequence wallpaper",
      });
    } else {
      Alert.alert("Saved", `Image ready at ${uri}`);
    }
  } catch (err) {
    Alert.alert("Could not export", "Something went wrong creating the image.");
    console.warn("export failed", err);
  } finally {
    setExporting(false);
  }
}
