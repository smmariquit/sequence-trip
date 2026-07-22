// app/(tabs)/settings.tsx
//
// Global app settings. Viz colors here edit the global default; the palette
// button on a visualize screen can still save per-sequence overrides.

import React, { useSyncExternalStore } from "react";
import { View, ScrollView, StyleSheet, Pressable, Platform, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { useThemeColors } from "../../src/theme";
import { VizColorControls } from "../../src/components/VizColorSheet";
import { AmbientVolumeRow } from "../../src/components/AmbientButton";
import { LogoTitleRow, SectionHeading } from "../../src/components/ui";
import PlainText from "../../src/components/PlainText";
import {
  musicSettings,
  musicSettingsVersion,
  SCALE_DESCRIPTIONS,
  SCALE_LABELS,
  setMusicSettings,
  subscribeMusicSettings,
  type ScaleId,
} from "../../src/audio/musicSettings";
import { MUSIC_ELEMENTS } from "../../src/audio/elements";
import AppIcon from "../../src/components/ui/AppIcon";
import { indexToNoteName } from "../../src/audio/scales";
import {
  notifySettings,
  notifyVersion,
  setNotifyEnabled,
  subscribeNotify,
} from "../../src/notifications/notifyStore";
import { cancelDaily, rescheduleDaily } from "../../src/notifications/scheduler";

const NOTE_ROOTS = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
import {
  MAX_INFO_WIDTH,
  PAGE_PADDING,
  safeAreaTop,
  tabBarScrollPadding,
  webContentColumn,
} from "../../src/theme/layout";
import { spacing } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  useSyncExternalStore(subscribeMusicSettings, musicSettingsVersion, musicSettingsVersion);
  useSyncExternalStore(subscribeNotify, notifyVersion, notifyVersion);
  const music = musicSettings();
  const notify = notifySettings();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="settings-screen"
      nativeID="main"
    >
      <View style={styles.hero}>
        <LogoTitleRow title="Settings" subtitle="Applies everywhere" size="page" />
      </View>

      <SectionHeading icon="color-palette-outline" padded={false}>Visualization colors</SectionHeading>
      <PlainText style={styles.note}>
        Sets the default for every sequence. To keep special colors for one
        sequence, use the palette button on its visualization screen.
      </PlainText>
      <View style={styles.panel}>
        <VizColorControls />
      </View>

      <SectionHeading icon="musical-notes" padded={false}>Sound</SectionHeading>
      <PlainText style={styles.note}>
        How terms turn into notes. A term picks a step on the chosen scale;
        the key slider moves the whole piece up or down.
      </PlainText>
      <PlainText style={styles.label}>Scale</PlainText>
      <View style={styles.chipRow}>
        {(Object.keys(SCALE_LABELS) as ScaleId[]).map((id) => {
          const selected = music.scaleId === id;
          return (
            <Pressable
              key={id}
              onPress={() => setMusicSettings({ ...music, scaleId: id })}
              style={[styles.chip, selected && styles.chipActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              testID={`music-scale-${id}`}
            >
              <PlainText style={selected ? styles.chipTextActive : styles.chipText}>
                {SCALE_LABELS[id]}
              </PlainText>
            </Pressable>
          );
        })}
      </View>
      <PlainText style={styles.scaleDescription}>
        {SCALE_DESCRIPTIONS[music.scaleId]}
      </PlainText>
      <PlainText style={styles.label}>{`Key: ${NOTE_ROOTS[music.rootShift]} (first note ${indexToNoteName(0)})`}</PlainText>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={11}
        step={1}
        value={music.rootShift}
        onValueChange={(v: number) => setMusicSettings({ ...music, rootShift: v })}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel="Key root shift"
      />
      <PlainText style={styles.label}>Instruments</PlainText>
      <PlainText style={styles.note}>
        Toggled per sequence on the visualization screen. What each one plays:
      </PlainText>
      <View style={styles.instrumentList}>
        {MUSIC_ELEMENTS.map((el) => (
          <View key={el.id} style={styles.instrumentRow}>
            <AppIcon name={el.icon} size={18} color={colors.primary} />
            <View style={styles.instrumentText}>
              <PlainText style={styles.instrumentName}>{el.label}</PlainText>
              <PlainText style={styles.instrumentDescription}>{el.description}</PlainText>
            </View>
          </View>
        ))}
      </View>

      {Platform.OS !== "web" ? (
        <>
          <PlainText style={styles.label}>Ambient sound</PlainText>
          <AmbientVolumeRow />
        </>
      ) : null}

      {Platform.OS !== "web" ? (
        <>
          <SectionHeading icon="notifications-outline" padded={false}>Notifications</SectionHeading>
          <PlainText style={styles.note}>
            A daily reminder naming the sequence of the day, around 9am. Tap it
            to jump straight to that sequence.
          </PlainText>
          <View style={styles.toggleRow}>
            <PlainText style={styles.label}>Daily sequence</PlainText>
            <Switch
              value={notify.enabled}
              onValueChange={(v) => {
                setNotifyEnabled(v);
                if (v) void rescheduleDaily();
                else void cancelDaily();
              }}
              testID="notify-toggle"
              accessibilityLabel="Daily sequence notification"
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: safeAreaTop("home"),
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: tabBarScrollPadding(),
    ...webContentColumn(MAX_INFO_WIDTH),
  },
  hero: {
    marginBottom: spacing.lg,
  },
  note: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  panel: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  scaleDescription: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  instrumentList: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  instrumentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  instrumentText: {
    flex: 1,
  },
  instrumentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  instrumentDescription: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 32,
  },
});
