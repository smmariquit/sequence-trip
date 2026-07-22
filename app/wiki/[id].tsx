// app/wiki/[id].tsx
//
// One wiki article: its sections rendered with the shared info blocks.

import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getArticle } from "../../src/content/infoContent";
import { useThemeColors } from "../../src/theme";
import {
  BackButton,
  CenteredState,
  InfoSectionBlock,
  SectionHeading,
} from "../../src/components/ui";
import PlainText from "../../src/components/PlainText";
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
} from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";

export default function WikiArticleScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = getArticle(id ?? "");

  if (!article) return <CenteredState message="Article not found" />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={`wiki-article-${article.id}`}
      nativeID="main"
    >
      <View style={styles.topRow}>
        <BackButton compact testID="wiki-back" />
        <SectionHeading padded={false} style={styles.heading}>
          {article.title}
        </SectionHeading>
      </View>
      <PlainText style={styles.summary}>{article.summary}</PlainText>

      {article.sections.map((section) => (
        <InfoSectionBlock key={section.id} section={section} />
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: safeAreaTop("controls"),
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.xxl,
    maxWidth: MAX_INFO_WIDTH,
    width: "100%",
    alignSelf: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
  },
  summary: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
