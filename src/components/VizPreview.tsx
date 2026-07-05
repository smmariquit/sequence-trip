// src/components/VizPreview.tsx

import React from "react";
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
}

export default function VizPreview({ sequence, width, height, preview = true }: Props) {
  switch (sequence.vizType) {
    case "recaman-arcs":
      return <RecamanArcs width={width} height={height} preview={preview} />;
    case "fibonacci-spiral":
      return <FibonacciSpiral width={width} height={height} preview={preview} />;
    case "ulam-spiral":
      return <UlamSpiral width={width} height={height} preview={preview} />;
    case "collatz-tree":
      return <CollatzTree width={width} height={height} preview={preview} />;
    case "pascal-fractal":
      return <PascalFractal width={width} height={height} preview={preview} />;
    case "digit-flow":
      return <DigitFlow width={width} height={height} preview={preview} />;
    default: {
      if (!sequence.terms?.length) return null;
      const Viz = pickGenericViz(sequence.anum, sequence.terms);
      return <Viz terms={sequence.terms} width={width} height={height} preview={preview} />;
    }
  }
}
