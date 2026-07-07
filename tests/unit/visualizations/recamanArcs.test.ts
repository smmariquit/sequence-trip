import { makeArcPath } from "../../../src/visualizations/RecamanArcs";

// Regression: below-axis arcs were drawn with the oval top at midY instead of
// centered on it, floating a full radius below the number line.
describe("makeArcPath", () => {
  const midY = 100;

  it("centers the oval on midY for above and below arcs", () => {
    for (const above of [true, false]) {
      const path = makeArcPath(2, 6, 10, 0, midY, above) as any;
      const [rect, startAngle, sweep] = path.addArc.mock.calls[0];
      const radius = ((6 - 2) * 10) / 2;
      expect(rect.y).toBe(midY - radius);
      expect(rect.height).toBe(radius * 2);
      expect(startAngle).toBe(above ? 180 : 0);
      expect(sweep).toBe(180);
    }
  });

  it("spans the oval horizontally between the two terms", () => {
    const path = makeArcPath(2, 6, 10, 4, midY, true) as any;
    const [rect] = path.addArc.mock.calls[0];
    expect(rect.x).toBe(2 * 10 + 4); // left endpoint
    expect(rect.width).toBe((6 - 2) * 10); // diameter
  });
});
