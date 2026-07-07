// src/components/VizSwitcher.tsx
//
// Chip row to switch between the applicable generic visualizations.
// Only rendered for sequences without a hand-crafted vizType.

import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "../theme";
import { spacing, radii } from "../theme/tokens";
import PlainText from "./PlainText";
import type { GenericVizChoice, GenericVizKey } from "../visualizations/generic/select";

export default function VizSwitcher({
  choices,
  active,
  onSelect,
}: {
  choices: GenericVizChoice[];
  /** Falls back to the first (heuristic default) choice. */
  active?: GenericVizKey;
  onSelect: (key: GenericVizKey) => void;
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  if (choices.length < 2) return null;
  const activeKey = choices.find((c) => c.key === active)?.key ?? choices[0].key;

  return (
    <View style={styles.row} testID="viz-switcher" accessibilityRole="tablist">
      {choices.map((c) => {
        const selected = c.key === activeKey;
        return (
          <Pressable
            key={c.key}
            onPress={() => onSelect(c.key)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
            accessibilityRole="tab"
            aria-selected={selected}
            accessibilityLabel={`${c.label} visualization`}
            testID={`viz-switcher-${c.key}`}
          >
            <PlainText style={selected ? styles.labelActive : styles.label}>
              {c.label}
            </PlainText>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
    zIndex: 1,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  chipPressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
