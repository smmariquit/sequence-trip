// src/oeis/codeTokens.ts
//
// Tiny line-based tokenizer for OEIS program sections (PARI, Python, Maple,
// Mathematica, ...). Good-enough highlighting without a parser dependency:
// language tags, comments, strings, numbers, common keywords.

export type TokenType = "plain" | "kw" | "num" | "str" | "com" | "tag";

export interface CodeToken {
  type: TokenType;
  text: string;
}

export type CodeLang = "pari" | "python" | "maple" | "mathematica" | "magma" | "other";

const LANG_KEYWORDS: Record<CodeLang, Set<string>> = {
  pari: new Set([
    "if", "else", "for", "forprime", "while", "return", "my", "local",
    "vector", "sum", "prod", "print", "until", "next", "break",
  ]),
  python: new Set([
    "if", "else", "elif", "for", "while", "return", "def", "lambda", "in",
    "and", "or", "not", "print", "yield", "import", "from", "range", "class",
  ]),
  maple: new Set([
    "proc", "end", "do", "od", "fi", "if", "then", "else", "elif", "for",
    "while", "return", "local", "option", "seq", "add", "mul", "map",
  ]),
  mathematica: new Set([
    "Table", "Length", "Sum", "Product", "Do", "If", "While", "Module",
    "Block", "Function", "Select", "Map", "Range", "Nest", "NestList",
    "First", "Last", "Rest", "Join", "Array", "Total", "Mod", "Floor",
    "CoefficientList", "Series", "LinearRecurrence", "Fibonacci", "Prime",
  ]),
  magma: new Set([
    "if", "then", "else", "for", "in", "return", "select", "function",
    "end", "while", "do", "Self",
  ]),
  // union fallback when the language is unknown
  other: new Set([
    "if", "else", "elif", "for", "while", "return", "def", "lambda", "in",
    "and", "or", "not", "print", "my", "local", "vector", "sum", "prod",
    "proc", "end", "do", "od", "fi", "then", "seq", "add", "mul", "option",
    "Table", "Length", "Sum", "Product", "Do", "If", "While", "Module",
    "Block", "Function", "Select", "Map", "Range", "Nest", "NestList",
    "First", "Last", "Rest", "Join", "Array", "Total", "Mod", "Floor",
  ]),
};

/** Map an OEIS language tag like "(PARI)" to a keyword set. */
export function langFromTag(tag: string): CodeLang {
  const t = tag.toLowerCase();
  if (t.includes("pari")) return "pari";
  if (t.includes("python") || t.includes("sage")) return "python";
  if (t.includes("magma")) return "magma";
  if (t.includes("maple")) return "maple";
  if (t.includes("mathematica") || t.includes("mma")) return "mathematica";
  return "other";
}

// (PARI) / (Python) / (Magma) ... line prefix
const LANG_TAG = /^\((?:[A-Za-z][A-Za-z0-9+ .#-]*)\)/;

// comment start per common syntax: \\ (PARI), # (Python/Maple), // (C-ish)
const COMMENT = /(\\\\|#|\/\/|\(\*)/;

const WORD_OR_NUM = /[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?/g;

function pushPlainWithWords(out: CodeToken[], text: string, kw: Set<string>): void {
  let last = 0;
  WORD_OR_NUM.lastIndex = 0;
  for (let m = WORD_OR_NUM.exec(text); m; m = WORD_OR_NUM.exec(text)) {
    if (m.index > last) out.push({ type: "plain", text: text.slice(last, m.index) });
    const w = m[0];
    const type: TokenType = /^\d/.test(w) ? "num" : kw.has(w) ? "kw" : "plain";
    out.push({ type, text: w });
    last = m.index + w.length;
  }
  if (last < text.length) out.push({ type: "plain", text: text.slice(last) });
}

/** Tokenize one line of OEIS program text. Highlights with the keyword set
 * of the given language; a "(Lang)" prefix on the line overrides it. */
export function tokenizeLine(line: string, lang: CodeLang = "other"): CodeToken[] {
  const out: CodeToken[] = [];
  let rest = line;

  const tag = rest.match(LANG_TAG);
  if (tag) {
    out.push({ type: "tag", text: tag[0] });
    rest = rest.slice(tag[0].length);
    lang = langFromTag(tag[0]);
  }
  const kw = LANG_KEYWORDS[lang];

  while (rest.length > 0) {
    // string literal
    const strStart = rest.indexOf('"');
    const comMatch = rest.match(COMMENT);
    const comStart = comMatch?.index ?? -1;

    if (comStart >= 0 && (strStart < 0 || comStart < strStart)) {
      pushPlainWithWords(out, rest.slice(0, comStart), kw);
      if (comMatch![1] === "(*") {
        const end = rest.indexOf("*)", comStart + 2);
        const stop = end >= 0 ? end + 2 : rest.length;
        out.push({ type: "com", text: rest.slice(comStart, stop) });
        rest = rest.slice(stop);
        continue;
      }
      out.push({ type: "com", text: rest.slice(comStart) });
      return out;
    }

    if (strStart >= 0) {
      pushPlainWithWords(out, rest.slice(0, strStart), kw);
      const end = rest.indexOf('"', strStart + 1);
      const stop = end >= 0 ? end + 1 : rest.length;
      out.push({ type: "str", text: rest.slice(strStart, stop) });
      rest = rest.slice(stop);
      continue;
    }

    pushPlainWithWords(out, rest, kw);
    break;
  }

  return out;
}

/** Tokenize a whole block, preserving line breaks. Language tags inside the
 * block switch the keyword set until the next tag. */
export function tokenizeCode(code: string, lang: CodeLang = "other"): CodeToken[] {
  const out: CodeToken[] = [];
  let current = lang;
  const lines = code.split("\n");
  lines.forEach((line, i) => {
    const tag = line.match(LANG_TAG);
    if (tag) current = langFromTag(tag[0]);
    out.push(...tokenizeLine(line, current));
    if (i < lines.length - 1) out.push({ type: "plain", text: "\n" });
  });
  return out;
}
