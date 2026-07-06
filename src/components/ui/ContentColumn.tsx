// src/components/ui/ContentColumn.tsx

import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { webContentColumn } from "../../theme/layout";

interface Props {
  maxWidth: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ContentColumn({ maxWidth, children, style }: Props) {
  return <View style={[styles.base, webContentColumn(maxWidth), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
});
