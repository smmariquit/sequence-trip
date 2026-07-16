// src/components/ui/SectionHeading.tsx

import React from "react";
import { Text, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { useThemeColors } from "../../theme";
import { PAGE_PADDING } from "../../theme/layout";
import { fonts, spacing } from "../../theme/tokens";

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
    <Text
      style={[
        styles.sizeStyles[size],
        padded && size === "page" && styles.pagePadded,
        style,
      ]}
    >
      {children}
    </Text>
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
  ...StyleSheet.create({
    pagePadded: {
      paddingHorizontal: PAGE_PADDING,
    },
  }),
});
