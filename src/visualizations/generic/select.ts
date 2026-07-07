// src/visualizations/generic/select.ts
//
// Ranks the generic visualizations for sequences without a hand-crafted
// vizType. The ranking is heuristic — driven by the shape of the data, not
// a hash — so the default viz always has a reason, and the user can switch
// to any other applicable viz.

import type { ComponentType } from "react";
import { normalize, termMod } from "../../sequences/normalize";
import BarWaveform from "./BarWaveform";
import LinePlot from "./LinePlot";
import ModGrid from "./ModGrid";
import PhasePlane from "./PhasePlane";
import PolarSpiral from "./PolarSpiral";
import TurtleWalk from "./TurtleWalk";
import type { GenericVizProps } from "./types";

export type GenericVizKey = "line" | "bars" | "grid" | "polar" | "turtle" | "phase";

export interface GenericVizChoice {
  key: GenericVizKey;
  /** Short name for the viz switcher chip. */
  label: string;
  Component: ComponentType<GenericVizProps>;
  /** One-line explanation of the encoding, shown in the caption guide. */
  guide: string;
}

/** Kept as the exported shape for callers that only need the default. */
export type GenericVizInfo = GenericVizChoice;

const CHOICES: Record<GenericVizKey, GenericVizChoice> = {
  line: {
    key: "line",
    label: "Line",
    Component: LinePlot,
    guide:
      "Horizontal axis = index $n$. Vertical axis = $a(n)$ (log-scaled when values are huge).",
  },
  bars: {
    key: "bars",
    label: "Bars",
    Component: BarWaveform,
    guide:
      "Bars around a midline: height = size of $a(n)$ (log scale); bars below the line are negative terms.",
  },
  grid: {
    key: "grid",
    label: "Grid",
    Component: ModGrid,
    guide:
      "One cell per term, reading left to right then top to bottom (like text); each cell is colored by $a(n)$.",
  },
  polar: {
    key: "polar",
    label: "Spiral",
    Component: PolarSpiral,
    guide:
      "Term $n$ sits at golden-angle turn $n$; distance from center = size of $a(n)$ (log scale).",
  },
  turtle: {
    key: "turtle",
    label: "Walk",
    Component: TurtleWalk,
    guide:
      "A walker draws the path, turning by $a(n) \\bmod 4$ at each step. Regular shapes mean the remainders repeat.",
  },
  phase: {
    key: "phase",
    label: "Phase",
    Component: PhasePlane,
    guide:
      "Each point pairs consecutive terms: $(a(n), a(n+1))$. Loops and lines reveal structure a value plot hides.",
  },
};

/**
 * Ordered list of applicable visualizations, best default first.
 * Judged on the first 48 terms (the stable DB prefix) so loading more
 * terms can't flip the chosen viz mid-session.
 */
export function rankGenericViz(terms: string[]): GenericVizChoice[] {
  const stats = normalize(terms.slice(0, 48));
  const { values } = stats;

  const binary = values.length > 0 && values.every((v) => v === 0 || v === 1);
  const monotone = values.every((v, i) => i === 0 || v >= values[i - 1]);
  // A turtle whose turns never vary just draws a polygon — meaningless.
  const turnsVary = new Set(stats.terms.map((t) => termMod(t, 4))).size >= 2;

  const order: GenericVizKey[] = binary
    ? // 0/1 pattern: raster shows the texture (Pascal-mod-2 style)
      ["grid", "turtle", "line", "phase"]
    : stats.hasNegative
      ? // signed data: bars around a midline make sign visible
        ["bars", "line", "phase", "turtle"]
      : monotone
        ? // growth curve: value-vs-index is the story
          ["line", "polar", "phase", "turtle"]
        : stats.smallRange
          ? // bounded, few distinct values: likely periodic — path/raster over line
            ["turtle", "grid", "line", "phase"]
          : // oscillating with real range: consecutive-term structure beats a value plot
            ["phase", "line", "polar", "turtle"];

  return order
    .filter(
      (k) =>
        (k !== "turtle" || turnsVary) &&
        // color grids of arbitrary values are mystery art — only for small ranges
        (k !== "grid" || binary || stats.smallRange)
    )
    .map((k) => CHOICES[k]);
}

export function pickGenericVizInfo(terms: string[]): GenericVizChoice {
  return rankGenericViz(terms)[0];
}

export function pickGenericViz(terms: string[]): ComponentType<GenericVizProps> {
  return pickGenericVizInfo(terms).Component;
}
