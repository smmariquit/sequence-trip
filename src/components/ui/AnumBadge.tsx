// src/components/ui/AnumBadge.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { radii, typography } from "../../theme/tokens";

export type AnumBadgeSize = "sm" | "md";

interface Props {
  anum: string;
  size?: AnumBadgeSize;
}

export default function AnumBadge({ anum, size = "md" }: Props) {
  return (
    <View style={[styles.badge, sizeStyles[size]]}>
      <Text style={styles.text}>{anum}</Text>
    </View>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    paddingHorizontal: 8,
    marginRight: 12,
  },
  md: {
    paddingHorizontal: 10,
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.sm,
    paddingVertical: 4,
  },
  text: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
