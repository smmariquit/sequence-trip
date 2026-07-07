// src/components/VizColorSheet.tsx
//
// Color customization for the current visualization (#12): palette presets,
// hue rotation, glow toggle, and optional per-sequence save (#14).

import React, { useSyncExternalStore } from "react";
import { Modal, View, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useThemeColors } from "../theme";
import { palettes } from "../theme/palettes";
import { spacing, radii } from "../theme/tokens";
import PlainText from "./PlainText";
import {
  activeVizColors,
  clearPerSequenceOverride,
  hasPerSequenceOverride,
  PALETTE_LABELS,
  setVizColors,
  subscribeVizColors,
  vizColorVersion,
  type PaletteId,
  type VizColorSettings,
} from "../visualizations/vizColorStore";

const PALETTE_IDS = Object.keys(PALETTE_LABELS) as PaletteId[];

function swatchColors(id: PaletteId, hueOffset: number): string[] {
  if (id === "mono") return [`hsl(${hueOffset}, 90%, 60%)`];
  if (id === "rainbow")
    return [0, 90, 180, 270].map((h) => `hsl(${(h + hueOffset) % 360}, 90%, 60%)`);
  return palettes[id].filter((_, i) => i % 2 === 0).slice(0, 4);
}

export default function VizColorSheet({
  anum,
  visible,
  onClose,
}: {
  anum: string;
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  useSyncExternalStore(subscribeVizColors, vizColorVersion, vizColorVersion);

  const settings = activeVizColors();
  const overridden = hasPerSequenceOverride(anum);

  const update = (patch: Partial<VizColorSettings>) => {
    // editing writes to the scope currently in effect
    setVizColors({ ...settings, ...patch }, overridden ? { anum } : {});
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close color settings">
        <Pressable style={styles.sheet} onPress={() => {}} testID="viz-color-sheet">
          <PlainText style={styles.heading}>Visualization colors</PlainText>

          <View style={styles.paletteRow}>
            {PALETTE_IDS.map((id) => {
              const selected = settings.paletteId === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => update({ paletteId: id })}
                  style={[styles.palette, selected && styles.paletteActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${PALETTE_LABELS[id]} palette`}
                  testID={`viz-palette-${id}`}
                >
                  <View style={styles.swatchRow}>
                    {swatchColors(id, settings.hueOffset).map((c, i) => (
                      <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <PlainText style={selected ? styles.paletteLabelActive : styles.paletteLabel}>
                    {PALETTE_LABELS[id]}
                  </PlainText>
                </Pressable>
              );
            })}
          </View>

          <PlainText style={styles.label}>
            {settings.paletteId === "mono" ? "Accent hue" : "Hue rotation"}
          </PlainText>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={360}
            step={5}
            value={settings.hueOffset}
            onValueChange={(v: number) => update({ hueOffset: v })}
            minimumTrackTintColor={`hsl(${settings.hueOffset}, 90%, 60%)`}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            accessibilityLabel="Hue rotation"
          />

          <View style={styles.toggleRow}>
            <PlainText style={styles.label}>Glow</PlainText>
            <Pressable
              onPress={() => update({ glow: !settings.glow })}
              style={[styles.toggle, settings.glow && styles.toggleOn]}
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.glow }}
              accessibilityLabel="Toggle glow effect"
              testID="viz-color-glow"
            >
              <PlainText style={settings.glow ? styles.toggleTextOn : styles.toggleText}>
                {settings.glow ? "On" : "Off"}
              </PlainText>
            </Pressable>
          </View>

          <Pressable
            onPress={() =>
              overridden ? clearPerSequenceOverride(anum) : setVizColors(settings, { anum })
            }
            style={[styles.scopeBtn, overridden && styles.scopeBtnOn]}
            accessibilityRole="button"
            testID="viz-color-scope"
          >
            <PlainText style={overridden ? styles.toggleTextOn : styles.toggleText}>
              {overridden
                ? `Saved for ${anum} — tap to use global colors`
                : `Save just for ${anum}`}
            </PlainText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  palette: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: "center",
    gap: 4,
    minWidth: 76,
  },
  paletteActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 2,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  paletteLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  paletteLabelActive: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  label: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  slider: {
    width: "100%",
    height: 32,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOn: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextOn: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  scopeBtn: {
    marginTop: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scopeBtnOn: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
});
