// src/components/AmbientButton.tsx
//
// Cycles zen ambience: on → low → off. Hidden on web (ambience is native-only).

import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useAmbient } from "../audio/AmbientContext";
import { useThemeColors } from "../theme";
import { radii, touch } from "../theme/tokens";
import AppIcon from "./ui/AppIcon";

const ICONS = {
  on: "volume-high",
  low: "volume-low",
  off: "volume-mute",
} as const;

const LABELS = {
  on: "Ambient music on, switch to low volume",
  low: "Ambient music low, switch off",
  off: "Ambient music off, switch on",
} as const;

export default function AmbientButton() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { level, cycleLevel } = useAmbient();

  if (Platform.OS === "web") return null;

  return (
    <Pressable
      onPress={cycleLevel}
      testID="ambient-toggle"
      accessibilityRole="button"
      accessibilityLabel={LABELS[level]}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <AppIcon
        name={ICONS[level]}
        size={touch.iconSizeSm}
        color={level === "off" ? colors.textMuted : colors.primary}
      />
    </Pressable>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  btn: {
    minWidth: touch.minHeight,
    minHeight: touch.minHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  pressed: {
    opacity: 0.7,
  },
});
