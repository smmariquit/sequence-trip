import {
  activeVizColors,
  clearPerSequenceOverride,
  DEFAULT_VIZ_COLORS,
  hasPerSequenceOverride,
  resolveVizColor,
  setActiveAnum,
  setVizColors,
  vizGlowEnabled,
} from "../../../src/visualizations/vizColorStore";
import { palettes } from "../../../src/theme/palettes";

afterEach(() => {
  setVizColors({ ...DEFAULT_VIZ_COLORS });
  setActiveAnum(null);
  clearPerSequenceOverride("A000045");
});

describe("resolveVizColor", () => {
  it("rainbow passes hue through with offset", () => {
    setVizColors({ paletteId: "rainbow", hueOffset: 90, glow: true, motion: true });
    expect(resolveVizColor(30)).toEqual({ kind: "hue", hue: 120 });
  });

  it("mono pins every hue to the accent", () => {
    setVizColors({ paletteId: "mono", hueOffset: 200, glow: true, motion: true });
    expect(resolveVizColor(0)).toEqual({ kind: "hue", hue: 200 });
    expect(resolveVizColor(300)).toEqual({ kind: "hue", hue: 200 });
  });

  it("stop palettes snap to their colors", () => {
    setVizColors({ paletteId: "ocean", hueOffset: 0, glow: true, motion: true });
    const r = resolveVizColor(0);
    expect(r.kind).toBe("hex");
    expect(palettes.ocean).toContain((r as { hex: string }).hex);
  });
});

describe("per-sequence override", () => {
  it("applies only when the sequence is active", () => {
    setVizColors({ paletteId: "acid", hueOffset: 0, glow: false, motion: true }, { anum: "A000045" });
    expect(activeVizColors().paletteId).toBe("rainbow"); // no active anum
    setActiveAnum("A000045");
    expect(activeVizColors().paletteId).toBe("acid");
    expect(vizGlowEnabled()).toBe(false);
    expect(hasPerSequenceOverride("A000045")).toBe(true);
    clearPerSequenceOverride("A000045");
    expect(activeVizColors().paletteId).toBe("rainbow");
  });
});
