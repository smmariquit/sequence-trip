// src/sequences/types.ts

export interface OEISSequence {
  id: string;
  oeis: string;
  name: string;
  description: string;
  vizType: VizType;
  generate: (count: number) => number[];
}

export type VizType =
  | "recaman-arcs"
  | "fibonacci-spiral"
  | "ulam-spiral"
  | "collatz-tree"
  | "pascal-fractal"
  | "digit-flow";
