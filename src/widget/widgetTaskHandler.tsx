// src/widget/widgetTaskHandler.tsx
//
// Headless task the OS calls to render/update the widget. Kept trivial: read
// the pre-written JSON snapshot and render. No sqlite, no Skia.

import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { SequenceWidget } from "./SequenceWidget";
import { readTodayPick } from "./snapshot";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const pick = await readTodayPick();
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(<SequenceWidget pick={pick} />);
      break;
    case "WIDGET_CLICK":
      // OPEN_URI is handled natively by the OS; nothing to do here.
      break;
    default:
      break;
  }
}
