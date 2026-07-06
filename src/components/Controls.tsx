// src/components/Controls.tsx

import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { colors } from "../theme";
import * as Haptics from "expo-haptics";
import { usePlayback } from "../playback/PlaybackContext";
import { useMusic } from "../audio/MusicContext";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import { SPEEDS } from "./controlsConfig";
import { safeAreaTop } from "../theme/layout";
import { spacing } from "../theme/tokens";
import MathText from "./MathText";
import PlainText from "./PlainText";
import MusicBar from "./MusicBar";
import PlaybackProgressBar from "./PlaybackProgressBar";
import {
  BackButton,
  BodyText,
  ExternalLink,
  PillButton,
} from "./ui";

interface Props {
  title: string;
  oeis: string;
  onEntryPress?: () => void;
  termCount?: number;
  canLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function Controls({
  title,
  oeis,
  onEntryPress,
  termCount,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const [speedIdx, setSpeedIdx] = useState(1);
  const { setSpeed, playing, togglePlay, restart, maxSteps } = usePlayback();
  const { enabled: musicOn, toggleEnabled: toggleMusic } = useMusic();

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    setSpeed(SPEEDS[next]);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const haptic = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const showLoadMore = termCount != null && onLoadMore;

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <BackButton compact testID="controls-back" />
        <View style={styles.titleBlock}>
          {containsLatexDelimiters(title) ? (
            <MathText style={styles.title} numberOfLines={2} inline>
              {title}
            </MathText>
          ) : (
            <PlainText style={styles.title} numberOfLines={2}>
              {title}
            </PlainText>
          )}
          <ExternalLink
            url={`https://oeis.org/${oeis}`}
            label={oeis}
            inline
          />
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
          {onEntryPress ? (
            <PillButton
              variant="icon"
              icon="document-text-outline"
              iconPosition="only"
              onPress={onEntryPress}
              testID="controls-entry"
              accessibilityLabel="View full OEIS entry"
            />
          ) : null}
        </View>
      </View>

      <View style={styles.transportRow}>
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
          icon="refresh"
          iconPosition="only"
          onPress={() => {
            restart();
            haptic();
          }}
          accessibilityLabel="Restart animation"
        />
        <PillButton
          variant="speed"
          icon="speedometer-outline"
          onPress={cycleSpeed}
          accessibilityLabel={`Playback speed ${SPEEDS[speedIdx]}x`}
        >
          {`${SPEEDS[speedIdx]}×`}
        </PillButton>
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
      </View>

      {termCount != null ? (
        <BodyText variant="caption" style={styles.termMeta}>
          {`${termCount.toLocaleString()} terms`}
        </BodyText>
      ) : null}

      {maxSteps > 0 ? <PlaybackProgressBar /> : null}
      <MusicBar showHeader={false} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
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
    minHeight: 44,
  },
  loadMoreBtn: {
    paddingHorizontal: 12,
  },
  termMeta: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    fontVariant: ["tabular-nums"],
    marginBottom: 0,
  },
});
