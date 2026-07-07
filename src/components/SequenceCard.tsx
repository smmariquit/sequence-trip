// src/components/SequenceCard.tsx

import React, { memo, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { useThemeColors } from "../theme";
import ErrorBoundary from "./ErrorBoundary";
import MathText from "./MathText";
import PlainText from "./PlainText";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import VizPreview from "./VizPreview";
import { AnumBadge, CardSurface, PressableCard, cardBorderStyles } from "./ui";
import { radii, spacing } from "../theme/tokens";

const PREVIEW_H = Platform.OS === "web" ? 200 : 180;

interface Props {
  sequence: OEISSequence;
  index: number;
  cardWidth: number;
}

function SequenceCard({ sequence, cardWidth }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const handlePress = useCallback(() => {
    router.push(`/visualize/${sequence.anum}`);
  }, [sequence.anum]);

  return (
    <PressableCard
      onPress={handlePress}
      accessibilityLabel={`Visualize ${sequence.name}, ${sequence.anum}`}
      style={[styles.cardOuter, { width: cardWidth }]}
    >
      <CardSurface variant="card" style={styles.card}>
        <View
          style={[styles.previewContainer, { width: cardWidth }]}
          importantForAccessibility="no-hide-descendants"
        >
          <ErrorBoundary fallbackText={`Preview: ${sequence.name}`}>
            <VizPreview
              sequence={sequence}
              width={cardWidth}
              height={PREVIEW_H}
              preview
            />
          </ErrorBoundary>
          <View style={[styles.previewOverlay, cardBorderStyles.bottom]} />
        </View>
        <View style={styles.info}>
          <View style={styles.header}>
            {containsLatexDelimiters(sequence.name) ? (
              <MathText style={styles.name} inline>
                {sequence.name}
              </MathText>
            ) : (
              <PlainText style={styles.name} numberOfLines={2}>
                {sequence.name}
              </PlainText>
            )}
            <AnumBadge anum={sequence.anum} />
          </View>
          {sequence.description ? (
            containsLatexDelimiters(sequence.description) ? (
              <MathText style={styles.description} numberOfLines={Platform.OS === "web" ? 3 : 2}>
                {sequence.description}
              </MathText>
            ) : (
              <PlainText
                style={styles.description}
                numberOfLines={Platform.OS === "web" ? 3 : 2}
              >
                {sequence.description}
              </PlainText>
            )
          ) : null}
        </View>
      </CardSurface>
    </PressableCard>
  );
}

export default memo(SequenceCard);

const makeStyles = (colors: any) => StyleSheet.create({
  cardOuter: {
    marginBottom: 20,
  },
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  previewContainer: {
    height: PREVIEW_H,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  description: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
});
