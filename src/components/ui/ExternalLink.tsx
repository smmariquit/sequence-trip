// src/components/ui/ExternalLink.tsx

import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { Linking } from "react-native";
import { colors } from "../../theme";
import AppIcon from "./AppIcon";

interface Props {
  url: string;
  label: string;
  style?: StyleProp<TextStyle>;
  inline?: boolean;
}

export default function ExternalLink({ url, label, style, inline }: Props) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [
        inline ? styles.inlineWrap : styles.wrap,
        pressed && styles.pressed,
      ]}
      accessibilityRole="link"
    >
      <View style={styles.row}>
        <Text style={[styles.link, inline && styles.inline, style]}>{label}</Text>
        <AppIcon
          name="open-outline"
          size={inline ? 12 : 14}
          color={colors.interactive}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 2,
  },
  inlineWrap: {
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: colors.interactive,
    fontSize: 14,
    fontWeight: "600",
  },
  inline: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
