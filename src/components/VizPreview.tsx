// src/components/VizPreview.tsx

import React, { memo, useSyncExternalStore } from "react";
import { subscribeVizColors, vizColorVersion } from "../visualizations/vizColorStore";
import type { OEISSequence } from "../sequences/types";
import {
  RecamanArcs,
  FibonacciSpiral,
  UlamSpiral,
  CollatzTree,
  PascalFractal,
  DigitFlow,
} from "../visualizations";
import { rankGenericViz, type GenericVizKey } from "../visualizations/generic/select";

interface Props {
  sequence: OEISSequence;
  width: number;
  height: number;
  preview?: boolean;
  /** Full-screen featured viz: how many terms/steps to build. */
  count?: number;
  /** User-selected generic viz; defaults to the heuristic pick. */
  genericVizKey?: GenericVizKey;
}

function VizPreview({ sequence, width, height, preview = true, count, genericVizKey }: Props) {
  const isPreview = preview !== false;
  // remount every viz when color settings change — Skia worklets capture the
  // color store by value, so a fresh mount is what re-reads the settings
  const colorVersion = useSyncExternalStore(subscribeVizColors, vizColorVersion, vizColorVersion);
  const viz = renderViz();
  return viz ? <React.Fragment key={colorVersion}>{viz}</React.Fragment> : null;

  function renderViz() {
    switch (sequence.vizType) {
      case "recaman-arcs":
        return (
          <RecamanArcs width={width} height={height} count={count} preview={isPreview} />
        );
      case "fibonacci-spiral":
        return (
          <FibonacciSpiral width={width} height={height} count={count} preview={isPreview} />
        );
      case "ulam-spiral":
        return <UlamSpiral width={width} height={height} count={count} preview={isPreview} />;
      case "collatz-tree":
        return <CollatzTree width={width} height={height} count={count} preview={isPreview} />;
      case "pascal-fractal":
        return (
          <PascalFractal width={width} height={height} count={count} preview={isPreview} />
        );
      case "digit-flow":
        return <DigitFlow width={width} height={height} count={count} preview={isPreview} />;
      default: {
        if (!sequence.terms?.length) return null;
        const ranked = rankGenericViz(sequence.terms);
        const Viz = (ranked.find((c) => c.key === genericVizKey) ?? ranked[0]).Component;
        return <Viz terms={sequence.terms} width={width} height={height} preview={isPreview} />;
      }
    }
  }
}

export default memo(VizPreview);
