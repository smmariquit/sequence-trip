// src/components/ui/LoadingSpinner.tsx

import React from "react";
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../../theme";

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function LoadingSpinner({ style }: Props) {
  return <ActivityIndicator color={colors.primary} style={[styles.spinner, style]} />;
}

const styles = StyleSheet.create({
  spinner: {
    marginVertical: 16,
  },
});
