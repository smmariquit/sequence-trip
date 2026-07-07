// src/components/MetaChips.tsx
//
// Math-field chips + difficulty badge for a sequence (#4, #8). Colored dot
// + muted label keeps AA contrast; colors stay consistent per field.

import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColors } from "../theme";
import { spacing, radii } from "../theme/tokens";
import PlainText from "./PlainText";
import {
  DIFFICULTY,
  MATH_FIELDS,
  metadataFor,
} from "../sequences/metadata";

export default function MetaChips({
  anum,
  name,
  compact,
}: {
  anum: string;
  name?: string;
  /** Tighter spacing for dense rows (search results). */
  compact?: boolean;
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const meta = metadataFor(anum, name);
  const difficulty = meta.difficulty ? DIFFICULTY[meta.difficulty] : null;

  if (meta.fields.length === 0 && !difficulty) return null;

  return (
    <View style={[styles.row, compact && styles.rowCompact]} testID={`meta-chips-${anum}`}>
      {difficulty ? (
        <View style={[styles.chip, { borderColor: difficulty.color }]}
          accessibilityLabel={`Difficulty: ${difficulty.label}. ${difficulty.description}`}
        >
          <View style={[styles.dot, { backgroundColor: difficulty.color }]} />
          <PlainText style={styles.label}>{difficulty.label}</PlainText>
        </View>
      ) : null}
      {meta.fields.map((f) => (
        <View
          key={f}
          style={styles.chip}
          accessibilityLabel={`Field: ${MATH_FIELDS[f].label}. ${MATH_FIELDS[f].description}`}
        >
          <View style={[styles.dot, { backgroundColor: MATH_FIELDS[f].color }]} />
          <PlainText style={styles.label}>{MATH_FIELDS[f].label}</PlainText>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  rowCompact: {
    marginTop: 3,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "500",
  },
});
