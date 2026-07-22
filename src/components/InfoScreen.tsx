// src/components/InfoScreen.tsx
//
// The wiki index: one card per article, opening /wiki/[id].

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { useThemeColors } from "../theme";
import { APP_NAME } from "../constants/brand";
import { WIKI_ARTICLES } from "../content/infoContent";
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
  webContentColumn,
} from "../theme/layout";
import { radii, spacing } from "../theme/tokens";
import { AppFooter, AppIcon, LogoTitleRow } from "./ui";
import type { AppIconName } from "./ui/AppIcon";

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
        <LogoTitleRow
          title="Wiki"
          subtitle={`Everything about integer sequences, and about ${APP_NAME}`}
          size="page"
        />
        <Text style={styles.version}>v{version}</Text>
      </View>

      {WIKI_ARTICLES.map((article) => (
        <Pressable
          key={article.id}
          onPress={() => router.push(`/wiki/${article.id}`)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Open article ${article.title}`}
          testID={`wiki-card-${article.id}`}
        >
          <View style={styles.cardIcon}>
            <AppIcon name={article.icon as AppIconName} size={22} color={colors.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{article.title}</Text>
            <Text style={styles.cardSummary}>{article.summary}</Text>
          </View>
          <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
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
    gap: spacing.sm,
    ...webContentColumn(MAX_INFO_WIDTH),
  },
  topRow: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  version: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    alignSelf: "flex-end",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    minHeight: 72,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDim,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSummary: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
