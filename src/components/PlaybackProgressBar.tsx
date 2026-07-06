// src/components/PlaybackProgressBar.tsx
//
// Progress bar driven by Reanimated shared value — no 60fps React re-renders.

import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { usePlayback } from "../playback/PlaybackContext";
import { colors } from "../theme";
import { radii } from "../theme/tokens";

export default function PlaybackProgressBar() {
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

const styles = StyleSheet.create({
  wrap: {
    height: 3,
    backgroundColor: colors.borderSubtle,
  },
  bar: {
    height: 3,
    backgroundColor: colors.primary,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
  },
});
