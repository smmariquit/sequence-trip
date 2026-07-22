// src/components/Controls.tsx

import React, { useState } from "react";
import { View, StyleSheet, Platform, Modal, Pressable, useWindowDimensions } from "react-native";
import { useThemeColors } from "../theme";
import * as Haptics from "expo-haptics";
import { usePlayback } from "../playback/PlaybackContext";
import { useMusic } from "../audio/MusicContext";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import { formatOeisLine } from "../oeis/oeisMath";
import { SPEEDS } from "./controlsConfig";
import { safeAreaTop } from "../theme/layout";
import { spacing, radii } from "../theme/tokens";
import MathText from "./MathText";
import PlainText from "./PlainText";
import MusicBar from "./MusicBar";
import MetaChips from "./MetaChips";
import VizColorSheet from "./VizColorSheet";
import PlaybackProgressBar from "./PlaybackProgressBar";
import {
  BackButton,
  BodyText,
  ExternalLink,
  PillButton,
  AppIcon,
} from "./ui";
import type { AppIconName } from "./ui/AppIcon";

interface Props {
  title: string;
  oeis: string;
  onEntryPress?: () => void;
  onTermsPress?: () => void;
  onExportPress?: () => void;
  termCount?: number;
  canLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

interface Action {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  testID: string;
}

export default function Controls({
  title,
  oeis,
  onEntryPress,
  onTermsPress,
  onExportPress,
  termCount,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  // phone-width: secondary actions collapse into an overflow sheet so the
  // title keeps its room. Wide (desktop web): show them inline.
  const narrow = width < 600;

  const [speedIdx, setSpeedIdx] = useState(SPEEDS.indexOf(1));
  const [colorsOpen, setColorsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { setSpeed, playing, togglePlay, restart, stepBy, maxSteps } = usePlayback();
  const { enabled: musicOn, toggleEnabled: toggleMusic } = useMusic();

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    setSpeed(SPEEDS[next]);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const haptic = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const showLoadMore = termCount != null && onLoadMore;

  // secondary actions, in priority order (music stays inline separately)
  const secondary: Action[] = [
    { icon: "color-palette-outline", label: "Colors", onPress: () => setColorsOpen(true), testID: "viz-colors-toggle" },
    ...(onExportPress ? [{ icon: "image-outline" as AppIconName, label: "Save as wallpaper", onPress: onExportPress, testID: "controls-export" }] : []),
    ...(onTermsPress ? [{ icon: "list-outline" as AppIconName, label: "View raw terms", onPress: onTermsPress, testID: "controls-terms" }] : []),
    ...(onEntryPress ? [{ icon: "document-text-outline" as AppIconName, label: "Full OEIS entry", onPress: onEntryPress, testID: "controls-entry" }] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <BackButton compact testID="controls-back" />
        <View style={styles.titleBlock}>
          {(() => {
            // OEIS names carry ASCII math ("a(n)=Sum{...}"), not $-delimited
            // LaTeX; formatOeisLine converts when the name is a formula
            const formatted = containsLatexDelimiters(title)
              ? { text: title, isMath: true }
              : formatOeisLine(title);
            return formatted.isMath ? (
              <MathText style={styles.title} numberOfLines={1} inline>
                {formatted.text}
              </MathText>
            ) : (
              <PlainText style={styles.title} numberOfLines={1}>
                {title}
              </PlainText>
            );
          })()}
          <View style={styles.titleMetaRow}>
            <ExternalLink url={`https://oeis.org/${oeis}`} label={oeis} inline />
            <MetaChips anum={oeis} name={title} compact />
          </View>
        </View>
        <View style={styles.navActions}>
          <PillButton
            variant={musicOn ? "primary" : "icon"}
            icon={musicOn ? "volume-high" : "volume-mute"}
            iconPosition="only"
            onPress={toggleMusic}
            testID="music-toggle"
            accessibilityLabel={musicOn ? "Mute sequence music" : "Play sequence music"}
          />
          {narrow ? (
            <PillButton
              variant="icon"
              icon="ellipsis-horizontal"
              iconPosition="only"
              onPress={() => setMoreOpen(true)}
              testID="controls-more"
              accessibilityLabel="More actions"
            />
          ) : (
            secondary.map((a) => (
              <PillButton
                key={a.testID}
                variant="icon"
                icon={a.icon}
                iconPosition="only"
                onPress={a.onPress}
                testID={a.testID}
                accessibilityLabel={a.label}
              />
            ))
          )}
        </View>
      </View>

      <View style={styles.transportRow}>
        <PillButton
          variant="icon"
          icon="refresh"
          iconPosition="only"
          onPress={() => {
            restart();
            haptic();
          }}
          accessibilityLabel="Restart animation"
        />
        <PillButton
          variant="icon"
          icon="play-skip-back"
          iconPosition="only"
          onPress={() => {
            stepBy(-1);
            haptic();
          }}
          testID="controls-step-back"
          accessibilityLabel="Previous term"
        />
        <PillButton
          variant="primary"
          icon={playing ? "pause" : "play"}
          iconPosition="only"
          onPress={() => {
            togglePlay();
            haptic();
          }}
          testID="controls-play"
          accessibilityLabel={playing ? "Pause" : "Play"}
          style={styles.playBtn}
        />
        <PillButton
          variant="icon"
          icon="play-skip-forward"
          iconPosition="only"
          onPress={() => {
            stepBy(1);
            haptic();
          }}
          testID="controls-step-forward"
          accessibilityLabel="Next term"
        />
        <PillButton
          variant="speed"
          icon="speedometer-outline"
          onPress={cycleSpeed}
          accessibilityLabel={`Playback speed ${SPEEDS[speedIdx]}x`}
        >
          {`${SPEEDS[speedIdx]}×`}
        </PillButton>
      </View>

      {maxSteps > 0 ? <PlaybackProgressBar /> : null}

      {termCount != null || musicOn ? (
        <View style={styles.bottomRow}>
          {termCount != null ? (
            <BodyText variant="caption" style={styles.termMeta} numberOfLines={1}>
              {`${termCount.toLocaleString()} terms`}
              {termCount >= 500 ? " · may lag" : ""}
            </BodyText>
          ) : null}
          {showLoadMore ? (
            <PillButton
              variant="action"
              icon="add-circle-outline"
              onPress={() => {
                onLoadMore();
                haptic();
              }}
              disabled={!canLoadMore || loadingMore}
              testID="controls-load-more"
              accessibilityLabel="Load more terms"
              style={styles.loadMoreBtn}
            >
              {loadingMore ? "…" : "More"}
            </PillButton>
          ) : null}
          <MusicBar showHeader={false} inline />
        </View>
      ) : null}
      <VizColorSheet anum={oeis} visible={colorsOpen} onClose={() => setColorsOpen(false)} />

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setMoreOpen(false)} accessibilityLabel="Close menu">
          <Pressable style={styles.sheet} onPress={() => {}} testID="controls-more-sheet">
            {secondary.map((a) => (
              <Pressable
                key={a.testID}
                onPress={() => {
                  setMoreOpen(false);
                  a.onPress();
                }}
                style={({ pressed }) => [styles.sheetRow, pressed && styles.sheetRowPressed]}
                accessibilityRole="button"
                testID={`more-${a.testID}`}
              >
                <AppIcon name={a.icon} size={22} color={colors.text} />
                <PlainText style={styles.sheetLabel}>{a.label}</PlainText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: safeAreaTop("controls"),
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingTop: 2,
  },
  titleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 23,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  transportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  playBtn: {
    flex: 1,
    minHeight: 48,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  loadMoreBtn: {
    paddingHorizontal: 12,
  },
  termMeta: {
    fontVariant: ["tabular-nums"],
    marginBottom: 0,
    flexShrink: 0,
  },
  sheetBackdrop: {
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
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sheetRowPressed: {
    backgroundColor: colors.surface,
  },
  sheetLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
