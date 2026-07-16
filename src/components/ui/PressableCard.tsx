// src/components/ui/PressableCard.tsx

import React from "react";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
  pressedScale?: number;
  accessibilityLabel?: string;
}

export default function PressableCard({
  onPress,
  children,
  style,
  pressedOpacity = 0.85,
  pressedScale = 1,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        style,
        pressed && {
          opacity: pressedOpacity,
          ...(pressedScale !== 1 ? { transform: [{ scale: pressedScale }] } : null),
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

export const pressableRowStyle = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
});
