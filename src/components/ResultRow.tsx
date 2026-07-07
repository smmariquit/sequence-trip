// src/components/ResultRow.tsx

import React, { memo, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { useThemeColors } from "../theme";
import { radii, spacing } from "../theme/tokens";
import ErrorBoundary from "./ErrorBoundary";
import VizPreview from "./VizPreview";
import { AnumBadge, BodyText, CardSurface, PressableCard, AppIcon, LoadingSpinner } from "./ui";
import PlainText from "./PlainText";
import MetaChips from "./MetaChips";

const PREVIEW_W = Platform.OS === "web" ? 120 : 80;
const PREVIEW_H = Platform.OS === "web" ? 72 : 52;

interface Props {
  sequence: OEISSequence;
  /** Skip thumbnail entirely (rare). */
  showPreview?: boolean;
  /** Row position: previews mount staggered so long lists stay responsive. */
  index?: number;
}

function ResultRow({ sequence, showPreview = true, index = 0 }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [previewReady, setPreviewReady] = useState(index < 4);

  useEffect(() => {
    if (previewReady || !showPreview) return;
    const t = setTimeout(() => setPreviewReady(true), 120 + Math.min(index, 24) * 90);
    return () => clearTimeout(t);
  }, [previewReady, showPreview, index]);
  return (
    <PressableCard
      onPress={() => router.push(`/visualize/${sequence.anum}`)}
      accessibilityLabel={`Visualize ${sequence.name}, ${sequence.anum}`}
      pressedOpacity={0.8}
      pressedScale={1}
      style={styles.outer}
    >
      <CardSurface variant="card" style={styles.row}>
        <AnumBadge anum={sequence.anum} size="sm" />
        <View style={styles.body}>
          <PlainText style={styles.name} numberOfLines={2}>
            {sequence.name}
          </PlainText>
          {sequence.terms && (
            <BodyText variant="caption" style={styles.terms} numberOfLines={1}>
              {sequence.terms.slice(0, 12).join(", ")}...
            </BodyText>
          )}
          <MetaChips anum={sequence.anum} name={sequence.name} compact />
        </View>
        {showPreview ? (
          <View style={styles.previewWrap} importantForAccessibility="no-hide-descendants">
            {previewReady ? (
              <ErrorBoundary fallbackText="Preview unavailable">
                <VizPreview
                  sequence={sequence}
                  width={PREVIEW_W}
                  height={PREVIEW_H}
                  preview
                />
              </ErrorBoundary>
            ) : (
              <View style={styles.previewLoading} testID="result-preview-loading">
                <LoadingSpinner />
              </View>
            )}
          </View>
        ) : null}
        <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
      </CardSurface>
    </PressableCard>
  );
}

export default memo(ResultRow);

const makeStyles = (colors: any) => StyleSheet.create({
  outer: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  terms: {
    marginTop: 3,
    fontVariant: ["tabular-nums"],
    marginBottom: 0,
  },
  previewWrap: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  previewLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
