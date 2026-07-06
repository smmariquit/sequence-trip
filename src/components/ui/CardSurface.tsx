// src/components/ui/CardSurface.tsx

import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import { useThemeColors } from "../../theme";
import { radii } from "../../theme/tokens";

export type CardVariant = "card" | "input" | "chip" | "panel";

interface Props extends Pick<ViewProps, "pointerEvents"> {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function CardSurface({
  variant = "card",
  children,
  style,
  pointerEvents,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.variantStyles[variant], style]} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
}

const makeStyles = (colors: any) => ({
  variantStyles: StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
    },
    input: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    chip: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.pill,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    panel: {
      backgroundColor: colors.bgElevated,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  }),
});

export const cardBorderStyles = StyleSheet.create({
  bottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)', // fallback
  },
  top: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});
