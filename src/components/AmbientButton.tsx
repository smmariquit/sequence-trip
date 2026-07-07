// src/components/AmbientButton.tsx
//
// Zen ambience controls: on/off toggle; volume slider shows while on.
// Hidden on web (ambience is native-only).

import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useAmbient } from "../audio/AmbientContext";
import { useThemeColors } from "../theme";
import { spacing } from "../theme/tokens";
import AppIcon from "./ui/AppIcon";
import PillButton from "./ui/PillButton";

export default function AmbientButton() {
  const { enabled, toggle } = useAmbient();

  if (Platform.OS === "web") return null;

  return (
    <PillButton
      variant={enabled ? "primary" : "icon"}
      icon={enabled ? "volume-high" : "volume-mute"}
      iconPosition="only"
      onPress={toggle}
      testID="ambient-toggle"
      accessibilityLabel={enabled ? "Turn ambient music off" : "Turn ambient music on"}
    />
  );
}

/** Volume slider row — rendered below the actions row while ambience is on. */
export function AmbientVolumeRow() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { enabled, volume, setVolume } = useAmbient();

  if (Platform.OS === "web" || !enabled) return null;

  return (
    <View style={styles.sliderRow}>
      <AppIcon name="volume-low" size={14} color={colors.textMuted} />
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onSlidingComplete={setVolume}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel="Ambient music volume"
        testID="ambient-volume"
      />
      <AppIcon name="volume-high" size={14} color={colors.textMuted} />
    </View>
  );
}

const makeStyles = (_colors: any) => StyleSheet.create({
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  slider: {
    flex: 1,
    height: 28,
  },
});
