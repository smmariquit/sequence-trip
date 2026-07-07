import { renderMixedLatex, escapeHtml } from "../../../src/math/renderMixedLatex";

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml("a < b & c")).toBe("a &lt; b &amp; c");
  });
});

describe("renderMixedLatex", () => {
  it("renders inline math segments", () => {
    const html = renderMixedLatex("Let $a(n) = 5$ hold.");
    expect(html).toContain('class="katex"');
    expect(html).toContain("Let ");
    expect(html).toContain(" hold.");
  });

  it("leaves plain text untouched", () => {
    expect(renderMixedLatex("no math here")).toBe("no math here");
  });

  it("renders pi", () => {
    const html = renderMixedLatex("$\\pi$");
    expect(html).toContain("katex");
  });
});
