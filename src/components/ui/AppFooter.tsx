// src/components/ui/AppFooter.tsx

import React from "react";
import { StyleSheet } from "react-native";
import { OEIS_ATTRIBUTION } from "../../constants/brand";
import { PAGE_PADDING } from "../../theme/layout";
import { spacing } from "../../theme/tokens";
import BodyText from "./BodyText";

export type AppFooterVariant = "home" | "info";

interface Props {
  variant?: AppFooterVariant;
  note?: string;
}

export default function AppFooter({ variant = "home", note }: Props) {
  if (variant === "info") {
    return (
      <BodyText variant="muted" style={styles.infoNote}>
        {note ?? "Made for exploring the beauty of integer sequences."}
      </BodyText>
    );
  }

  return (
    <BodyText variant="muted" style={styles.home}>
      {OEIS_ATTRIBUTION}
    </BodyText>
  );
}

const styles = StyleSheet.create({
  home: {
    textAlign: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: PAGE_PADDING,
  },
  infoNote: {
    marginTop: spacing.xxl,
    lineHeight: 19,
  },
});
