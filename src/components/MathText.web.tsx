// src/components/MathText.web.tsx

import React, { useMemo } from "react";
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from "react-native";
import "katex/dist/katex.min.css";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import { renderMixedLatex } from "../math/renderMixedLatex";
import { colors } from "../theme";

interface Props {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  inline?: boolean;
}

export default function MathText({ children, style, numberOfLines, inline }: Props) {
  const hasLatex = containsLatexDelimiters(children);
  const html = useMemo(
    () => (hasLatex ? renderMixedLatex(children) : null),
    [children, hasLatex]
  );
  const css = StyleSheet.flatten(style) ?? {};

  const clampStyle: React.CSSProperties | undefined =
    numberOfLines != null
      ? {
          display: "-webkit-box",
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : undefined;

  return (
    <span
      className="math-text"
      style={{
        color: (css.color as string) ?? colors.text,
        fontSize: css.fontSize,
        fontWeight: css.fontWeight as React.CSSProperties["fontWeight"],
        lineHeight: css.lineHeight ? `${css.lineHeight}px` : undefined,
        marginBottom: typeof css.marginBottom === "number" ? css.marginBottom : undefined,
        display: numberOfLines != null ? undefined : inline ? "inline" : "block",
        ...clampStyle,
      }}
      {...(hasLatex
        ? { dangerouslySetInnerHTML: { __html: html! } }
        : { children })}
    />
  );
}
