import { containsLatexDelimiters } from "../../../src/math/latexDelimiters";
import { renderMixedLatex } from "../../../src/math/renderMixedLatex";

describe("containsLatexDelimiters", () => {
  it("detects inline delimiters", () => {
    expect(containsLatexDelimiters("$a(n)$")).toBe(true);
  });

  it("rejects OEIS-style undelimited formulas", () => {
    expect(containsLatexDelimiters("a(n+1) = a(n)^2 - 3*n*a(n) + n^2")).toBe(false);
  });

  it("rejects plain prose", () => {
    expect(containsLatexDelimiters("Recamán's Sequence")).toBe(false);
  });
});

describe("renderMixedLatex strict mode", () => {
  it("does not emit katex for undelimited formulas", () => {
    const html = renderMixedLatex("a(n+1) = a(n)^2 - 3*n*a(n) + n^2, a(1) = 1.");
    expect(html).not.toContain("katex");
    expect(html).toContain("a(n+1)");
  });
});
