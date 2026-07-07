import { stripLatexDelimiters } from "../../../src/math/stripLatexDelimiters";

describe("stripLatexDelimiters", () => {
  it("removes inline math delimiters", () => {
    expect(stripLatexDelimiters("$a(n) = 5$")).toBe("a(n) = 5");
  });

  it("removes display math delimiters", () => {
    expect(stripLatexDelimiters("$$x^2$$")).toBe("x^2");
  });

  it("leaves plain text alone", () => {
    expect(stripLatexDelimiters("no math")).toBe("no math");
  });
});
