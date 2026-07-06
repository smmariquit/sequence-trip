// app/(tabs)/explore.tsx

import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { useThemeColors } from "../../src/theme";
import { COLLECTIONS } from "../../src/sequences/collections";
import type { OEISSequence } from "../../src/sequences/types";
import { resolveSequences } from "../../src/sequences/resolveSequence";
import { getSequence } from "../../src/sequences/catalog";
import ExploreCard, { EXPLORE_CARD_W } from "../../src/components/ExploreCard";
import {
  BodyText,
  LoadingSpinner,
  LogoTitleRow,
} from "../../src/components/ui";
import {
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
} from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";
import * as oeis from "../../src/oeis/db";

export default function ExploreScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const [sequences, setSequences] = useState<Map<string, OEISSequence> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const anums = COLLECTIONS.flatMap((c) => c.anums);
    
    const initialMap = new Map<string, OEISSequence>();
    for (const anum of anums) {
      const cat = getSequence(anum);
      if (cat) initialMap.set(anum, cat);
    }
    setSequences(initialMap);

    oeis.warmDb().catch(() => {});
    resolveSequences(anums)
      .then((map) => {
        if (!cancelled) setSequences(map);
      })
      .catch((err) => {
        console.warn("Explore sequences load failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container} testID="explore-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <LogoTitleRow
            title="Explore"
            subtitle="Curated collections — swipe through, tap to visualize"
            size="page"
          />
        </View>

        {!sequences ? (
          <View style={styles.loading}>
            <LoadingSpinner />
          </View>
        ) : (
          COLLECTIONS.map((collection) => (
            <View key={collection.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{collection.title}</Text>
                <BodyText variant="caption" style={styles.sectionDesc}>
                  {collection.description}
                </BodyText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={EXPLORE_CARD_W + spacing.md}
                contentContainerStyle={styles.carousel}
              >
                {collection.anums.map((anum) => {
                  const seq = sequences.get(anum);
                  if (!seq) return null;
                  return <ExploreCard key={anum} sequence={seq} />;
                })}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: tabBarScrollPadding(),
  },
  hero: {
    paddingTop: safeAreaTop("home"),
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.lg,
  },
  loading: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: PAGE_PADDING,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionDesc: {
    color: colors.textDim,
    lineHeight: 18,
    marginBottom: 0,
  },
  carousel: {
    paddingHorizontal: PAGE_PADDING,
    gap: spacing.md,
  },
});
