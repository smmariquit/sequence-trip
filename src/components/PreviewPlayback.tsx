// src/components/PreviewPlayback.tsx
//
// Isolated playback context for card thumbnails (avoids shared step state + speed errors).

import React from "react";
import { PlaybackProvider } from "../playback/PlaybackContext";

export default function PreviewPlayback({ children }: { children: React.ReactNode }) {
  return <PlaybackProvider>{children}</PlaybackProvider>;
}
