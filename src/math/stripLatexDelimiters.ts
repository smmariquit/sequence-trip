// src/math/stripLatexDelimiters.ts

import { containsLatexDelimiters } from "./latexDelimiters";

export { containsLatexDelimiters } from "./latexDelimiters";

export function stripLatexDelimiters(text: string): string {
  if (!containsLatexDelimiters(text)) return text;
  return text.replace(/\$\$([^$]+)\$\$/g, "$1").replace(/\$([^$]+)\$/g, "$1");
}
