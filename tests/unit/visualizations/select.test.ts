import {
  pickGenericViz,
  pickGenericVizInfo,
  rankGenericViz,
} from "../../../src/visualizations/generic/select";
import TurtleWalk from "../../../src/visualizations/generic/TurtleWalk";
import BarWaveform from "../../../src/visualizations/generic/BarWaveform";
import ModGrid from "../../../src/visualizations/generic/ModGrid";
import LinePlot from "../../../src/visualizations/generic/LinePlot";
import PhasePlane from "../../../src/visualizations/generic/PhasePlane";

describe("rankGenericViz heuristics", () => {
  it("defaults to BarWaveform for signed data", () => {
    expect(pickGenericViz(["1", "-1", "2"])).toBe(BarWaveform);
  });

  it("defaults to ModGrid for binary sequences", () => {
    expect(pickGenericViz(["0", "1", "1", "0", "1"])).toBe(ModGrid);
  });

  it("defaults to LinePlot for monotone growth", () => {
    expect(pickGenericViz(["1", "2", "4", "8", "16", "32"])).toBe(LinePlot);
  });

  it("defaults to TurtleWalk for bounded small-range data", () => {
    // digits-like: bounded, few distinct values, non-monotone
    expect(pickGenericViz(["3", "1", "4", "1", "5", "9", "2", "6"])).toBe(TurtleWalk);
  });

  it("defaults to PhasePlane for oscillating wide-range data", () => {
    const terms = ["1", "1000", "3", "999999", "7", "123456789", "2"];
    expect(pickGenericViz(terms)).toBe(PhasePlane);
  });

  it("is deterministic for the same terms", () => {
    const terms = ["1", "2", "4", "8", "16"];
    expect(pickGenericViz(terms)).toBe(pickGenericViz(terms));
  });

  it("never offers a turtle walk when every turn is identical (polygon trap)", () => {
    const constMod4 = ["4", "8", "16", "40", "104"]; // all ≡ 0 (mod 4)
    const keys = rankGenericViz(constMod4).map((c) => c.key);
    expect(keys).not.toContain("turtle");
  });

  it("only offers a color grid for small-range data", () => {
    const wide = ["1", "50", "5000", "123456789"];
    expect(rankGenericViz(wide).map((c) => c.key)).not.toContain("grid");
  });

  it("always offers at least two choices with labels and guides", () => {
    const ranked = rankGenericViz(["1", "2", "3"]);
    expect(ranked.length).toBeGreaterThanOrEqual(2);
    for (const c of ranked) {
      expect(c.label).toBeTruthy();
      expect(c.guide).toBeTruthy();
    }
  });

  it("returns a guide describing the picked encoding", () => {
    expect(pickGenericVizInfo(["1", "-2", "3"]).guide).toMatch(/negative/);
  });

  it("judges only the stable 48-term prefix so load-more can't flip the viz", () => {
    const prefix = Array.from({ length: 48 }, (_, i) => String(i + 1)); // monotone
    const before = pickGenericViz(prefix);
    const after = pickGenericViz([...prefix, "1"]); // term 49 breaks monotonicity
    expect(after).toBe(before);
    expect(before).toBe(LinePlot);
  });
});
