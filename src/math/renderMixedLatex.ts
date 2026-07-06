// src/math/renderMixedLatex.ts

import katex from "katex";
import { containsLatexDelimiters } from "./latexDelimiters";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderMixedLatex(text: string): string {
  if (!containsLatexDelimiters(text)) {
    return escapeHtml(text);
  }

  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let lastIndex = 0;
  let html = "";
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    html += escapeHtml(text.slice(lastIndex, match.index));
    const latex = match[1] ?? match[2];
    const displayMode = match[1] !== undefined;
    html += katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: "html",
    });
    lastIndex = match.index + match[0].length;
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}
