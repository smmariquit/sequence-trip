// src/components/ui/SectionHeading.tsx

import React from "react";
import { Text, View, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { useThemeColors } from "../../theme";
import { PAGE_PADDING } from "../../theme/layout";
import { fonts, spacing } from "../../theme/tokens";
import AppIcon from "./AppIcon";
import type { AppIconName } from "./AppIcon";

export type SectionHeadingSize = "page" | "info";

interface Props {
  children: string;
  size?: SectionHeadingSize;
  style?: StyleProp<TextStyle>;
  padded?: boolean;
  /** Leading icon, rendered in the primary color. */
  icon?: AppIconName;
}

export default function SectionHeading({
  children,
  size = "page",
  style,
  padded = true,
  icon,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const text = (
    <Text
      style={[
        styles.sizeStyles[size],
        padded && size === "page" && !icon && styles.pagePadded,
        icon && styles.noMargins,
        style,
      ]}
    >
      {children}
    </Text>
  );

  if (!icon) return text;

  return (
    <View
      style={[
        styles.iconRow,
        styles.marginStyles[size],
        padded && size === "page" && styles.pagePadded,
      ]}
    >
      <AppIcon name={icon} size={18} color={colors.primary} />
      {text}
    </View>
  );
}

const makeStyles = (colors: any) => ({
  sizeStyles: StyleSheet.create({
    page: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.display,
      letterSpacing: 0.2,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    info: {
      color: colors.text,
      fontSize: 17,
      fontFamily: fonts.display,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
  }),
  // with an icon the wrapping row owns the margins instead of the text
  marginStyles: StyleSheet.create({
    page: { marginTop: spacing.xl, marginBottom: spacing.md },
    info: { marginTop: spacing.xl, marginBottom: spacing.md },
  }),
  ...StyleSheet.create({
    pagePadded: {
      paddingHorizontal: PAGE_PADDING,
    },
    iconRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    noMargins: {
      marginTop: 0,
      marginBottom: 0,
    },
  }),
});
