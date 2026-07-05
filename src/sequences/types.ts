// src/sequences/types.ts

export interface OEISSequence {
  /** Canonical ID, e.g. "A000045". Used for routing and OEIS links. */
  anum: string;
  name: string;
  description?: string;
  /** Raw OEIS terms as strings — values routinely exceed Number range. */
  terms?: string[];
  /** Special visualization, if this sequence has one registered. */
  vizType?: VizType;
  /** Local generator override (featured sequences: more terms, offline). */
  generate?: (count: number) => number[];
}

export type VizType =
  | "recaman-arcs"
  | "fibonacci-spiral"
  | "ulam-spiral"
  | "collatz-tree"
  | "pascal-fractal"
  | "digit-flow";
