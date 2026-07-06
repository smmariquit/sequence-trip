// src/components/ui/SectionHeading.tsx

import React from "react";
import { View, Text, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { useThemeColors } from "../../theme";
import { PAGE_PADDING } from "../../theme/layout";
import { spacing } from "../../theme/tokens";

export type SectionHeadingSize = "page" | "info";

interface Props {
  children: string;
  size?: SectionHeadingSize;
  style?: StyleProp<TextStyle>;
  padded?: boolean;
}

export default function SectionHeading({
  children,
  size = "page",
  style,
  padded = true,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[padded && size === "page" && styles.pagePadded, styles.row]}>
      <View style={styles.accent} />
      <Text style={[styles.sizeStyles[size], style]}>{children}</Text>
    </View>
  );
}

const makeStyles = (colors: any) => ({
  sizeStyles: StyleSheet.create({
    page: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    info: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },
  }),
  ...StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    accent: {
      width: 3,
      height: 18,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    pagePadded: {
      paddingHorizontal: PAGE_PADDING,
    },
  }),
});
