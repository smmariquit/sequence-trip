import {
  metadataFor,
  fieldsFromName,
  anumsByDifficulty,
  MATH_FIELDS,
  DIFFICULTY,
} from "../../../src/sequences/metadata";

describe("metadataFor", () => {
  it("returns curated metadata for well-known sequences", () => {
    const fib = metadataFor("A000045");
    expect(fib.difficulty).toBe("beginner");
    expect(fib.fields).toContain("combinatorics");
  });

  it("falls back to name heuristic without difficulty", () => {
    const meta = metadataFor("A999999", "Number of primes dividing n.");
    expect(meta.fields).toContain("number-theory");
    expect(meta.difficulty).toBeUndefined();
  });

  it("always assigns at least one field so the filter never hides everything", () => {
    // bare recurrence names match no keyword; must still get a default tag
    expect(metadataFor("A999999", "a(n) = a(n-1) + a(n-2).").fields.length).toBeGreaterThan(0);
    expect(metadataFor("A999999", "Some inscrutable thing.").fields.length).toBeGreaterThan(0);
  });
});

describe("fieldsFromName", () => {
  it("caps at two fields", () => {
    const f = fieldsFromName("Primes counted by binomial lattice polynomial randomness");
    expect(f.length).toBeLessThanOrEqual(2);
  });

  it("every rule maps to a defined field", () => {
    for (const id of fieldsFromName("prime partition triangle decimal expansion")) {
      expect(MATH_FIELDS[id]).toBeDefined();
    }
  });

  it("tags the common OEIS naming conventions", () => {
    expect(fieldsFromName("Number of partitions of n.")).toContain("combinatorics");
    expect(fieldsFromName("Numbers k such that k^2 + 1 is prime.")).toContain("number-theory");
    expect(fieldsFromName("Decimal expansion of Pi.")).toContain("analysis");
    expect(fieldsFromName("Coordination sequence for the square lattice.")).toContain("geometry");
    expect(fieldsFromName("Coefficients of the generating function.")).toContain("algebra");
  });
});

describe("anumsByDifficulty", () => {
  it("every level has curated members", () => {
    for (const level of Object.keys(DIFFICULTY) as (keyof typeof DIFFICULTY)[]) {
      expect(anumsByDifficulty(level).length).toBeGreaterThanOrEqual(3);
    }
  });
});
