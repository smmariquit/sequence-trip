import {
  fibonacci,
  recaman,
  collatzLength,
  collatzSequence,
  pascalRow,
  primes,
} from "../../../src/sequences/generators";

describe("fibonacci", () => {
  it("starts with 0, 1", () => {
    expect(fibonacci(5)).toEqual([0, 1, 1, 2, 3]);
  });
});

describe("recaman", () => {
  it("matches known OEIS A005132 prefix", () => {
    expect(recaman(8)).toEqual([0, 1, 3, 6, 2, 7, 13, 20]);
  });
});

describe("collatzLength", () => {
  it("returns 0 for n=1", () => {
    expect(collatzLength(1)).toBe(0);
  });

  it("returns 3 for n=4", () => {
    expect(collatzLength(4)).toBe(2);
  });
});

describe("collatzSequence", () => {
  it("reaches 1", () => {
    const seq = collatzSequence(6);
    expect(seq[seq.length - 1]).toBe(1);
    expect(seq[0]).toBe(6);
  });
});

describe("pascalRow", () => {
  it("returns binomial row", () => {
    expect(pascalRow(4)).toEqual([1, 4, 6, 4, 1]);
  });
});

describe("primes", () => {
  it("lists first primes", () => {
    expect(primes(5)).toEqual([2, 3, 5, 7, 11]);
  });
});
