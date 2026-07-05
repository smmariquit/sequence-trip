// app/visualize/[id].tsx

import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getSequence } from "../../src/sequences/catalog";
import Controls from "../../src/components/Controls";
import { PlaybackProvider } from "../../src/playback/PlaybackContext";
import { colors } from "../../src/theme";
import {
  RecamanArcs,
  FibonacciSpiral,
  UlamSpiral,
  CollatzTree,
  PascalFractal,
  DigitFlow,
} from "../../src/visualizations";

function FullViz({ vizType, width, height }: { vizType: string; width: number; height: number }) {
  switch (vizType) {
    case "recaman-arcs":
      return <RecamanArcs width={width} height={height} count={80} />;
    case "fibonacci-spiral":
      return <FibonacciSpiral width={width} height={height} count={500} />;
    case "ulam-spiral":
      return <UlamSpiral width={width} height={height} count={3000} />;
    case "collatz-tree":
      return <CollatzTree width={width} height={height} count={60} />;
    case "pascal-fractal":
      return <PascalFractal width={width} height={height} count={160} />;
    case "digit-flow":
      return <DigitFlow width={width} height={height} count={500} />;
    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unknown visualization</Text>
        </View>
      );
  }
}

export default function VisualizeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: W, height: H } = useWindowDimensions();
  const seq = useMemo(() => getSequence(id ?? ""), [id]);

  if (!seq) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Sequence not found</Text>
      </View>
    );
  }

  return (
    <PlaybackProvider>
      <View style={styles.container}>
        <FullViz vizType={seq.vizType ?? ""} width={W} height={H} />
        <Controls title={seq.name} oeis={seq.anum} />
      </View>
    </PlaybackProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  errorText: {
    color: colors.textDim,
    fontSize: 16,
  },
});
