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
import AmbientButton, { AmbientVolumeRow } from "../../src/components/AmbientButton";
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
import { radii, spacing } from "../../src/theme/tokens";
import * as oeis from "../../src/oeis/db";
import PlainText from "../../src/components/PlainText";
import { Pressable } from "react-native";
import {
  MATH_FIELDS,
  metadataFor,
  type MathFieldId,
} from "../../src/sequences/metadata";

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
  // field filter: tags come from the sequence NAME (see fieldsFromName), which
  // covers every sequence in the db. Difficulty is NOT a filter here: it can
  // only be honestly assigned to the ~26 curated sequences, so a difficulty
  // filter would hide almost every search result.
  const [fieldFilter, setFieldFilter] = useState<MathFieldId | null>(null);

  const filteredResults = React.useMemo(() => {
    if (!results) return null;
    if (!fieldFilter) return results;
    return results.filter((seq) =>
      metadataFor(seq.anum, seq.name).fields.includes(fieldFilter)
    );
  }, [results, fieldFilter]);

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
        .catch((err) => {
          console.error("search failed", err);
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

        {results !== null && filteredResults !== null ? (
          <View style={styles.results}>
            <View style={styles.filterRow} testID="search-filters">
              {(Object.keys(MATH_FIELDS) as MathFieldId[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFieldFilter(fieldFilter === f ? null : f)}
                  style={[styles.filterChip, fieldFilter === f && styles.filterChipOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: fieldFilter === f }}
                  testID={`filter-field-${f}`}
                >
                  <PlainText style={fieldFilter === f ? styles.filterTextOn : styles.filterText}>
                    {MATH_FIELDS[f].label}
                  </PlainText>
                </Pressable>
              ))}
            </View>
            {searching && <LoadingSpinner />}
            {!searching && filteredResults.length === 0 && (
              <BodyText variant="empty">
                {results.length === 0 ? "No sequences found" : "No results in that field"}
              </BodyText>
            )}
            {filteredResults.map((seq, i) => (
              <ResultRow key={seq.anum} sequence={seq} index={i} />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.actionsRow}>
              <PillButton variant="action" icon="shuffle" onPress={goRandom}>
                Random
              </PillButton>
              <PillButton
                variant="action"
                icon="git-compare-outline"
                onPress={() => router.push("/compare")}
                testID="home-compare"
              >
                Compare
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
            <View style={styles.volumeWrap}>
              <AmbientVolumeRow />
            </View>

            <SectionHeading>Featured</SectionHeading>
            <View style={[styles.featuredGrid, twoCol && { gap: gridGap }]}>
              {sequences.map((seq, i) => {
                // Hallmark: break equal-card grid — first featured is full bleed on web.
                const width =
                  twoCol && i === 0
                    ? pageW - PAGE_PADDING * 2
                    : cardW;
                return (
                  <SequenceCard
                    key={seq.anum}
                    sequence={seq}
                    index={i}
                    cardWidth={width}
                  />
                );
              })}
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipOn: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextOn: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    // four actions no longer fit one row on phones; Today wraps to its own
    // line instead of squeezing into vertical text
    flexWrap: "wrap",
    paddingHorizontal: PAGE_PADDING,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  volumeWrap: {
    paddingHorizontal: PAGE_PADDING,
    marginBottom: spacing.sm,
  },
  featuredGrid: {
    paddingHorizontal: PAGE_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
