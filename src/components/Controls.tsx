// src/components/Controls.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../theme";
import * as Haptics from "expo-haptics";

interface Props {
  title: string;
  oeis: string;
  onSpeedChange?: (speed: number) => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export default function Controls({ title, oeis, onSpeedChange }: Props) {
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    onSpeedChange?.(SPEEDS[next]);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{"←"}</Text>
        </Pressable>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.oeis}>{oeis}</Text>
        </View>
        <Pressable onPress={cycleSpeed} style={styles.speedBtn}>
          <Text style={styles.speedText}>{SPEEDS[speedIdx]}x</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(7, 6, 14, 0.75)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: colors.text,
    fontSize: 20,
  },
  titleArea: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  oeis: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  speedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  speedText: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
