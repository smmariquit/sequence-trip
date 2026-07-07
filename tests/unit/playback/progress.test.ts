import { nextProgress, progressStep } from "../../../src/playback/progress";
import { STEP_MS } from "../../../src/playback/progressConstants";

describe("playback progress", () => {
  it("advances proportionally to elapsed time and speed", () => {
    const next = nextProgress(0, STEP_MS, 1, 10);
    expect(next).toBe(1);
  });

  it("doubles rate at 2x speed", () => {
    const next = nextProgress(0, STEP_MS, 2, 10);
    expect(next).toBe(2);
  });

  it("clamps at maxSteps", () => {
    expect(nextProgress(9, STEP_MS, 1, 10)).toBe(10);
    expect(nextProgress(9.5, STEP_MS, 4, 10)).toBe(10);
  });

  it("floors progress for caption step index", () => {
    expect(progressStep(3.9)).toBe(3);
    expect(progressStep(4)).toBe(4);
  });
});
