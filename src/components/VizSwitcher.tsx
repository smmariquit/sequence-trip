// src/components/VizSwitcher.tsx
//
// Chip row to switch between the applicable generic visualizations,
// plus a "?" chip explaining how the active viz encodes the sequence.
// Only rendered for sequences without a hand-crafted vizType.

import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "../theme";
import { spacing, radii } from "../theme/tokens";
import PlainText from "./PlainText";
import MathText from "./MathText";
import AppIcon from "./ui/AppIcon";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import type { GenericVizChoice, GenericVizKey } from "../visualizations/generic/select";

// chips stay visually compact; vertical slop brings the touch target to ~44dp
// without horizontal overlap between neighbors
const CHIP_HIT_SLOP = { top: 8, bottom: 8 };

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
  const [infoOpen, setInfoOpen] = useState(false);

  if (choices.length < 2) return null;
  const activeChoice = choices.find((c) => c.key === active) ?? choices[0];

  const guide = `${activeChoice.label}: ${activeChoice.guide}`;
  const GuideText = containsLatexDelimiters(guide) ? MathText : PlainText;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.row} testID="viz-switcher" accessibilityRole="tablist">
        {choices.map((c) => {
          const selected = c.key === activeChoice.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => onSelect(c.key)}
              hitSlop={CHIP_HIT_SLOP}
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
        <Pressable
          onPress={() => setInfoOpen((o) => !o)}
          hitSlop={CHIP_HIT_SLOP}
          style={({ pressed }) => [
            styles.chip,
            infoOpen && styles.chipActive,
            pressed && styles.chipPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            infoOpen ? "Hide visualization explanation" : "What does this visualization show?"
          }
          accessibilityState={{ expanded: infoOpen }}
          testID="viz-switcher-info"
        >
          <AppIcon
            name="help-circle-outline"
            size={16}
            color={infoOpen ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>
      {infoOpen ? (
        <View style={styles.infoPanel} testID="viz-switcher-guide">
          <GuideText style={styles.infoText}>{guide}</GuideText>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrap: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    alignItems: "flex-end",
    zIndex: 1,
    maxWidth: 420,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.xs,
    // opaque backing so the chips read as a control, not colliding with the
    // axis labels drawn on the canvas underneath
    backgroundColor: colors.bgElevated,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  infoPanel: {
    marginTop: spacing.xs,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
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
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
