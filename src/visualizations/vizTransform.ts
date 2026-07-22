// src/visualizations/vizTransform.ts
//
// Committed zoom/pan for the active visualization, applied INSIDE the canvas
// (vector redraw) so zooming never blurs. ZoomableViz provides it; VizCanvas
// (native) and useWebCanvas (web) consume it. Everything outside a ZoomableViz
// (previews, wallpaper export) gets the identity default.

import { createContext, useContext } from "react";

export interface VizTransform {
  scale: number;
  tx: number;
  ty: number;
}

export const IDENTITY_VIZ_TRANSFORM: VizTransform = { scale: 1, tx: 0, ty: 0 };

export const VizTransformContext = createContext<VizTransform>(IDENTITY_VIZ_TRANSFORM);

export function useVizTransform(): VizTransform {
  return useContext(VizTransformContext);
}
