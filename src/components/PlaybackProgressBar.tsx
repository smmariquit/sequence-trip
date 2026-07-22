// src/components/PlaybackProgressBar.tsx
//
// Progress bar driven by Reanimated shared value — no 60fps React re-renders.

import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { usePlayback } from "../playback/PlaybackContext";
import { useThemeColors } from "../theme";
import { radii, spacing } from "../theme/tokens";

export default function PlaybackProgressBar() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const { progressSV, maxSteps } = usePlayback();

  const fillStyle = useAnimatedStyle(() => {
    const pct = maxSteps > 0 ? Math.min(1, progressSV.value / maxSteps) : 0;
    return { width: `${pct * 100}%` };
  }, [maxSteps]);

  if (maxSteps <= 0) return null;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bar, fillStyle]} />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrap: {
    height: 3,
    backgroundColor: colors.borderSubtle,
    // breathing room above the instrument chip row below
    marginBottom: spacing.sm,
  },
  bar: {
    height: 3,
    backgroundColor: colors.primary,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
  },
});
