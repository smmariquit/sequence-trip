// src/components/WebPageShell.tsx
//
// Centers content on wide desktop browsers instead of a skinny mobile column.

import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { colors } from "../theme";
import { MAX_PAGE_WIDTH } from "../theme/layout";

const MAX_CONTENT = MAX_PAGE_WIDTH;

export default function WebPageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const contentW = Math.min(width, MAX_CONTENT);

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { width: contentW, maxWidth: MAX_CONTENT }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    width: "100%",
  },
});
