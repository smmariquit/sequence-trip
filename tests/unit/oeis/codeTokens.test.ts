import { tokenizeLine, tokenizeCode } from "../../../src/oeis/codeTokens";

const types = (line: string) => tokenizeLine(line).map((t) => `${t.type}:${t.text}`);

describe("tokenizeLine", () => {
  it("tags the language prefix", () => {
    expect(types("(PARI) a(n)=n^2")[0]).toBe("tag:(PARI)");
  });

  it("highlights PARI comments", () => {
    const t = tokenizeLine("(PARI) f(n) \\\\ square it");
    expect(t[t.length - 1]).toEqual({ type: "com", text: "\\\\ square it" });
  });

  it("highlights Python keywords, numbers, strings, comments", () => {
    const t = types('(Python) def f(n): return n * 2  # doubles "x"');
    expect(t).toContain("kw:def");
    expect(t).toContain("kw:return");
    expect(t).toContain("num:2");
    expect(t.some((x) => x.startsWith("com:#"))).toBe(true);
  });

  it("highlights Mathematica (* comments *) inline", () => {
    const t = tokenizeLine("Table[n^2, {n, 10}] (* squares *) + 1");
    const com = t.find((x) => x.type === "com");
    expect(com?.text).toBe("(* squares *)");
    expect(t.map((x) => x.text).join("")).toBe("Table[n^2, {n, 10}] (* squares *) + 1");
    expect(t.find((x) => x.text === "Table")?.type).toBe("kw");
  });

  it("keeps strings intact", () => {
    const t = tokenizeLine('print("hello, for world")');
    expect(t.find((x) => x.type === "str")?.text).toBe('"hello, for world"');
    // 'for' inside the string is not a keyword token
    expect(t.filter((x) => x.type === "kw").map((x) => x.text)).toEqual(["print"]);
  });

  it("round-trips text exactly", () => {
    const line = '(Magma) [n le 2 select 1 else Self(n-1)+Self(n-2): n in [1..40]]; // fib';
    expect(tokenizeLine(line).map((t) => t.text).join("")).toBe(line);
  });
});

describe("tokenizeCode", () => {
  it("preserves line structure", () => {
    const code = "(PARI) a(n)=n\n\n(Python) def a(n): return n";
    expect(tokenizeCode(code).map((t) => t.text).join("")).toBe(code);
  });
});
