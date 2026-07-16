// src/components/ui/AnumBadge.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import { radii, typography } from "../../theme/tokens";

export type AnumBadgeSize = "sm" | "md";

interface Props {
  anum: string;
  size?: AnumBadgeSize;
}

export default function AnumBadge({ anum, size = "md" }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

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

const makeStyles = (colors: any) => StyleSheet.create({
  badge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 4,
  },
  text: {
    color: colors.interactive,
    ...typography.caption,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
