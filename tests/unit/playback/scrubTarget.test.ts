import { scrubTarget } from "../../../src/playback/progress";

describe("scrubTarget", () => {
  const MAX = 63;

  it("starts the walk from idle-at-start instead of teleporting to the end", () => {
    // idle: step 0, progress snapped to maxSteps to render the finished viz
    expect(scrubTarget(MAX, 0, +1, MAX)).toBe(1);
    expect(scrubTarget(MAX, 0, -1, MAX)).toBe(MAX - 1);
  });

  it("lands on the adjacent term mid-segment without skipping", () => {
    expect(scrubTarget(3.6, 3, +1, MAX)).toBe(4); // not 5
    expect(scrubTarget(3.4, 3, -1, MAX)).toBe(3); // not 2
  });

  it("clamps to [1, maxSteps] when scrubbing", () => {
    expect(scrubTarget(1, 1, -1, MAX)).toBe(1); // never back to idle-0
    expect(scrubTarget(MAX, MAX, +1, MAX)).toBe(MAX);
  });
});
