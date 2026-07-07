import { stripLatexDelimiters } from "../../../src/math/stripLatexDelimiters";

describe("stripLatexDelimiters", () => {
  it("removes inline delimiters", () => {
    expect(stripLatexDelimiters("term $a(n)$ here")).toBe("term a(n) here");
  });

  it("removes display delimiters", () => {
    expect(stripLatexDelimiters("block $$\\pi$$ end")).toBe("block \\pi end");
  });

  it("leaves plain text unchanged", () => {
    expect(stripLatexDelimiters("no math")).toBe("no math");
  });
});
