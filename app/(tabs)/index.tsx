// app/(tabs)/index.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useThemeColors } from "../../src/theme";
import { sequences } from "../../src/sequences/catalog";
import type { OEISSequence } from "../../src/sequences/types";
import SequenceCard from "../../src/components/SequenceCard";
import ResultRow from "../../src/components/ResultRow";
import AmbientButton from "../../src/components/AmbientButton";
import {
  AppFooter,
  BodyText,
  LoadingSpinner,
  LogoTitleRow,
  PillButton,
  SearchField,
  SectionHeading,
} from "../../src/components/ui";
import { APP_TAGLINE } from "../../src/constants/brand";
import {
  MAX_PAGE_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
} from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";
import * as oeis from "../../src/oeis/db";

export default function HomeScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const { width: screenW } = useWindowDimensions();
  const pageW = Math.min(screenW, MAX_PAGE_WIDTH);
  const twoCol = Platform.OS === "web" && pageW >= 760;
  const gridGap = spacing.lg;
  const cardW = twoCol ? (pageW - PAGE_PADDING * 2 - gridGap) / 2 : pageW - PAGE_PADDING * 2;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OEISSequence[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [sotd, setSotd] = useState<OEISSequence | null>(null);

  useEffect(() => {
    oeis.warmDb().catch(() => {});
    oeis.sequenceOfTheDay().then(setSotd).catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const t = setTimeout(() => {
      oeis
        .search(q)
        .then((r) => {
          if (cancelled) return;
          setResults(r);
          setSearching(false);
        })
        .catch(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const goRandom = async () => {
    try {
      const seq = await oeis.random();
      router.push(`/visualize/${seq.anum}`);
    } catch {}
  };

  return (
    <View style={styles.container} nativeID="main">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS !== "web"}
      >
        <View style={styles.heroSection}>
          <LogoTitleRow
            title="Sequence Trip"
            subtitle={APP_TAGLINE}
            size="hero"
            titleTestID="home-title"
          />
        </View>

        <View style={styles.searchWrap}>
          <SearchField
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder='Try "fibonacci", A005132, or 1,1,2,3,5'
          />
        </View>

        {results !== null ? (
          <View style={styles.results}>
            {searching && <LoadingSpinner />}
            {!searching && results.length === 0 && (
              <BodyText variant="empty">No sequences found</BodyText>
            )}
            {results.map((seq, i) => (
              <ResultRow
                key={seq.anum}
                sequence={seq}
                showPreview={Platform.OS !== "web" || i < 8}
              />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.actionsRow}>
              <PillButton variant="action" icon="shuffle" onPress={goRandom}>
                Random
              </PillButton>
              {sotd && (
                <PillButton
                  variant="primary"
                  icon="today-outline"
                  onPress={() => router.push(`/visualize/${sotd.anum}`)}
                  flex
                >
                  {`Today: ${sotd.anum}`}
                </PillButton>
              )}
              <AmbientButton />
            </View>

            <SectionHeading>Featured</SectionHeading>
            <View style={[styles.featuredGrid, twoCol && { gap: gridGap }]}>
              {sequences.map((seq, i) => (
                <SequenceCard key={seq.anum} sequence={seq} index={i} cardWidth={cardW} />
              ))}
            </View>
          </>
        )}

        <AppFooter />
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
  heroSection: {
    paddingTop: safeAreaTop("home"),
    paddingBottom: spacing.lg,
    paddingHorizontal: PAGE_PADDING,
  },
  searchWrap: {
    paddingHorizontal: PAGE_PADDING,
    marginBottom: spacing.md,
  },
  results: {
    paddingHorizontal: PAGE_PADDING,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: PAGE_PADDING,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featuredGrid: {
    paddingHorizontal: PAGE_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
