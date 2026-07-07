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

  it("returns empty fields when nothing matches", () => {
    expect(metadataFor("A999999", "Some inscrutable thing.").fields).toEqual([]);
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
});

describe("anumsByDifficulty", () => {
  it("every level has curated members", () => {
    for (const level of Object.keys(DIFFICULTY) as (keyof typeof DIFFICULTY)[]) {
      expect(anumsByDifficulty(level).length).toBeGreaterThanOrEqual(3);
    }
  });
});
