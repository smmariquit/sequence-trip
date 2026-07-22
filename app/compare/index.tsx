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

export default function ComparePickerScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const [a, setA] = useState<OEISSequence | null>(null);
  const [b, setB] = useState<OEISSequence | null>(null);
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
    if (!a) setA(seq);
    else if (!b && seq.anum !== a.anum) setB(seq);
    setQuery("");
    setResults([]);
  };

  const slot = (
    label: string,
    seq: OEISSequence | null,
    clear: () => void
  ) => (
    <Pressable
      onPress={seq ? clear : undefined}
      style={[styles.slot, seq && styles.slotFilled]}
      accessibilityRole="button"
      accessibilityLabel={seq ? `Clear ${seq.anum}` : `${label} not chosen yet`}
    >
      <PlainText style={styles.slotLabel}>{label}</PlainText>
      <PlainText style={seq ? styles.slotAnum : styles.slotEmpty} numberOfLines={1}>
        {seq ? `${seq.anum} · ${seq.name}` : "Search below to pick"}
      </PlainText>
      {seq ? <PlainText style={styles.slotClear}>tap to clear</PlainText> : null}
    </Pressable>
  );

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
        Pick two sequences to see them plotted against each other, phase plane
        and term-by-term ratio.
      </PlainText>

      {slot("First", a, () => setA(null))}
      {slot("Second", b, () => setB(null))}

      {a && b ? (
        <PillButton
          variant="primary"
          icon="git-compare-outline"
          onPress={() => router.push(`/compare/${a.anum}-${b.anum}`)}
          testID="compare-go"
          flex
        >
          Compare
        </PillButton>
      ) : (
        <>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={`Search for the ${a ? "second" : "first"} sequence`}
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
      )}
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
  slotLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  slotAnum: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  slotEmpty: {
    color: colors.textMuted,
    fontSize: 15,
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
