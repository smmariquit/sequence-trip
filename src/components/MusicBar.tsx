// src/components/MusicBar.tsx

import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { colors } from "../theme";
import { spacing, radii, typography } from "../theme/tokens";
import { MUSIC_ELEMENTS } from "../audio/elements";
import { useMusic } from "../audio/MusicContext";
import type { MusicElementId } from "../audio/types";
import AppIcon from "./ui/AppIcon";

interface Props {
  /** When false, only the element chip row renders (toggle lives in Controls). */
  showHeader?: boolean;
}

export default function MusicBar({ showHeader = true }: Props) {
  const { enabled, toggleEnabled, elements, toggleElement } = useMusic();

  if (!enabled) return null;

  return (
    <View style={styles.wrap}>
      {showHeader ? (
        <View style={styles.header}>
          <View style={styles.labelRow}>
            <AppIcon name="musical-notes" size={16} color={colors.primary} />
            <Text style={styles.label}>Musicalize</Text>
          </View>
          <Pressable
            onPress={toggleEnabled}
            testID="music-toggle"
            accessibilityRole="button"
            accessibilityLabel="Mute sequence music"
            style={({ pressed }) => [styles.muteBtn, pressed && styles.muteBtnPressed]}
          >
            <AppIcon name="volume-high" size={18} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {MUSIC_ELEMENTS.map((el) => {
          const active = elements.includes(el.id);
          return (
            <ElementChip
              key={el.id}
              id={el.id}
              label={el.label}
              icon={el.icon}
              active={active}
              onPress={() => toggleElement(el.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function ElementChip({
  id,
  label,
  icon,
  active,
  onPress,
}: {
  id: MusicElementId;
  label: string;
  icon: (typeof MUSIC_ELEMENTS)[number]["icon"];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={`music-element-${id}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <AppIcon
        name={icon}
        size={14}
        color={active ? colors.primary : colors.textDim}
      />
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    ...typography.label,
  },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  muteBtnPressed: {
    opacity: 0.85,
  },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  chipText: {
    color: colors.textDim,
    ...typography.labelSm,
  },
  chipTextActive: {
    color: colors.primary,
  },
});
