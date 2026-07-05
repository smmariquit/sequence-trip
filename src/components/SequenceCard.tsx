// src/components/SequenceCard.tsx

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { colors } from "../theme";
import ErrorBoundary from "./ErrorBoundary";
import VizPreview from "./VizPreview";

const PREVIEW_H = 180;

interface Props {
  sequence: OEISSequence;
  index: number;
}

export default function SequenceCard({ sequence, index }: Props) {
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.min(screenW - 32, 600);

  const handlePress = useCallback(() => {
    router.push(`/visualize/${sequence.anum}`);
  }, [sequence.anum]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { width: cardW, alignSelf: "center" as const },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.previewContainer, { width: cardW }]}>
        <ErrorBoundary fallbackText={`Preview: ${sequence.name}`}>
          <VizPreview sequence={sequence} width={cardW} height={PREVIEW_H} />
        </ErrorBoundary>
        <View style={styles.previewOverlay} />
      </View>
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{sequence.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sequence.anum}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {sequence.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  previewContainer: {
    height: PREVIEW_H,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    padding: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  description: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
});
