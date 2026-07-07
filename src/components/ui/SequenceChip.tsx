// src/components/ui/SequenceChip.tsx

import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useThemeColors } from "../../theme";
import { typography } from "../../theme/tokens";
import CardSurface from "./CardSurface";
import PressableCard from "./PressableCard";
import AppIcon from "./AppIcon";

interface Props {
  anum: string;
  onPress?: () => void;
}

export default function SequenceChip({ anum, onPress }: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const handlePress = onPress ?? (() => router.push(`/visualize/${anum}`));

  return (
    <PressableCard
      onPress={handlePress}
      accessibilityLabel={`Open sequence ${anum}`}
      pressedScale={0.97}
      pressedOpacity={0.9}
    >
      <CardSurface variant="chip">
        <View style={styles.row}>
          <Text style={styles.text}>{anum}</Text>
          <AppIcon name="chevron-forward" size={14} color={colors.textMuted} />
        </View>
      </CardSurface>
    </PressableCard>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    color: colors.interactive,
    ...typography.labelSm,
    fontVariant: ["tabular-nums"],
  },
});
