// app/visualize/[id].tsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  type LayoutChangeEvent,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getSequence } from "../../src/sequences/catalog";
import * as oeis from "../../src/oeis/db";
import type { OEISSequence } from "../../src/sequences/types";
import Controls from "../../src/components/Controls";
import { PlaybackProvider } from "../../src/playback/PlaybackContext";
import { MusicProvider } from "../../src/audio/MusicContext";
import { useThemeColors } from "../../src/theme";
import VizPreview from "../../src/components/VizPreview";
import VizCaption from "../../src/components/VizCaption";
import SequenceEntryPanel from "../../src/components/SequenceEntryPanel";
import { CenteredState } from "../../src/components/ui";
import { useSequenceTermCount } from "../../src/hooks/useSequenceTermCount";

export default function VisualizeScreen() {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const catalogSeq = useMemo(() => getSequence(id ?? ""), [id]);
  const [dbSeq, setDbSeq] = useState<OEISSequence | null>(null);
  const [loading, setLoading] = useState(() => !catalogSeq && !!id);
  const [vizSize, setVizSize] = useState({ width: 0, height: 0 });
  const [entryOpen, setEntryOpen] = useState(false);

  const seq = catalogSeq ?? dbSeq;

  const {
    termCount,
    displaySequence,
    loadMore,
    loadingMore,
    canLoadMore,
  } = useSequenceTermCount(seq, setDbSeq);

  const onVizLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setVizSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  useEffect(() => {
    if (catalogSeq) {
      setDbSeq(null);
      setLoading(false);
      return;
    }
    if (!id) {
      setDbSeq(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setDbSeq(null);

    oeis
      .getById(id)
      .then((hit) => {
        if (cancelled) return;
        setDbSeq(hit);
      })
      .catch((err) => {
        console.warn("Failed to load sequence", id, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, catalogSeq]);

  if (loading) {
    return <CenteredState loading />;
  }

  if (!seq || !displaySequence) {
    return <CenteredState message="Sequence not found" />;
  }

  return (
    <PlaybackProvider>
      <MusicProvider sequence={displaySequence}>
        <View style={styles.container} testID="visualize-screen" nativeID="main">
          <Controls
            title={seq.name}
            oeis={seq.anum}
            onEntryPress={() => setEntryOpen(true)}
            termCount={termCount}
            canLoadMore={canLoadMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
          <View
            style={styles.vizArea}
            onLayout={onVizLayout}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Animated visualization of ${seq.name}`}
          >
            {vizSize.width > 0 && vizSize.height > 0 && (
              <>
                <VizPreview
                  sequence={displaySequence}
                  width={vizSize.width}
                  height={vizSize.height}
                  preview={false}
                  count={seq.vizType ? termCount : undefined}
                />
                <VizCaption sequence={displaySequence} termCount={termCount} />
              </>
            )}
          </View>
          <SequenceEntryPanel
            anum={seq.anum}
            visible={entryOpen}
            onClose={() => setEntryOpen(false)}
          />
        </View>
      </MusicProvider>
    </PlaybackProvider>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  vizArea: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    position: "relative",
  },
});
