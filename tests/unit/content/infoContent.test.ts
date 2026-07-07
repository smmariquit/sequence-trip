import { INFO_SECTIONS, getInfoSection } from "../../../src/content/infoContent";

describe("infoContent", () => {
  it("defines core sections", () => {
    const ids = INFO_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      "about",
      "sequences",
      "oeis",
      "help",
      "viz",
      "glossary",
      "offline",
      "credits",
      "source",
    ]);
  });

  it("includes beginner-friendly sequence intro", () => {
    const seq = getInfoSection("sequences");
    expect(seq?.body?.some((p) => /Fibonacci/i.test(p))).toBe(true);
    expect(seq?.bullets?.some((b) => /a\(n\)/i.test(b))).toBe(true);
  });

  it("explains OEIS for newcomers", () => {
    const oeis = getInfoSection("oeis");
    expect(oeis?.body?.some((p) => /A-number/i.test(p))).toBe(true);
    expect(oeis?.body?.some((p) => /N\.?\s*J\.?\s*A\.?\s*Sloane|Neil J\. A\. Sloane/i.test(p))).toBe(true);
    expect(oeis?.links?.some((l) => l.url.includes("oeis.org"))).toBe(true);
  });

  it("credits N. J. A. Sloane in credits section", () => {
    const credits = getInfoSection("credits");
    expect(credits?.body?.some((p) => /Sloane/i.test(p))).toBe(true);
    expect(credits?.links?.some((l) => /Sloane/i.test(l.label))).toBe(true);
  });

  it("includes help bullets", () => {
    const help = getInfoSection("help");
    expect(help?.bullets?.length).toBeGreaterThan(3);
    expect(help?.bullets?.some((b) => /Play/i.test(b))).toBe(true);
  });

  it("links OEIS in credits", () => {
    const credits = getInfoSection("credits");
    expect(credits?.links?.some((l) => l.url.includes("oeis.org"))).toBe(true);
  });
});
