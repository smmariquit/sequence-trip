// src/components/MathText.tsx
//
// Native fallback: show source text with $ delimiters stripped.

import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { latexToUnicode } from "../math/latexToUnicode";

interface Props {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  inline?: boolean;
}

export default function MathText({ children, style, numberOfLines }: Props) {
  const plain = latexToUnicode(children);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {plain}
    </Text>
  );
}
