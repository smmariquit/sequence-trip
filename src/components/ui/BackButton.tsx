// src/components/ui/BackButton.tsx

import React from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import PillButton from "./PillButton";

interface Props {
  onPress?: () => void;
  testID?: string;
  /** Icon-only on native — saves header space on visualize. */
  compact?: boolean;
}

export default function BackButton({
  onPress = () => router.back(),
  testID = "back-button",
  compact = Platform.OS !== "web",
}: Props) {
  if (compact) {
    return (
      <PillButton
        variant="icon"
        onPress={onPress}
        testID={testID}
        icon="chevron-back"
        iconPosition="only"
        accessibilityLabel="Go back"
      />
    );
  }

  return (
    <PillButton
      variant="back"
      onPress={onPress}
      testID={testID}
      icon="chevron-back"
      label="Back"
      accessibilityLabel="Go back"
    />
  );
}
