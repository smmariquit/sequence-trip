import { SPEEDS } from "../../../src/components/controlsConfig";

describe("controlsConfig", () => {
  it("exposes playback speed presets including a slow-study speed", () => {
    expect(SPEEDS).toEqual([0.25, 0.5, 1, 2, 4]);
    expect(SPEEDS).toContain(1); // default must exist
  });
});
