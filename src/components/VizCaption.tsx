// src/components/VizCaption.tsx
//
// Compact status overlay at the bottom of the viz — guide expands on demand.

import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import type { OEISSequence } from "../sequences/types";
import { usePlayback } from "../playback/PlaybackContext";
import { useThemeColors } from "../theme";
import { safeAreaBottomCaption } from "../theme/layout";
import { spacing, radii } from "../theme/tokens";
import { containsLatexDelimiters } from "../math/latexDelimiters";
import MathText from "./MathText";
import PlainText from "./PlainText";
import { captionForSequence } from "./vizCaptionText";
import type { GenericVizKey } from "../visualizations/generic/select";
import { useMusic } from "../audio/MusicContext";
import { termsAtStep } from "../audio/termsAtStep";
import { indexToNoteName } from "../audio/scales";
import { termMod } from "../sequences/normalize";
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
  genericVizKey,
}: {
  sequence: OEISSequence;
  termCount?: number;
  genericVizKey?: GenericVizKey;
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const { step } = usePlayback();
  const { enabled: musicOn } = useMusic();
  const { live, guide } = captionForSequence(sequence, step, termCount, genericVizKey);
  const [guideOpen, setGuideOpen] = useState(false);

  // music on: pin the melody note to the live readout — a(n) mod 25 picks it
  let liveText = live;
  if (musicOn && step > 0) {
    const t = termsAtStep(sequence, step);
    if (t) liveText += `  ·  ♪ ${indexToNoteName(termMod(t.term, 25))}`;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none" testID="viz-caption">
      <View style={styles.bar} pointerEvents="auto">
        <View style={styles.liveRow}>
          <CaptionLine
            text={liveText}
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
          <>
            <CaptionLine text={guide} style={styles.guide} />
            {musicOn ? (
              <CaptionLine
                text="♪ Pitch: $a(n) \bmod 25$ picks a note on a C-pentatonic scale — larger remainder, higher note. Bass follows $a(n) \bmod 15$; the digit voice plays the term's last digits."
                style={styles.guide}
              />
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    backgroundColor: colors.bgElevated,
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
    fontSize: 15,
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
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});
