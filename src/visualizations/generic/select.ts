// src/visualizations/generic/select.ts
//
// Picks a generic visualization for sequences without a hand-crafted vizType.

import type { ComponentType } from "react";
import { normalize } from "../../sequences/normalize";
import BarWaveform from "./BarWaveform";
import LinePlot from "./LinePlot";
import ModGrid from "./ModGrid";
import PolarSpiral from "./PolarSpiral";
import TurtleWalk from "./TurtleWalk";
import type { GenericVizProps } from "./types";

const VARIED = [LinePlot, PolarSpiral, TurtleWalk];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickGenericViz(anum: string, terms: string[]): ComponentType<GenericVizProps> {
  const stats = normalize(terms);
  if (stats.smallRange) return ModGrid;
  if (stats.hasNegative) return BarWaveform;
  return VARIED[hashStr(anum) % VARIED.length];
}
