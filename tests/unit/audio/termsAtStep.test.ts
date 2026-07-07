import { termsAtStep } from "../../../src/audio/termsAtStep";
import type { OEISSequence } from "../../../src/sequences/types";

describe("audio/termsAtStep", () => {
  const fib: OEISSequence = {
    anum: "A000045",
    name: "Fibonacci",
    vizType: "fibonacci-spiral",
  };

  it("returns null for step 0", () => {
    expect(termsAtStep(fib, 0)).toBeNull();
  });

  it("resolves generated terms for featured sequences", () => {
    const hit = termsAtStep(fib, 3);
    expect(hit?.term).toBe("1");
    expect(hit?.prevTerm).toBe("1");
  });

  it("uses sequence.terms when present", () => {
    const seq: OEISSequence = {
      anum: "A123456",
      name: "Test",
      terms: ["2", "4", "6"],
    };
    expect(termsAtStep(seq, 2)?.term).toBe("4");
  });
});
