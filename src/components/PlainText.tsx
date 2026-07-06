// src/components/PlainText.tsx
//
// User-facing copy without LaTeX. OEIS names, titles, search results, live values.

import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

interface Props {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  testID?: string;
}

export default function PlainText({ children, style, numberOfLines, testID }: Props) {
  return (
    <Text style={style} numberOfLines={numberOfLines} testID={testID}>
      {children}
    </Text>
  );
}
