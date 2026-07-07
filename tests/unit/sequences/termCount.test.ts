import {
  initialTermCount,
  maxTermCount,
  nextTermCount,
} from "../../../src/sequences/termCount";
import type { OEISSequence } from "../../../src/sequences/types";

describe("termCount", () => {
  it("nextTermCount bumps by ~50% capped at max", () => {
    expect(nextTermCount(64, 512)).toBe(96);
    expect(nextTermCount(400, 512)).toBe(512);
    expect(nextTermCount(2000, 2000)).toBe(2000);
  });

  it("initialTermCount uses viz defaults or bundled terms", () => {
    expect(
      initialTermCount({ anum: "A005132", name: "Recamán", vizType: "recaman-arcs" })
    ).toBe(64);
    expect(
      initialTermCount({
        anum: "A000001",
        name: "Test",
        terms: Array.from({ length: 20 }, (_, i) => String(i)),
      })
    ).toBe(20);
  });

  it("maxTermCount respects b-file availability", () => {
    const generic: OEISSequence = {
      anum: "A000001",
      name: "Test",
      terms: ["1", "2", "3"],
    };
    expect(maxTermCount(generic, false)).toBe(2000);
    expect(maxTermCount(generic, true)).toBe(3);
  });
});
