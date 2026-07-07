import { pickGenericViz } from "../../../src/visualizations/generic/select";
import BarWaveform from "../../../src/visualizations/generic/BarWaveform";
import ModGrid from "../../../src/visualizations/generic/ModGrid";
import LinePlot from "../../../src/visualizations/generic/LinePlot";

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
    const picks = new Set([
      pickGenericViz("A000001", terms),
      pickGenericViz("A000002", terms),
      pickGenericViz("A000003", terms),
    ]);
    expect(picks.has(LinePlot)).toBe(true);
  });
});
