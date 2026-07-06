// src/components/ui/NavLink.tsx

import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../theme";
import AppIcon from "./AppIcon";

export type NavLinkVariant = "accent" | "muted" | "footer";

interface Props {
  href: string;
  label: string;
  variant?: NavLinkVariant;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export default function NavLink({
  href,
  label,
  variant = "accent",
  testID,
  style,
}: Props) {
  return (
    <Pressable
      onPress={() => router.push(href as never)}
      testID={testID}
      style={({ pressed }) => [style, pressed && styles.pressed]}
      accessibilityRole="link"
    >
      <View style={styles.row}>
        {variant === "footer" ? (
          <AppIcon name="information-circle-outline" size={14} color={colors.interactive} />
        ) : null}
        <Text style={linkStyles[variant]}>{label}</Text>
        {variant === "footer" ? (
          <AppIcon name="chevron-forward" size={14} color={colors.interactive} />
        ) : null}
      </View>
    </Pressable>
  );
}

const linkStyles = StyleSheet.create({
  accent: {
    color: colors.interactive,
    fontSize: 12,
    fontWeight: "600",
  },
  muted: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    color: colors.interactive,
    fontSize: 12,
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});

/** Shortcut for the shared info/about screen. */
export function AboutLink({
  label,
  variant = "accent",
  testID,
}: {
  label: string;
  variant?: NavLinkVariant;
  testID?: string;
}) {
  return <NavLink href="/about" label={label} variant={variant} testID={testID} />;
}
