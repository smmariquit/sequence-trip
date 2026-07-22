// src/components/SequenceName.tsx
//
// Sequence name with in-line math: tokens like Product_{m>=1} or (1-x^m)^24
// typeset via KaTeX (web) / unicode fallback (native); prose stays prose.

import React from "react";
import type { StyleProp, TextStyle } from "react-native";
import { typesetNameFragments } from "../oeis/oeisMath";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import MathText from "./MathText";
import PlainText from "./PlainText";

interface Props {
  name: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function SequenceName({ name, style, numberOfLines }: Props) {
  const frag = React.useMemo(() => typesetNameFragments(name), [name]);
  if (containsLatexDelimiters(name)) {
    return (
      <MathText style={style} numberOfLines={numberOfLines} inline>
        {name}
      </MathText>
    );
  }
  if (!frag.hasMath) {
    return (
      <PlainText style={style} numberOfLines={numberOfLines}>
        {name}
      </PlainText>
    );
  }
  return (
    <MathText style={style} numberOfLines={numberOfLines} inline>
      {frag.text}
    </MathText>
  );
}
