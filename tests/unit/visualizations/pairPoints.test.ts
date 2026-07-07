import { pairPoints } from "../../../src/visualizations/pairPoints";

describe("pairPoints", () => {
  const A = ["1", "2", "4", "8"];
  const B = ["1", "3", "9", "27"];

  it("phase mode maps pairs into the padded box", () => {
    const pts = pairPoints(A, B, "phase", 100, 100, 10);
    expect(pts).toHaveLength(4);
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(10);
      expect(p.x).toBeLessThanOrEqual(90);
      expect(p.y).toBeGreaterThanOrEqual(10);
      expect(p.y).toBeLessThanOrEqual(90);
    }
  });

  it("ratio mode is monotone for diverging growth rates", () => {
    // a/b shrinks each step → plotted ratio strictly decreasing (y increases)
    const pts = pairPoints(A, B, "ratio", 100, 100, 10);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].y).toBeGreaterThan(pts[i - 1].y);
    }
  });

  it("truncates to the shorter sequence and handles empty", () => {
    expect(pairPoints(A, B.slice(0, 2), "phase", 100, 100, 10)).toHaveLength(2);
    expect(pairPoints([], B, "phase", 100, 100, 10)).toEqual([]);
  });
});
