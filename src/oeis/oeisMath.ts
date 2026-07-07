// src/oeis/oeisMath.ts
//
// Converts OEIS ASCII math notation to LaTeX for KaTeX rendering.
// Conservative on purpose: only lines that look like pure formulas get
// converted; anything with real prose stays plain text. A wrong "plain"
// is fine; a wrong conversion renders garbage.

/** Words allowed inside a formula line (function names, quantifiers). */
const FORMULA_WORDS = new Set([
  "a", "n", "k", "m", "i", "j", "x", "sum", "product", "prod", "binomial",
  "sqrt", "floor", "ceiling", "abs", "gcd", "lcm", "mod", "log", "log_2",
  "exp", "sin", "cos", "tan", "max", "min", "lim", "pi", "phi", "psi",
  "sigma", "mu", "tau", "omega", "infinity", "if", "for", "with", "where",
  "and", "or", "else", "otherwise", "even", "odd", "prime", "fibonacci",
  "catalan", "hypergeom", "numerator", "denominator", "digits",
]);

/** Strip OEIS attribution tails: ". - _Author Name_, Mon DD YYYY". */
function stripAttribution(line: string): { math: string; tail: string } {
  const m = line.match(/^(.*?)\s*(-\s*_[^_]+_.*)$/);
  if (m) return { math: m[1], tail: "" };
  return { math: line, tail: "" };
}

/** True when the text is only math-ish tokens — safe to typeset whole. */
function looksLikeFormula(text: string): boolean {
  if (!/[=<>~]/.test(text)) return false;
  const words = text.match(/[A-Za-z_][A-Za-z_0-9]*/g) ?? [];
  return words.every((w) => FORMULA_WORDS.has(w.toLowerCase()));
}

/** OEIS ASCII math → LaTeX. Only call on text that looksLikeFormula. */
export function oeisAsciiToLatex(text: string): string {
  let s = text.trim().replace(/\.$/, "");

  // Sum_{k=0..n} -> \sum_{k=0}^{n}   (same for Product)
  s = s.replace(
    /\b(Sum|Product)_\{([^{}=]+)=([^.{}]+)\.\.([^{}]+)\}/g,
    (_, op, v, lo, hi) => `\\${op === "Sum" ? "sum" : "prod"}_{${v}=${lo}}^{${hi}}`
  );
  // Sum_{k>=1} and other non-range subscripts
  s = s.replace(/\b(Sum|Product)_\{([^{}]+)\}/g, (_, op, sub) =>
    `\\${op === "Sum" ? "sum" : "prod"}_{${sub}}`
  );

  // simple-argument functions (no nested parens)
  s = s.replace(/\bbinomial\(([^(),]+),\s*([^()]+)\)/g, "\\binom{$1}{$2}");
  s = s.replace(/\bsqrt\(([^()]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/\bfloor\(([^()]+)\)/g, "\\lfloor $1 \\rfloor");
  s = s.replace(/\bceiling\(([^()]+)\)/g, "\\lceil $1 \\rceil");
  s = s.replace(/\babs\(([^()]+)\)/g, "\\left|$1\\right|");

  // operators & symbols
  s = s.replace(/<=/g, "\\le ").replace(/>=/g, "\\ge ").replace(/!=/g, "\\ne ");
  s = s.replace(/->/g, "\\to ");
  s = s.replace(/\*/g, "\\cdot ");
  s = s.replace(/\bmod\b/g, "\\bmod");
  s = s.replace(/\binfinity\b/gi, "\\infty");
  s = s.replace(/\bPi\b/g, "\\pi");
  s = s.replace(/\bphi\b/g, "\\varphi");

  // exponents with multi-char content: 2^(n-1) -> 2^{n-1}
  s = s.replace(/\^\(([^()]+)\)/g, "^{$1}");

  return s;
}

/** Render an OEIS entry line: LaTeX-wrapped when it is safely a formula,
 * the original text otherwise. */
export function formatOeisLine(line: string): { text: string; isMath: boolean } {
  const { math } = stripAttribution(line);
  if (!looksLikeFormula(math)) return { text: line, isMath: false };
  return { text: `$${oeisAsciiToLatex(math)}$`, isMath: true };
}
