import {
  MAX_VIZ_ZOOM,
  MIN_VIZ_ZOOM,
  clampVizZoom,
  stepVizZoom,
  vizPanLimit,
} from "../../../src/components/vizZoom";

describe("visualization zoom", () => {
  it("steps and clamps the zoom level", () => {
    expect(stepVizZoom(1, 1)).toBe(1.5);
    expect(stepVizZoom(MIN_VIZ_ZOOM, -1)).toBe(MIN_VIZ_ZOOM);
    expect(stepVizZoom(MAX_VIZ_ZOOM, 1)).toBe(MAX_VIZ_ZOOM);
    expect(clampVizZoom(2.25)).toBe(2.25);
  });

  it("limits panning to the scaled content bounds", () => {
    expect(vizPanLimit(400, 1)).toBe(0);
    expect(vizPanLimit(400, 2)).toBe(200);
  });
});
