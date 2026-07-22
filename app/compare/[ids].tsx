// app/compare/[ids].tsx
//
// N-sequence comparison. Always: shared symlog growth overlay. For exactly
// two sequences also phase plane + ratio (OEIS plot2 modes).
// URL shape: /compare/A000045-A000108 or /compare/A000045-A000032-A000129

import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as oeis from "../../src/oeis/db";
import type { OEISSequence } from "../../src/sequences/types";
import PairPlot from "../../src/visualizations/PairPlot";
import MultiSeriesPlot, { seriesColor } from "../../src/visualizations/MultiSeriesPlot";
import { useThemeColors } from "../../src/theme";
import { BackButton, CenteredState, AnumBadge, BodyText } from "../../src/components/ui";
import { MAX_PAGE_WIDTH, PAGE_PADDING, safeAreaTop } from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";

export default function CompareScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const { width: screenW } = useWindowDimensions();
  const plotW = Math.min(screenW, MAX_PAGE_WIDTH) - PAGE_PADDING * 2;

  const anums = useMemo(() => {
    const raw = (ids ?? "").toUpperCase();
    if (!/^A\d{6}(-A\d{6})+$/.test(raw)) return [];
    return [...new Set(raw.split("-"))];
  }, [ids]);

  const [seqs, setSeqs] = useState<OEISSequence[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (anums.length < 2) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all(anums.map((a) => oeis.getById(a)))
      .then((hits) => {
        const found = hits.filter((h): h is OEISSequence => h !== null);
        if (!cancelled && found.length === anums.length) setSeqs(found);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [anums]);

  if (loading) return <CenteredState loading />;
  if (!seqs) return <CenteredState message="Sequences not found" />;

  const [a, b] = seqs;
  const isPair = seqs.length === 2;
  return (
    <View style={styles.container} nativeID="main" testID="compare-screen">
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {seqs.map((s) => s.anum).join(" vs ")}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.names}>
          {seqs.map((s, i) => (
            <View key={s.anum} style={styles.nameRow}>
              <View style={[styles.seriesDot, { backgroundColor: seriesColor(i) }]} />
              <AnumBadge anum={s.anum} size="sm" />
              <BodyText variant="caption" style={styles.name}>{s.name}</BodyText>
            </View>
          ))}
        </View>

        <Text style={styles.plotTitle}>Growth — shared log scale over n</Text>
        <View
          style={[styles.plotBox, { width: plotW, height: plotW * 0.6 }]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Growth of ${seqs.map((s) => s.anum).join(", ")} on a shared log scale`}
        >
          <MultiSeriesPlot
            series={seqs.map((s) => s.terms ?? [])}
            width={plotW}
            height={plotW * 0.6}
          />
        </View>

        {isPair ? (
          <>
        <Text style={styles.plotTitle}>Phase plane — {b.anum}(n) vs {a.anum}(n)</Text>
        <View
          style={[styles.plotBox, { width: plotW, height: plotW * 0.8 }]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Phase plane of ${b.anum} against ${a.anum}`}
        >
          <PairPlot
            termsA={a.terms ?? []}
            termsB={b.terms ?? []}
            mode="phase"
            width={plotW}
            height={plotW * 0.8}
          />
        </View>

        <Text style={styles.plotTitle}>Ratio — log a(n)/b(n) over n</Text>
        <View
          style={[styles.plotBox, { width: plotW, height: plotW * 0.6 }]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Log ratio of ${a.anum} to ${b.anum} over n`}
        >
          <PairPlot
            termsA={a.terms ?? []}
            termsB={b.terms ?? []}
            mode="ratio"
            width={plotW}
            height={plotW * 0.6}
          />
        </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: safeAreaTop("info"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  scroll: {
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  names: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  seriesDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    marginBottom: 0,
  },
  plotTitle: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  plotBox: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
});
