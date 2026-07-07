// app/(tabs)/settings.tsx
//
// Global app settings. Viz colors here edit the global default; the palette
// button on a visualize screen can still save per-sequence overrides.

import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useThemeColors } from "../../src/theme";
import { VizColorControls } from "../../src/components/VizColorSheet";
import { LogoTitleRow, SectionHeading } from "../../src/components/ui";
import PlainText from "../../src/components/PlainText";
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
  webContentColumn,
} from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="settings-screen"
      nativeID="main"
    >
      <View style={styles.hero}>
        <LogoTitleRow title="Settings" subtitle="Applies everywhere" size="page" />
      </View>

      <SectionHeading>Visualization colors</SectionHeading>
      <PlainText style={styles.note}>
        Sets the default for every sequence. To keep special colors for one
        sequence, use the palette button on its visualization screen.
      </PlainText>
      <View style={styles.panel}>
        <VizColorControls />
      </View>
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
  hero: {
    marginBottom: spacing.lg,
  },
  note: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  panel: {
    gap: spacing.sm,
  },
});
