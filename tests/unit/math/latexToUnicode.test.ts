import { latexToUnicode } from "../../../src/math/latexToUnicode";

describe("latexToUnicode", () => {
  it("converts pi and strips delimiters", () => {
    expect(latexToUnicode("Digits of $\\pi$")).toBe("Digits of π");
  });

  it("converts powers and subscripts", () => {
    expect(latexToUnicode("$2^n$")).toBe("2ⁿ");
    expect(latexToUnicode("$a_n$")).toBe("aₙ");
    expect(latexToUnicode("$x^{10}$")).toBe("x¹⁰");
  });

  it("unwraps frac and sqrt", () => {
    expect(latexToUnicode("$\\frac{1}{2}$")).toBe("1/2");
    expect(latexToUnicode("$\\sqrt{2}$")).toBe("√(2)");
  });

  it("maps blackboard bold", () => {
    expect(latexToUnicode("$\\mathbb{Z}$")).toBe("ℤ");
  });

  it("leaves plain names alone", () => {
    expect(latexToUnicode("Fibonacci numbers")).toBe("Fibonacci numbers");
  });
});
