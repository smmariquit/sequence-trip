import { layoutLinePlot, formatTermLabel } from "../../../src/visualizations/generic/linePlotLayout";
import { normalize } from "../../../src/sequences/normalize";

describe("formatTermLabel", () => {
  it("keeps short terms exact", () => {
    expect(formatTermLabel("5")).toBe("5");
    expect(formatTermLabel("-429")).toBe("-429");
    expect(formatTermLabel("1234567")).toBe("1234567");
  });

  it("compacts huge terms to mantissa×10^k", () => {
    expect(formatTermLabel("123456789")).toBe("1.23×10^8");
    expect(formatTermLabel("-9876543210123")).toBe("-9.87×10^12");
  });
});

describe("layoutLinePlot", () => {
  const terms = Array.from({ length: 31 }, (_, i) => String(2 ** i));
  const stats = normalize(terms);

  it("full view: ticks present, labeled with real term values", () => {
    const l = layoutLinePlot(stats, 800, 600, false);
    expect(l.xTicks.length).toBeGreaterThanOrEqual(2);
    expect(l.xTicks[0].label).toBe("0");
    expect(l.xTicks[l.xTicks.length - 1].label).toBe("30");
    expect(l.yTicks.length).toBeGreaterThanOrEqual(2);
    // extremes labeled with actual terms, not log units
    const labels = l.yTicks.map((t) => t.label);
    expect(labels).toContain("1");
    expect(labels).toContain(formatTermLabel(String(2 ** 30)));
    expect(l.logScale).toBe(true);
  });

  it("preview: no ticks, tight padding", () => {
    const l = layoutLinePlot(stats, 300, 160, true);
    expect(l.xTicks).toHaveLength(0);
    expect(l.yTicks).toHaveLength(0);
    expect(l.pad.bottom).toBeLessThan(20);
  });

  it("bottom padding clears the caption overlay in full view", () => {
    const l = layoutLinePlot(stats, 800, 600, false);
    expect(l.pad.bottom).toBeGreaterThanOrEqual(56);
    const maxY = Math.max(...l.points.map((p) => p.y));
    expect(maxY).toBeLessThanOrEqual(600 - l.pad.bottom);
  });
});
