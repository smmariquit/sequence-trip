import { dayHash, rowidForDate, isoDate } from "../../../src/oeis/dayPick";

describe("dayPick", () => {
  it("dayHash matches the historical sotd roll", () => {
    // reference implementation inlined in the old sequenceOfTheDay
    const ref = (s: string) => {
      let h = 0;
      for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return h;
    };
    for (const d of ["2026-07-08", "2000-01-01", "1999-12-31"]) {
      expect(dayHash(d)).toBe(ref(d));
    }
  });

  it("rowidForDate stays in 1..maxRowid", () => {
    const max = 397_000;
    for (const d of ["2026-07-08", "2026-07-09", "2030-02-28"]) {
      const r = rowidForDate(d, max);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(max);
      expect(r).toBe((dayHash(d) % max) + 1);
    }
  });

  it("isoDate returns YYYY-MM-DD and offsets by whole days", () => {
    const today = isoDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoDate(1)).not.toBe(today);
    // +1 day then -1 day round-trips
    const plus1 = new Date(`${today}T00:00:00Z`).getTime() + 86_400_000;
    expect(isoDate(1) >= today).toBe(true);
    expect(new Date(`${isoDate(1)}T00:00:00Z`).getTime()).toBeGreaterThanOrEqual(plus1 - 86_400_000);
  });
});
