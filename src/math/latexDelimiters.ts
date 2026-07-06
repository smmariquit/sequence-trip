// src/math/latexDelimiters.ts

/** True when text contains at least one `$…$` or `$$…$$` math segment. */
export function containsLatexDelimiters(text: string): boolean {
  return /\$\$([^$]+)\$\$|\$([^$]+)\$/.test(text);
}
