// src/visualizations/generic/select.ts
//
// Picks a generic visualization for sequences without a hand-crafted vizType.

import type { ComponentType } from "react";
import { normalize, termMod } from "../../sequences/normalize";
import BarWaveform from "./BarWaveform";
import LinePlot from "./LinePlot";
import ModGrid from "./ModGrid";
import PhasePlane from "./PhasePlane";
import PolarSpiral from "./PolarSpiral";
import TurtleWalk from "./TurtleWalk";
import type { GenericVizProps } from "./types";

export interface GenericVizInfo {
  Component: ComponentType<GenericVizProps>;
  /** One-line explanation of the encoding, shown in the caption guide. */
  guide: string;
}

const GUIDES = {
  line: "Horizontal axis = index $n$. Vertical axis = $a(n)$ (log-scaled when values are huge).",
  bars: "Bars around a midline: height = size of $a(n)$ (log scale); bars below the line are negative terms.",
  grid: "Grid of $a(n)$ values, one cell per term, colored by value.",
  polar:
    "Term $n$ sits at golden-angle turn $n$; distance from center = size of $a(n)$ (log scale).",
  turtle:
    "A walker draws the path, turning by $a(n) \\bmod 4$ at each step. Regular shapes mean the remainders repeat.",
  phase:
    "Each point pairs consecutive terms: $(a(n), a(n+1))$. Loops and lines reveal structure a value plot hides.",
} as const;

const VARIED: GenericVizInfo[] = [
  { Component: LinePlot, guide: GUIDES.line },
  { Component: PolarSpiral, guide: GUIDES.polar },
  { Component: TurtleWalk, guide: GUIDES.turtle },
  { Component: PhasePlane, guide: GUIDES.phase },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickGenericVizInfo(anum: string, terms: string[]): GenericVizInfo {
  const stats = normalize(terms);
  if (stats.hasNegative) return { Component: BarWaveform, guide: GUIDES.bars };
  // ModGrid only for 0/1 sequences (Pascal-mod-2 style). Otherwise a line plot
  // or path is easier to read than a mystery color grid.
  if (stats.values.length > 0 && stats.values.every((v) => v === 0 || v === 1)) {
    return { Component: ModGrid, guide: GUIDES.grid };
  }
  const pick = VARIED[hashStr(anum) % VARIED.length];
  // A turtle whose turns never vary just draws a polygon — meaningless.
  // Judge on the first 48 terms (the stable DB prefix) so loading more terms
  // can't flip the chosen viz mid-session.
  if (pick.Component === TurtleWalk) {
    const turns = new Set(stats.terms.slice(0, 48).map((t) => termMod(t, 4)));
    if (turns.size < 2) return VARIED[0];
  }
  return pick;
}

export function pickGenericViz(anum: string, terms: string[]): ComponentType<GenericVizProps> {
  return pickGenericVizInfo(anum, terms).Component;
}
