// src/components/VizPreview.tsx

import React, { memo } from "react";
import type { OEISSequence } from "../sequences/types";
import {
  RecamanArcs,
  FibonacciSpiral,
  UlamSpiral,
  CollatzTree,
  PascalFractal,
  DigitFlow,
} from "../visualizations";
import { pickGenericViz } from "../visualizations/generic/select";

interface Props {
  sequence: OEISSequence;
  width: number;
  height: number;
  preview?: boolean;
  /** Full-screen featured viz: how many terms/steps to build. */
  count?: number;
}

function VizPreview({ sequence, width, height, preview = true, count }: Props) {
  const isPreview = preview !== false;

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
      const Viz = pickGenericViz(sequence.anum, sequence.terms);
      return <Viz terms={sequence.terms} width={width} height={height} preview={isPreview} />;
    }
  }
}

export default memo(VizPreview);
