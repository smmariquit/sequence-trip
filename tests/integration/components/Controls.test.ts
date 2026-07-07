import { SPEEDS } from "../../../src/components/controlsConfig";

describe("controlsConfig", () => {
  it("exposes playback speed presets", () => {
    expect(SPEEDS).toEqual([0.5, 1, 2, 4]);
  });
});
