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

// union of common keywords across the languages OEIS programs use
const KEYWORDS = new Set([
  // shared / python / pari
  "if", "else", "elif", "for", "while", "return", "def", "lambda", "in",
  "and", "or", "not", "print", "my", "local", "vector", "sum", "prod",
  // maple
  "proc", "end", "do", "od", "fi", "then", "seq", "add", "mul", "option",
  // mathematica
  "Table", "Length", "Sum", "Product", "Do", "If", "While", "Module",
  "Block", "Function", "Select", "Map", "Range", "Nest", "NestList",
  "First", "Last", "Rest", "Join", "Array", "Total", "Mod", "Floor",
]);

// (PARI) / (Python) / (Magma) ... line prefix
const LANG_TAG = /^\((?:[A-Za-z][A-Za-z0-9+ .#-]*)\)/;

// comment start per common syntax: \\ (PARI), # (Python/Maple), // (C-ish)
const COMMENT = /(\\\\|#|\/\/|\(\*)/;

const WORD_OR_NUM = /[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?/g;

function pushPlainWithWords(out: CodeToken[], text: string): void {
  let last = 0;
  WORD_OR_NUM.lastIndex = 0;
  for (let m = WORD_OR_NUM.exec(text); m; m = WORD_OR_NUM.exec(text)) {
    if (m.index > last) out.push({ type: "plain", text: text.slice(last, m.index) });
    const w = m[0];
    const type: TokenType = /^\d/.test(w) ? "num" : KEYWORDS.has(w) ? "kw" : "plain";
    out.push({ type, text: w });
    last = m.index + w.length;
  }
  if (last < text.length) out.push({ type: "plain", text: text.slice(last) });
}

/** Tokenize one line of OEIS program text. */
export function tokenizeLine(line: string): CodeToken[] {
  const out: CodeToken[] = [];
  let rest = line;

  const tag = rest.match(LANG_TAG);
  if (tag) {
    out.push({ type: "tag", text: tag[0] });
    rest = rest.slice(tag[0].length);
  }

  while (rest.length > 0) {
    // string literal
    const strStart = rest.indexOf('"');
    const comMatch = rest.match(COMMENT);
    const comStart = comMatch?.index ?? -1;

    if (comStart >= 0 && (strStart < 0 || comStart < strStart)) {
      pushPlainWithWords(out, rest.slice(0, comStart));
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
      pushPlainWithWords(out, rest.slice(0, strStart));
      const end = rest.indexOf('"', strStart + 1);
      const stop = end >= 0 ? end + 1 : rest.length;
      out.push({ type: "str", text: rest.slice(strStart, stop) });
      rest = rest.slice(stop);
      continue;
    }

    pushPlainWithWords(out, rest);
    break;
  }

  return out;
}

/** Tokenize a whole block, preserving line breaks as plain tokens. */
export function tokenizeCode(code: string): CodeToken[] {
  const out: CodeToken[] = [];
  const lines = code.split("\n");
  lines.forEach((line, i) => {
    out.push(...tokenizeLine(line));
    if (i < lines.length - 1) out.push({ type: "plain", text: "\n" });
  });
  return out;
}
