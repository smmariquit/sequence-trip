// src/components/VizCaption.tsx
//
// Compact status overlay at the bottom of the viz — guide expands on demand.

import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import type { OEISSequence } from "../sequences/types";
import { usePlayback } from "../playback/PlaybackContext";
import { colors } from "../theme";
import { safeAreaBottomCaption } from "../theme/layout";
import { spacing, radii } from "../theme/tokens";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import MathText from "./MathText";
import PlainText from "./PlainText";
import { captionForSequence } from "./vizCaptionText";
import AppIcon from "./ui/AppIcon";

function CaptionLine({
  text,
  style,
  numberOfLines,
}: {
  text: string;
  style: object;
  numberOfLines?: number;
}) {
  if (containsLatexDelimiters(text)) {
    return (
      <MathText style={style} numberOfLines={numberOfLines}>
        {text}
      </MathText>
    );
  }
  return (
    <PlainText style={style} numberOfLines={numberOfLines}>
      {text}
    </PlainText>
  );
}

export default function VizCaption({
  sequence,
  termCount,
}: {
  sequence: OEISSequence;
  termCount?: number;
}) {
  const { step } = usePlayback();
  const { live, guide } = captionForSequence(sequence, step, termCount);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <View style={styles.overlay} pointerEvents="box-none" testID="viz-caption">
      <View style={styles.bar} pointerEvents="auto">
        <View style={styles.liveRow}>
          <CaptionLine
            text={live}
            style={styles.live}
            numberOfLines={2}
          />
          <Pressable
            onPress={() => setGuideOpen((open) => !open)}
            style={({ pressed }) => [
              styles.guideBtn,
              guideOpen && styles.guideBtnOpen,
              pressed && styles.guideBtnPressed,
            ]}
            testID="viz-caption-guide"
            accessibilityRole="button"
            accessibilityLabel={guideOpen ? "Hide visualization guide" : "Show visualization guide"}
            accessibilityState={{ expanded: guideOpen }}
          >
            <AppIcon
              name={guideOpen ? "chevron-down" : "help-circle-outline"}
              size={18}
              color={guideOpen ? colors.primary : colors.textMuted}
            />
          </Pressable>
        </View>
        {guideOpen ? (
          <CaptionLine text={guide} style={styles.guide} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    backgroundColor: "rgba(14, 12, 24, 0.94)",
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: safeAreaBottomCaption(),
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  live: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    fontVariant: ["tabular-nums"],
  },
  guideBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guideBtnOpen: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryDim,
  },
  guideBtnPressed: {
    opacity: 0.85,
  },
  guide: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});
