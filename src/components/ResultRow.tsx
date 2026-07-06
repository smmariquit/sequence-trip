// src/components/ResultRow.tsx

import React, { memo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { useThemeColors } from "../theme";
import { radii, spacing } from "../theme/tokens";
import ErrorBoundary from "./ErrorBoundary";
import VizPreview from "./VizPreview";
import { AnumBadge, BodyText, CardSurface, PressableCard, AppIcon } from "./ui";
import PlainText from "./PlainText";

const PREVIEW_W = Platform.OS === "web" ? 120 : 80;
const PREVIEW_H = Platform.OS === "web" ? 72 : 52;

interface Props {
  sequence: OEISSequence;
  /** Skip thumbnail on web when false — saves canvas work in long result lists. */
  showPreview?: boolean;
}

function ResultRow({ sequence, showPreview = true }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <PressableCard
      onPress={() => router.push(`/visualize/${sequence.anum}`)}
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
        </View>
        {showPreview ? (
          <View style={styles.previewWrap}>
            <ErrorBoundary fallbackText="Preview unavailable">
              <VizPreview
                sequence={sequence}
                width={PREVIEW_W}
                height={PREVIEW_H}
                preview
              />
            </ErrorBoundary>
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
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
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
});
