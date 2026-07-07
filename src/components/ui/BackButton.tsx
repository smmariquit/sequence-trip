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

/** Deep links (shared URLs, web reloads) have no stack to pop — go home. */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export default function BackButton({
  onPress = goBack,
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
