// src/components/ui/LoadingSpinner.tsx

import React from "react";
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useThemeColors } from "../../theme";

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function LoadingSpinner({ style }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return <ActivityIndicator color={colors.primary} style={[styles.spinner, style]} />;
}

const makeStyles = (colors: any) => StyleSheet.create({
  spinner: {
    marginVertical: 16,
  },
});
