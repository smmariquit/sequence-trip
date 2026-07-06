// src/components/ui/LogoTitleRow.tsx

import React from "react";
import { View, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { colors } from "../../theme";
import Logo from "../Logo";
import PlainText from "../PlainText";

export type LogoTitleSize = "hero" | "page" | "inline";

interface Props {
  title: string;
  subtitle?: string;
  logoSize?: number;
  size?: LogoTitleSize;
  showLogoBackground?: boolean;
  titleTestID?: string;
  titleStyle?: StyleProp<TextStyle>;
}

const titleSizes = StyleSheet.create({
  hero: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  page: { fontSize: 28, fontWeight: "800" },
  inline: { fontSize: 16, fontWeight: "700" },
});

const defaultLogoSizes: Record<LogoTitleSize, number> = {
  hero: 52,
  page: 56,
  inline: 24,
};

export default function LogoTitleRow({
  title,
  subtitle,
  logoSize,
  size = "hero",
  showLogoBackground = true,
  titleTestID,
  titleStyle,
}: Props) {
  const resolvedLogoSize = logoSize ?? defaultLogoSizes[size];

  return (
    <View style={[styles.row, size === "inline" && styles.rowInline]}>
      <Logo size={resolvedLogoSize} showBackground={showLogoBackground && size !== "inline"} />
      <View style={styles.textCol}>
        <PlainText
          style={[styles.title, titleSizes[size], titleStyle]}
          numberOfLines={size === "inline" ? 1 : undefined}
          testID={titleTestID}
        >
          {title}
        </PlainText>
        {subtitle ? (
          <PlainText
            style={[styles.subtitle, size === "hero" && styles.subtitleHero]}
            numberOfLines={size === "inline" ? 1 : undefined}
          >
            {subtitle}
          </PlainText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowInline: {
    gap: 8,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: 2,
    lineHeight: 21,
  },
  subtitleHero: {
    marginTop: 6,
  },
});
