// src/components/ExploreCard.tsx

import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { useThemeColors, hslToHex } from "../theme";
import { radii, spacing } from "../theme/tokens";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import ErrorBoundary from "./ErrorBoundary";
import MathText from "./MathText";
import PlainText from "./PlainText";
import VizPreview from "./VizPreview";
import { AnumBadge, BodyText, CardSurface, PressableCard, AppIcon } from "./ui";

export const EXPLORE_CARD_W = 268;
const PREVIEW_H = 148;

function previewHue(anum: string): string {
  let n = 0;
  for (let i = 0; i < anum.length; i++) n += anum.charCodeAt(i);
  return hslToHex(n % 360, 55, 22);
}

interface Props {
  sequence: OEISSequence;
}

function ExploreCard({ sequence }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const termsLine = sequence.terms?.length
    ? `${sequence.terms.slice(0, 10).join(", ")}…`
    : null;

  return (
    <PressableCard
      onPress={() => router.push(`/visualize/${sequence.anum}`)}
      accessibilityLabel={`Visualize ${sequence.name}, ${sequence.anum}`}
      style={styles.outer}
      pressedScale={0.98}
    >
      <CardSurface variant="card" style={styles.card}>
        <View style={styles.previewWrap} importantForAccessibility="no-hide-descendants">
          {sequence.vizType || sequence.terms?.length ? (
            <ErrorBoundary fallbackText="Preview unavailable">
              <VizPreview
                sequence={sequence}
                width={EXPLORE_CARD_W}
                height={PREVIEW_H}
                preview
              />
            </ErrorBoundary>
          ) : (
            <View style={[styles.placeholder, { backgroundColor: previewHue(sequence.anum) }]}>
              <AppIcon name="analytics-outline" size={36} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <AnumBadge anum={sequence.anum} size="sm" />
          {containsLatexDelimiters(sequence.name) ? (
            <MathText style={styles.name} numberOfLines={2} inline>
              {sequence.name}
            </MathText>
          ) : (
            <PlainText style={styles.name} numberOfLines={2}>
              {sequence.name}
            </PlainText>
          )}
          {termsLine ? (
            <BodyText variant="caption" style={styles.terms} numberOfLines={1}>
              {termsLine}
            </BodyText>
          ) : null}
        </View>
      </CardSurface>
    </PressableCard>
  );
}

export default memo(ExploreCard);

const makeStyles = (colors: any) => StyleSheet.create({
  outer: {
    width: EXPLORE_CARD_W,
  },
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  previewWrap: {
    height: PREVIEW_H,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  terms: {
    fontVariant: ["tabular-nums"],
    marginBottom: 0,
  },
});
