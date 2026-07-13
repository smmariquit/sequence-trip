export const MIN_VIZ_ZOOM = 1;
export const MAX_VIZ_ZOOM = 4;
export const VIZ_ZOOM_STEP = 0.5;

export function clampVizZoom(value: number): number {
  return Math.min(MAX_VIZ_ZOOM, Math.max(MIN_VIZ_ZOOM, value));
}

export function stepVizZoom(value: number, direction: -1 | 1): number {
  return clampVizZoom(value + direction * VIZ_ZOOM_STEP);
}

export function vizPanLimit(size: number, zoom: number): number {
  return Math.max(0, (size * (clampVizZoom(zoom) - 1)) / 2);
}
