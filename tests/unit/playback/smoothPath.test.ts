import { makePolylinePath } from "../../../src/playback/smoothPath";

describe("makePolylinePath", () => {
  it("is a worklet (runs in useDerivedValue on the UI thread)", () => {
    // Missing "worklet" directive crashes release builds on native the moment
    // a LinePlot/TurtleWalk/DigitFlow viz mounts.
    expect((makePolylinePath as any).__workletHash).toBeDefined();
  });

  it("returns empty path for no points", () => {
    const p = makePolylinePath([], 5);
    expect(p.moveTo).not.toHaveBeenCalled();
    expect(p.lineTo).not.toHaveBeenCalled();
  });

  it("builds partial path for fractional progress", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];
    const path = makePolylinePath(points, 1.5);
    expect(path.moveTo).toHaveBeenCalledWith(0, 0);
    expect(path.lineTo).toHaveBeenCalledWith(10, 0);
    expect(path.lineTo).toHaveBeenCalledWith(15, 5);
  });
});
