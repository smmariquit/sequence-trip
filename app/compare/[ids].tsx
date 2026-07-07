// app/compare/[ids].tsx
//
// Two-sequence comparison: phase plane + ratio plot (OEIS plot2 modes).
// URL shape: /compare/A000045-A000108

import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as oeis from "../../src/oeis/db";
import type { OEISSequence } from "../../src/sequences/types";
import PairPlot from "../../src/visualizations/PairPlot";
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

  const [anumA, anumB] = useMemo(() => {
    const m = (ids ?? "").toUpperCase().match(/^(A\d{6})-(A\d{6})$/);
    return m ? [m[1], m[2]] : [null, null];
  }, [ids]);

  const [pair, setPair] = useState<[OEISSequence, OEISSequence] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anumA || !anumB) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([oeis.getById(anumA), oeis.getById(anumB)])
      .then(([a, b]) => {
        if (!cancelled && a && b) setPair([a, b]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [anumA, anumB]);

  if (loading) return <CenteredState loading />;
  if (!pair) return <CenteredState message="Sequences not found" />;

  const [a, b] = pair;
  return (
    <View style={styles.container} nativeID="main" testID="compare-screen">
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {a.anum} vs {b.anum}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.names}>
          <View style={styles.nameRow}>
            <AnumBadge anum={a.anum} size="sm" />
            <BodyText variant="caption" style={styles.name}>{a.name}</BodyText>
          </View>
          <View style={styles.nameRow}>
            <AnumBadge anum={b.anum} size="sm" />
            <BodyText variant="caption" style={styles.name}>{b.name}</BodyText>
          </View>
        </View>

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
