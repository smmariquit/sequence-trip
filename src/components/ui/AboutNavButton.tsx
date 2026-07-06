// src/components/ui/AboutNavButton.tsx

import React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { router } from "expo-router";
import { safeAreaTop } from "../../theme/layout";
import PillButton from "./PillButton";

interface Props {
  testID?: string;
  style?: StyleProp<ViewStyle>;
  absolute?: boolean;
}

export default function AboutNavButton({
  testID = "info-link",
  style,
  absolute = false,
}: Props) {
  return (
    <PillButton
      variant="info"
      onPress={() => router.push("/about")}
      testID={testID}
      icon="information-circle-outline"
      label="About"
      accessibilityLabel="About, help and credits"
      style={[absolute && [styles.absolute, { top: safeAreaTop("home") }], style]}
    />
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    right: 20,
    zIndex: 1,
  },
});
