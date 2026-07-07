import { pickGenericViz, pickGenericVizInfo } from "../../../src/visualizations/generic/select";
import TurtleWalk from "../../../src/visualizations/generic/TurtleWalk";
import BarWaveform from "../../../src/visualizations/generic/BarWaveform";
import ModGrid from "../../../src/visualizations/generic/ModGrid";
import LinePlot from "../../../src/visualizations/generic/LinePlot";
import PhasePlane from "../../../src/visualizations/generic/PhasePlane";

describe("pickGenericViz", () => {
  it("picks BarWaveform for negative terms", () => {
    expect(pickGenericViz("A000001", ["1", "-1", "2"])).toBe(BarWaveform);
  });

  it("picks ModGrid for binary sequences", () => {
    expect(pickGenericViz("A007318", ["0", "1", "1", "0", "1"])).toBe(ModGrid);
  });

  it("is stable for the same anum", () => {
    const terms = ["1", "2", "4", "8", "16"];
    const a = pickGenericViz("A000079", terms);
    const b = pickGenericViz("A000079", terms);
    expect(a).toBe(b);
  });

  it("varies across anums for non-binary sequences", () => {
    const terms = ["1", "2", "3", "4", "5", "6"];
    const picks = new Set(
      ["A000001", "A000002", "A000003", "A000004"].map((a) =>
        pickGenericViz(a, terms)
      )
    );
    expect(picks.has(LinePlot)).toBe(true);
    expect(picks.has(PhasePlane)).toBe(true);
  });

  it("never draws a turtle walk when every turn is identical (polygon trap)", () => {
    // find an anum that hashes to TurtleWalk, then feed it mod-4-constant terms
    const varied = ["1", "2", "3", "5", "8", "13"];
    let turtleAnum = "";
    for (let i = 1; i < 50 && !turtleAnum; i++) {
      const anum = `A${String(i).padStart(6, "0")}`;
      if (pickGenericViz(anum, varied) === TurtleWalk) turtleAnum = anum;
    }
    expect(turtleAnum).not.toBe("");
    const constMod4 = ["4", "8", "16", "40", "104"]; // all ≡ 0 (mod 4)
    expect(pickGenericViz(turtleAnum, constMod4)).toBe(LinePlot);
  });

  it("returns a guide describing the picked encoding", () => {
    const info = pickGenericVizInfo("A000001", ["1", "-2", "3"]);
    expect(info.guide).toMatch(/negative/);
  });
});
