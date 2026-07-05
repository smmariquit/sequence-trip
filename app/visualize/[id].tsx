// app/visualize/[id].tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getSequence } from "../../src/sequences/catalog";
import * as oeis from "../../src/oeis/db";
import type { OEISSequence } from "../../src/sequences/types";
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

function FullViz({
  seq,
  width,
  height,
}: {
  seq: OEISSequence;
  width: number;
  height: number;
}) {
  switch (seq.vizType) {
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
      // ponytail: generic visualizations land in Phase 2; terms readout until then
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTerms} numberOfLines={12}>
            {seq.terms?.join(", ")}
          </Text>
        </View>
      );
  }
}

export default function VisualizeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: W, height: H } = useWindowDimensions();
  const [dbSeq, setDbSeq] = useState<OEISSequence | null>(null);
  const [loading, setLoading] = useState(false);

  const catalogSeq = useMemo(() => getSequence(id ?? ""), [id]);

  useEffect(() => {
    if (catalogSeq || !id) return;
    setLoading(true);
    oeis
      .getById(id)
      .then(setDbSeq)
      .finally(() => setLoading(false));
  }, [id, catalogSeq]);

  const seq = catalogSeq ?? dbSeq;

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

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
        <FullViz seq={seq} width={W} height={H} />
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
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  placeholderTerms: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
