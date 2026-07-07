// src/sequences/metadata.ts
//
// Beginner-friendly sequence metadata: math field tags (#3) and difficulty
// of understanding (#7). Phase A: curated map for well-known sequences plus
// a name-keyword heuristic for everything else (#5/#9 phased approach).

export type MathFieldId =
  | "number-theory"
  | "combinatorics"
  | "geometry"
  | "analysis"
  | "algebra"
  | "probability"
  | "recreational"
  | "fractals";

export interface MathField {
  label: string;
  /** One-liner for tooltips / About glossary. */
  description: string;
  /** Chip dot color — consistent per field across the app. */
  color: string;
}

export const MATH_FIELDS: Record<MathFieldId, MathField> = {
  "number-theory": {
    label: "Number theory",
    description: "Primes, divisors, and the hidden structure of whole numbers.",
    color: "#56E8FF",
  },
  combinatorics: {
    label: "Combinatorics",
    description: "Counting arrangements — how many ways can things combine?",
    color: "#39FF14",
  },
  geometry: {
    label: "Geometry",
    description: "Shapes, spirals, and where numbers land in space.",
    color: "#FFE62B",
  },
  analysis: {
    label: "Analysis",
    description: "Constants like π and e, limits, and digit expansions.",
    color: "#FF6B2B",
  },
  algebra: {
    label: "Algebra",
    description: "Polynomials, coefficients, and symbolic structure.",
    color: "#C4B5FD",
  },
  probability: {
    label: "Probability",
    description: "Randomness, expected values, and statistical patterns.",
    color: "#FF4A8D",
  },
  recreational: {
    label: "Recreational",
    description: "Puzzles and playful rules — math for the fun of it.",
    color: "#B44AFF",
  },
  fractals: {
    label: "Fractals",
    description: "Self-similar patterns that repeat at every scale.",
    color: "#00FFCC",
  },
};

export type DifficultyId = "beginner" | "intermediate" | "advanced";

export interface Difficulty {
  label: string;
  /** Tooltip / glossary copy. */
  description: string;
  /** Badge tint — calm, not traffic-light alarmist. */
  color: string;
}

export const DIFFICULTY: Record<DifficultyId, Difficulty> = {
  beginner: {
    label: "Beginner",
    description: "You can follow this with basic counting.",
    color: "#2DD4BF",
  },
  intermediate: {
    label: "Intermediate",
    description: "Some math vocabulary helps, but the viz carries you.",
    color: "#60A5FA",
  },
  advanced: {
    label: "Advanced",
    description: "Deep waters — easy to state, subtle to grasp.",
    color: "#F0ABFC",
  },
};

export interface SequenceMeta {
  fields: MathFieldId[];
  difficulty?: DifficultyId;
}

/** Curated metadata — difficulty measures how easy the RULE is to grasp,
 * not proof hardness. Extend freely; heuristic covers the rest. */
const CURATED: Record<string, SequenceMeta> = {
  A000045: { fields: ["combinatorics", "number-theory"], difficulty: "beginner" }, // Fibonacci
  A005132: { fields: ["recreational"], difficulty: "beginner" }, // Recamán
  A000040: { fields: ["number-theory"], difficulty: "intermediate" }, // Primes
  A006577: { fields: ["number-theory", "recreational"], difficulty: "intermediate" }, // Collatz steps
  A007318: { fields: ["combinatorics", "fractals"], difficulty: "beginner" }, // Pascal
  A000796: { fields: ["analysis"], difficulty: "beginner" }, // π digits
  A000079: { fields: ["combinatorics"], difficulty: "beginner" }, // 2^n
  A000142: { fields: ["combinatorics"], difficulty: "beginner" }, // n!
  A000108: { fields: ["combinatorics"], difficulty: "intermediate" }, // Catalan
  A000217: { fields: ["combinatorics", "geometry"], difficulty: "beginner" }, // triangular
  A000002: { fields: ["recreational"], difficulty: "advanced" }, // Kolakoski
  A004001: { fields: ["recreational"], difficulty: "advanced" }, // Hofstadter-Conway
  A005185: { fields: ["recreational"], difficulty: "advanced" }, // Hofstadter Q
  A006336: { fields: ["recreational", "geometry"], difficulty: "advanced" },
  A001113: { fields: ["analysis"], difficulty: "beginner" }, // e digits
  A002193: { fields: ["analysis"], difficulty: "beginner" }, // sqrt(2) digits
  A010060: { fields: ["recreational", "fractals"], difficulty: "intermediate" }, // Thue-Morse
  A007376: { fields: ["recreational"], difficulty: "beginner" }, // Champernowne
  A023811: { fields: ["fractals"], difficulty: "intermediate" },
  A001358: { fields: ["number-theory"], difficulty: "intermediate" }, // semiprimes
  A000961: { fields: ["number-theory"], difficulty: "intermediate" }, // prime powers
  A002378: { fields: ["number-theory", "geometry"], difficulty: "beginner" }, // oblong
  A001097: { fields: ["number-theory"], difficulty: "intermediate" }, // twin primes
  A005384: { fields: ["number-theory"], difficulty: "advanced" }, // Sophie Germain
  A000035: { fields: ["number-theory"], difficulty: "beginner" }, // parity
  A000959: { fields: ["number-theory", "recreational"], difficulty: "intermediate" }, // lucky
};

/** Name-keyword heuristic (#5 option 3) — fallback when not curated. */
const NAME_RULES: [RegExp, MathFieldId][] = [
  [/\bprimes?\b|divisor|factor|gcd|totient|congruen|modul|semiprime/i, "number-theory"],
  [/partition|permutation|binomial|catalan|combinat|number of ways|count of|arrangement/i, "combinatorics"],
  [/triangl|polygon|lattice|geometr|circle|sphere|hexagon/i, "geometry"],
  [/decimal expansion|digits? of|continued fraction|limit|convergen/i, "analysis"],
  [/polynomial|coefficient|matrix|group|determinant|character/i, "algebra"],
  [/random|probabilit|expected|distribution/i, "probability"],
  [/sierpinski|fractal|self-similar|cantor|dragon/i, "fractals"],
];

export function fieldsFromName(name: string): MathFieldId[] {
  const out: MathFieldId[] = [];
  for (const [re, id] of NAME_RULES) {
    if (re.test(name) && !out.includes(id)) out.push(id);
  }
  return out.slice(0, 2);
}

/** Metadata for any sequence: curated when known, name heuristic otherwise.
 * Difficulty only appears when curated — guessing it would mislead. */
export function metadataFor(anum: string, name?: string): SequenceMeta {
  const curated = CURATED[anum];
  if (curated) return curated;
  return { fields: name ? fieldsFromName(name) : [] };
}

/** A-numbers curated at a given difficulty — for browse groupings (#10). */
export function anumsByDifficulty(level: DifficultyId): string[] {
  return Object.keys(CURATED).filter((a) => CURATED[a].difficulty === level);
}
