import { normalize, termMod, allDigits, deltaLogs } from "../../../src/sequences/normalize";

describe("normalize", () => {
  it("computes stats for small integer terms", () => {
    const stats = normalize(["1", "1", "2", "3", "5"]);
    expect(stats.terms).toEqual(["1", "1", "2", "3", "5"]);
    expect(stats.hasNegative).toBe(false);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(5);
    expect(stats.logs.length).toBe(5);
  });

  it("flags negative sequences", () => {
    const stats = normalize(["3", "-1", "2"]);
    expect(stats.hasNegative).toBe(true);
  });

  it("filters non-integer garbage", () => {
    const stats = normalize(["1", "abc", "2"]);
    expect(stats.terms).toEqual(["1", "2"]);
  });

  it("handles very large terms via signed log", () => {
    const huge = "9".repeat(400);
    const stats = normalize([huge]);
    expect(Number.isFinite(stats.logs[0])).toBe(true);
    expect(stats.logs[0]).toBeGreaterThan(0);
  });

  it("auto-fits symlog threshold so offset sequences keep relative spread", () => {
    // 1e6..3e6: with a fixed threshold of 1 these compress into ~log10(3e6)-log10(1e6)
    // ≈ 0.48 of a 6.5 range; with C = 1e6 the spread dominates the range.
    const stats = normalize(["1000000", "2000000", "3000000"]);
    const range = stats.maxLog - stats.minLog;
    expect(stats.logs[0]).toBeCloseTo(Math.log10(2), 5); // log10(1 + 1e6/1e6)
    expect(range).toBeGreaterThan(0.2);
    expect(stats.maxLog).toBeLessThan(1); // not up at ~6.5 anymore
  });
});

describe("termMod", () => {
  it("matches Number mod for small terms", () => {
    expect(termMod("12345", 10)).toBe(5);
  });

  it("works on huge digit strings", () => {
    const huge = "1" + "0".repeat(100);
    expect(termMod(huge, 7)).toBe(Number(BigInt(huge) % 7n));
  });

  it("handles negative terms", () => {
    expect(termMod("-10", 3)).toBe((3 - (10 % 3)) % 3);
  });
});

describe("allDigits", () => {
  it("extracts digits and respects limit", () => {
    expect(allDigits(["12", "-34"], 5)).toEqual([1, 2, 3, 4]);
  });
});

describe("deltaLogs", () => {
  it("computes first differences in log space", () => {
    const d = deltaLogs(["1", "2", "4"]);
    expect(d.length).toBe(2);
    expect(d[0]).toBeGreaterThan(0);
    expect(d[1]).toBeGreaterThan(d[0]);
  });

  it("does not throw on scientific-notation terms from String(Number)", () => {
    // String(1.5e21) — how generated catalog terms arrive past 2^53
    const d = deltaLogs(["1.5005205362068963e+21", "2.4276480729346457e+21"]);
    expect(d).toHaveLength(1);
    expect(Number.isFinite(d[0])).toBe(true);
    expect(d[0]).toBeGreaterThan(0);
  });
});
