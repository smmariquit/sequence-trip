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
import { fetchMoreTerms } from "../../src/oeis/bfile";
import type { OEISSequence } from "../../src/sequences/types";
import Controls from "../../src/components/Controls";
import { PlaybackProvider } from "../../src/playback/PlaybackContext";
import { colors } from "../../src/theme";
import VizPreview from "../../src/components/VizPreview";

export default function VisualizeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: W, height: H } = useWindowDimensions();
  const [seq, setSeq] = useState<OEISSequence | null>(null);
  const [loading, setLoading] = useState(false);

  const catalogSeq = useMemo(() => getSequence(id ?? ""), [id]);

  useEffect(() => {
    if (catalogSeq) {
      setSeq(catalogSeq);
      return;
    }
    if (!id) {
      setSeq(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSeq(null);

    oeis
      .getById(id)
      .then((hit) => {
        if (cancelled) return;
        setSeq(hit);
        if (!hit?.terms?.length || hit.vizType) return;
        fetchMoreTerms(hit.anum).then((more) => {
          if (cancelled || !more || more.length <= hit.terms!.length) return;
          setSeq((prev) => (prev?.anum === hit.anum ? { ...prev, terms: more } : prev));
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, catalogSeq]);

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
        <VizPreview sequence={seq} width={W} height={H} preview={false} />
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
