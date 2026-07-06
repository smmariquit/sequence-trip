// src/components/ui/BodyText.tsx

import React from "react";
import { Text, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { colors } from "../../theme";

export type BodyTextVariant = "body" | "caption" | "muted" | "error" | "empty";

interface Props {
  children: React.ReactNode;
  variant?: BodyTextVariant;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function BodyText({
  children,
  variant = "body",
  style,
  numberOfLines,
}: Props) {
  return (
    <Text style={[variantStyles[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

const variantStyles = StyleSheet.create({
  body: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  caption: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  error: {
    color: colors.textDim,
    fontSize: 16,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },
});
