// app/compare/index.tsx
//
// Picker for the two-sequence comparison: choose A and B by search, then
// jump to /compare/A-B. Linked from the home screen.

import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as oeis from "../../src/oeis/db";
import type { OEISSequence } from "../../src/sequences/types";
import { useThemeColors } from "../../src/theme";
import { BackButton, PillButton, SearchField, SectionHeading } from "../../src/components/ui";
import PlainText from "../../src/components/PlainText";
import { MAX_INFO_WIDTH, PAGE_PADDING, safeAreaTop } from "../../src/theme/layout";
import { radii, spacing, touch } from "../../src/theme/tokens";

const MAX_PICKS = 4;

// curated matchups; each opens the N-way compare directly.
// ponytail: hand-picked seed list, refresh from the research pass when it lands
const COMPARE_PRESETS: { anums: string[]; label: string; why: string }[] = [
  {
    anums: ["A000045", "A000032", "A000129"],
    label: "Fibonacci vs Lucas vs Pell",
    why: "Three two-term recurrences racing at different exponential rates.",
  },
  {
    anums: ["A000045", "A000032"],
    label: "Fibonacci vs Lucas",
    why: "Same add-the-last-two rule, different seeds; the ratio settles to a constant.",
  },
  {
    anums: ["A000108", "A000984"],
    label: "Catalan vs central binomial",
    why: "Catalan is the central binomial divided by n+1; the ratio plot shows it.",
  },
  {
    anums: ["A000217", "A000290", "A000578"],
    label: "Triangular vs squares vs cubes",
    why: "The figurate ladder: polynomial growth of degree 2, 2, and 3.",
  },
  {
    anums: ["A000040", "A002808"],
    label: "Primes vs composites",
    why: "The whole numbers split in two; watch the prime side thin out.",
  },
  {
    anums: ["A000005", "A000010", "A000203"],
    label: "Divisors, totient, sigma",
    why: "The classic arithmetic-function trio: count, coprimes, and sum of divisors.",
  },
  {
    anums: ["A000041", "A000009", "A000110"],
    label: "Partitions three ways",
    why: "Any parts, distinct parts, and labeled set partitions pull apart fast.",
  },
];

export default function ComparePickerScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const [picks, setPicks] = useState<OEISSequence[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OEISSequence[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      oeis
        .search(query.trim())
        .then((hits) => setResults(hits.slice(0, 12)))
        .catch(() => setResults([]));
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  const pick = (seq: OEISSequence) => {
    setPicks((prev) =>
      prev.length < MAX_PICKS && !prev.some((p) => p.anum === seq.anum)
        ? [...prev, seq]
        : prev
    );
    setQuery("");
    setResults([]);
  };

  const remove = (anum: string) => {
    setPicks((prev) => prev.filter((p) => p.anum !== anum));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="compare-picker"
      nativeID="main"
    >
      <View style={styles.topRow}>
        <BackButton compact testID="compare-back" />
        <SectionHeading padded={false} style={styles.heading}>
          Compare two sequences
        </SectionHeading>
      </View>
      <PlainText style={styles.note}>
        Pick two, three, or four sequences to overlay their growth. Exactly two
        also gets the phase plane and term-by-term ratio.
      </PlainText>

      {picks.map((seq) => (
        <Pressable
          key={seq.anum}
          onPress={() => remove(seq.anum)}
          style={[styles.slot, styles.slotFilled]}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${seq.anum}`}
        >
          <PlainText style={styles.slotAnum} numberOfLines={1}>
            {`${seq.anum} · ${seq.name}`}
          </PlainText>
          <PlainText style={styles.slotClear}>tap to remove</PlainText>
        </Pressable>
      ))}

      {picks.length >= 2 ? (
        <PillButton
          variant="primary"
          icon="git-compare-outline"
          onPress={() => router.push(`/compare/${picks.map((p) => p.anum).join("-")}`)}
          testID="compare-go"
          flex
        >
          {`Compare ${picks.length}`}
        </PillButton>
      ) : null}

      {picks.length < MAX_PICKS ? (
        <>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={
              picks.length === 0
                ? "Search for the first sequence"
                : "Add another sequence"
            }
            testID="compare-search"
          />
          {results.map((seq) => (
            <Pressable
              key={seq.anum}
              onPress={() => pick(seq)}
              style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Pick ${seq.anum}`}
              testID={`compare-result-${seq.anum}`}
            >
              <PlainText style={styles.resultAnum}>{seq.anum}</PlainText>
              <PlainText style={styles.resultName} numberOfLines={1}>
                {seq.name}
              </PlainText>
            </Pressable>
          ))}
        </>
      ) : null}

      {picks.length === 0 && !query ? (
        <>
          <PlainText style={styles.presetHeading}>Classic matchups</PlainText>
          {COMPARE_PRESETS.map((preset) => (
            <Pressable
              key={preset.anums.join("-")}
              onPress={() => router.push(`/compare/${preset.anums.join("-")}`)}
              style={({ pressed }) => [styles.preset, pressed && styles.resultPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Compare ${preset.label}`}
              testID={`compare-preset-${preset.anums[0]}`}
            >
              <PlainText style={styles.presetLabel}>{preset.label}</PlainText>
              <PlainText style={styles.presetWhy}>{preset.why}</PlainText>
            </Pressable>
          ))}
        </>
      ) : null}
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
    gap: spacing.sm,
    // centered column on every platform, not just web
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
  },
  note: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  slot: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    minHeight: touch.minHeight,
  },
  slotFilled: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  slotAnum: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  presetHeading: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  preset: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    minHeight: touch.minHeight,
  },
  presetLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  presetWhy: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  slotClear: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    minHeight: touch.minHeight,
  },
  resultPressed: {
    opacity: 0.8,
  },
  resultAnum: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  resultName: {
    flex: 1,
    color: colors.textDim,
    fontSize: 14,
  },
});
