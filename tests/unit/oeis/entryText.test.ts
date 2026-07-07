import {
  extractAnums,
  formatAnum,
  normalizeAnum,
  parseKeywords,
  parseOeisLink,
  stripOeisMarkup,
} from "../../../src/oeis/entryText";

describe("oeis/entryText", () => {
  it("normalizes A-numbers", () => {
    expect(normalizeAnum("a5132")).toBe("A005132");
    expect(formatAnum(5132)).toBe("A005132");
  });

  it("parses keywords", () => {
    expect(parseKeywords("nonn,nice,hear")).toEqual(["nonn", "nice", "hear"]);
  });

  it("strips italics markup", () => {
    expect(stripOeisMarkup("By _N. J. A. Sloane_")).toBe("By N. J. A. Sloane");
  });

  it("parses HTML links", () => {
    const hit = parseOeisLink(
      'N. J. A. Sloane, <a href="/A005132/b005132.txt">The first 100000 terms</a>'
    );
    expect(hit.label).toBe("The first 100000 terms");
    expect(hit.url).toBe("https://oeis.org/A005132/b005132.txt");
  });

  it("extracts cross-reference A-numbers", () => {
    expect(extractAnums("Cf. A057165, A057166, A008336")).toEqual([
      "A057165",
      "A057166",
      "A008336",
    ]);
  });
});
