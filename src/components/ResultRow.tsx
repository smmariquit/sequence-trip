// src/components/ResultRow.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import type { OEISSequence } from "../sequences/types";
import { colors } from "../theme";

export default function ResultRow({ sequence }: { sequence: OEISSequence }) {
  return (
    <Pressable
      onPress={() => router.push(`/visualize/${sequence.anum}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{sequence.anum}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {sequence.name}
        </Text>
        {sequence.terms && (
          <Text style={styles.terms} numberOfLines={1}>
            {sequence.terms.slice(0, 12).join(", ")}…
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  body: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  terms: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
});
