import {
  smoothstep,
  itemRevealAlpha,
  splitProgress,
  strokePolylineProgress,
} from "../../../src/playback/drawProgress";

describe("smoothstep", () => {
  it("is 0 at 0 and 1 at 1", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
  });

  it("clamps out-of-range values", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(2)).toBe(1);
  });
});

describe("itemRevealAlpha", () => {
  it("ramps from 0 to 1 across one index", () => {
    expect(itemRevealAlpha(2, 3)).toBe(0);
    expect(itemRevealAlpha(3, 3)).toBe(0);
    expect(itemRevealAlpha(3.5, 3)).toBeGreaterThan(0);
    expect(itemRevealAlpha(4, 3)).toBe(1);
  });
});

describe("splitProgress", () => {
  it("splits integer and fractional parts", () => {
    expect(splitProgress(3.75)).toEqual({ complete: 3, frac: 0.75 });
    expect(splitProgress(-2)).toEqual({ complete: 0, frac: 0 });
  });
});

describe("strokePolylineProgress", () => {
  it("draws partial segment at fractional progress", () => {
    const ctx = {
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    strokePolylineProgress(ctx, points, 1.5);

    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(15, 0);
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
