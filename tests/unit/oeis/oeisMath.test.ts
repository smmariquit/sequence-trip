import { formatOeisLine, oeisAsciiToLatex } from "../../../src/oeis/oeisMath";

describe("oeisAsciiToLatex", () => {
  it("converts Sum ranges", () => {
    expect(oeisAsciiToLatex("a(n) = Sum_{k=0..n-1} a(k)")).toBe(
      "a(n) = \\sum_{k=0}^{n-1} a(k)"
    );
  });

  it("converts binomial and sqrt", () => {
    expect(oeisAsciiToLatex("a(n) = binomial(2n, n)/(n+1)")).toContain("\\binom{2n}{n}");
    expect(oeisAsciiToLatex("sqrt(5)")).toBe("\\sqrt{5}");
  });

  it("converts operators", () => {
    const s = oeisAsciiToLatex("a(n) <= 2^(n-1) * Pi");
    expect(s).toContain("\\le");
    expect(s).toContain("^{n-1}");
    expect(s).toContain("\\cdot");
    expect(s).toContain("\\pi");
  });
});

describe("formatOeisLine", () => {
  it("wraps pure formulas in math delimiters", () => {
    const r = formatOeisLine("a(n) = a(n-1) + a(n-2).");
    expect(r.isMath).toBe(true);
    expect(r.text.startsWith("$")).toBe(true);
  });

  it("leaves prose lines alone", () => {
    const r = formatOeisLine("Also the number of ways to arrange non-crossing chords.");
    expect(r.isMath).toBe(false);
    expect(r.text).toContain("non-crossing");
  });

  it("does not mathify lines with unknown function words", () => {
    const r = formatOeisLine("a(n) = weird_thing(n) unless frobnicated.");
    expect(r.isMath).toBe(false);
  });

  it("strips year-bearing citations and Sum_ subscripts before judging", () => {
    const r = formatOeisLine(
      "Pi = 4*Sum_{k>=0} (-1)^k/(2*k+1) [Madhava-Gregory-Leibniz, 1450-1671]."
    );
    expect(r.isMath).toBe(true);
    expect(r.text).not.toContain("Madhava");
  });

  it("mathifies arctan formulas", () => {
    expect(formatOeisLine("Pi/4 = 4*arctan(1/5) - arctan(1/239). [Machin, 1706]").isMath).toBe(true);
  });
});

describe("typesetInlineFragments", () => {
  it("typesets parenthesized formula fragments inside prose", () => {
    const { typesetInlineFragments } = require("../../../src/oeis/oeisMath");
    const r = typesetInlineFragments("A002388 (Pi^2), A019692 (2*Pi=tau).");
    expect(r.hasMath).toBe(true);
    expect(r.text).toContain("$");
    expect(r.text).toContain("A002388");
  });

  it("leaves plain parentheticals alone", () => {
    const { typesetInlineFragments } = require("../../../src/oeis/oeisMath");
    const r = typesetInlineFragments("Cf. A001203 (continued fraction).");
    expect(r.hasMath).toBe(false);
    expect(r.text).toBe("Cf. A001203 (continued fraction).");
  });
});
