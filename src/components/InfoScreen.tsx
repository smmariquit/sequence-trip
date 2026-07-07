// src/components/InfoScreen.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Constants from "expo-constants";
import { useThemeColors } from "../theme";
import { APP_NAME } from "../constants/brand";
import { INFO_SECTIONS } from "../content/infoContent";
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
  webContentColumn,
} from "../theme/layout";
import { spacing } from "../theme/tokens";
import { AppFooter, InfoSectionBlock, LogoTitleRow } from "./ui";

export default function InfoScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="info-screen"
      nativeID="main"
    >
      <View style={styles.topRow}>
        <LogoTitleRow title="About" subtitle={APP_NAME} size="page" />
        <Text style={styles.version}>v{version}</Text>
      </View>

      {INFO_SECTIONS.map((section) => (
        <InfoSectionBlock key={section.id} section={section} />
      ))}

      <AppFooter variant="info" />
    </ScrollView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: safeAreaTop("home"),
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: tabBarScrollPadding(),
    ...webContentColumn(MAX_INFO_WIDTH),
  },
  topRow: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  version: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    alignSelf: "flex-end",
  },
});
