import {
  INFO_SECTIONS,
  WIKI_ARTICLES,
  getArticle,
  getInfoSection,
} from "../../../src/content/infoContent";

describe("infoContent", () => {
  it("defines the wiki articles", () => {
    expect(WIKI_ARTICLES.map((a) => a.id)).toEqual([
      "getting-started",
      "oeis-guide",
      "famous",
      "fibonacci",
      "catalan",
      "simple-mysteries",
      "digits-and-bases",
      "partitions",
      "primes",
      "seeing",
      "hearing",
      "deep-end",
      "app-manual",
    ]);
    for (const article of WIKI_ARTICLES) {
      expect(article.summary.length).toBeGreaterThan(10);
      expect(article.sections.length).toBeGreaterThan(0);
      expect(getArticle(article.id)).toBe(article);
    }
    // section ids stay unique across the whole wiki
    const ids = INFO_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps sequence chips pointing at valid A-numbers", () => {
    for (const section of INFO_SECTIONS) {
      for (const anum of section.anums ?? []) {
        expect(anum).toMatch(/^A\d{6}$/);
      }
    }
  });

  it("includes beginner-friendly sequence intro", () => {
    const seq = getInfoSection("sequences");
    expect(seq?.body?.some((p) => /Fibonacci/i.test(p))).toBe(true);
    expect(seq?.bullets?.some((b) => /a\(n\)/i.test(b))).toBe(true);
  });

  it("includes the research-backed Learn articles", () => {
    for (const id of [
      "fibonacci",
      "catalan",
      "simple-mysteries",
      "digits-and-bases",
      "partitions",
      "primes",
    ]) {
      const article = getArticle(id);
      expect(article?.sections).toHaveLength(4);
      expect(
        article?.sections.some(
          (section) => section.title === "In the real world",
        ),
      ).toBe(true);
      expect(
        article?.sections.some((section) => section.title === "An open door"),
      ).toBe(true);
      expect(article?.sections.some((section) => section.links?.length)).toBe(
        true,
      );
    }
  });

  it("explains OEIS for newcomers", () => {
    const oeis = getInfoSection("oeis");
    expect(oeis?.body?.some((p) => /A-number/i.test(p))).toBe(true);
    expect(
      oeis?.body?.some((p) =>
        /N\.?\s*J\.?\s*A\.?\s*Sloane|Neil J\. A\. Sloane/i.test(p),
      ),
    ).toBe(true);
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
