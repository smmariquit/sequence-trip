// src/math/latexToUnicode.ts
//
// Plain-text surfaces (notifications, widgets) cannot render KaTeX. Convert
// common OEIS LaTeX fragments to Unicode, then strip leftover commands.

import { stripLatexDelimiters } from "./stripLatexDelimiters";

const SYMBOLS: Record<string, string> = {
  pi: "π",
  phi: "φ",
  varphi: "φ",
  psi: "ψ",
  zeta: "ζ",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ε",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  sigma: "σ",
  tau: "τ",
  omega: "ω",
  Omega: "Ω",
  Sigma: "Σ",
  infty: "∞",
  pm: "±",
  mp: "∓",
  times: "×",
  cdot: "·",
  div: "÷",
  leq: "≤",
  geq: "≥",
  neq: "≠",
  approx: "≈",
  sim: "∼",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  leftrightarrow: "↔",
  ldots: "…",
  cdots: "⋯",
  mid: "∣",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  forall: "∀",
  exists: "∃",
  partial: "∂",
  nabla: "∇",
  ell: "ℓ",
};

const BB: Record<string, string> = {
  N: "ℕ",
  Z: "ℤ",
  Q: "ℚ",
  R: "ℝ",
  C: "ℂ",
};

const SUP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  n: "ⁿ",
  i: "ⁱ",
};

const SUB: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  n: "ₙ",
  i: "ᵢ",
  k: "ₖ",
  m: "ₘ",
  a: "ₐ",
};

function mapChars(raw: string, table: Record<string, string>): string {
  let out = "";
  for (const ch of raw) out += table[ch] ?? ch;
  return out;
}

/** OEIS name / caption → Unicode plain text for OS notification & widget. */
export function latexToUnicode(text: string): string {
  let s = stripLatexDelimiters(text);

  s = s.replace(/\\mathbb\{([NZQRC])\}/g, (_, ch: string) => BB[ch] ?? ch);
  s = s.replace(/\\mathrm\{([^}]*)\}/g, "$1");
  s = s.replace(/\\operatorname\{([^}]*)\}/g, "$1");
  s = s.replace(/\\text\{([^}]*)\}/g, "$1");
  s = s.replace(/\\textbf\{([^}]*)\}/g, "$1");

  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2");
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
  s = s.replace(/\\sqrt\s*([A-Za-z0-9])/g, "√$1");

  s = s.replace(/\^\{([^{}]+)\}/g, (_, body: string) => mapChars(body, SUP));
  s = s.replace(/\^([0-9n+\-i])/g, (_, ch: string) => SUP[ch] ?? `^${ch}`);
  s = s.replace(/_\{([^{}]+)\}/g, (_, body: string) => mapChars(body, SUB));
  s = s.replace(/_([0-9nikma+\-])/g, (_, ch: string) => SUB[ch] ?? `_${ch}`);

  s = s.replace(/\\([A-Za-z]+)/g, (_, name: string) => SYMBOLS[name] ?? "");

  s = s.replace(/[{}]/g, "");
  s = s.replace(/~/g, " ");
  s = s.replace(/\\,/g, " ");
  s = s.replace(/\\;/g, " ");
  s = s.replace(/\\ /g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
