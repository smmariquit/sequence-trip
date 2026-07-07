// src/visualizations/vizColorStore.ts
//
// Viz color settings (#11): palette, hue offset, glow — global default plus
// optional per-sequence override (#14). Module-level store so the shared
// color helpers (hslString / hslToHex) can consult it without threading a
// context through every draw loop; UI subscribes for re-render/remount.

import { Platform } from "react-native";
import { palettes } from "../theme/palettes";

export type PaletteId = "rainbow" | "neon" | "acid" | "ocean" | "plasma" | "mono";

export interface VizColorSettings {
  paletteId: PaletteId;
  /** 0-360: rotates hues; for mono this IS the accent hue. */
  hueOffset: number;
  glow: boolean;
  /** Ambient motion: rotation, hue cycling, breathing. Off freezes them. */
  motion: boolean;
}

export const DEFAULT_VIZ_COLORS: VizColorSettings = {
  paletteId: "rainbow",
  hueOffset: 0,
  glow: true,
  motion: true,
};

export const PALETTE_LABELS: Record<PaletteId, string> = {
  rainbow: "Rainbow",
  neon: "Neon",
  acid: "Acid",
  ocean: "Ocean",
  plasma: "Plasma",
  mono: "Mono",
};

interface StoreShape {
  default: VizColorSettings;
  perAnum: Record<string, VizColorSettings>;
}

const PREFS_KEY = "viz-colors";
const PREFS_FILE = "viz-colors.json";

// Mutable state lives INSIDE objects: worklet closures freeze captured
// primitives at definition time but keep object references live, so
// `store.x` reads stay current while a bare `let` would go stale.
const store: StoreShape = { default: { ...DEFAULT_VIZ_COLORS }, perAnum: {} };
/** The sequence whose settings currently apply (set by the visualize screen). */
const active: { anum: string | null } = { anum: null };
let version = 0;
const listeners = new Set<() => void>();

function sanitize(raw: any): VizColorSettings {
  return {
    paletteId:
      raw && Object.prototype.hasOwnProperty.call(PALETTE_LABELS, raw.paletteId)
        ? raw.paletteId
        : DEFAULT_VIZ_COLORS.paletteId,
    hueOffset:
      raw && typeof raw.hueOffset === "number"
        ? ((raw.hueOffset % 360) + 360) % 360
        : DEFAULT_VIZ_COLORS.hueOffset,
    glow: raw && typeof raw.glow === "boolean" ? raw.glow : DEFAULT_VIZ_COLORS.glow,
    motion: raw && typeof raw.motion === "boolean" ? raw.motion : DEFAULT_VIZ_COLORS.motion,
  };
}

export async function loadVizColorPrefs(): Promise<void> {
  try {
    let raw: string | null = null;
    if (Platform.OS === "web") {
      raw = globalThis.localStorage?.getItem(PREFS_KEY) ?? null;
    } else {
      const { File, Paths } = await import("expo-file-system");
      const f = new File(Paths.document, PREFS_FILE);
      raw = f.exists ? await f.text() : null;
    }
    if (!raw) return;
    const parsed = JSON.parse(raw);
    store.default = sanitize(parsed.default);
    store.perAnum = Object.fromEntries(
      Object.entries(parsed.perAnum ?? {}).map(([a, s]) => [a, sanitize(s)])
    );
    bump();
  } catch {
    // best effort — defaults are fine
  }
}

async function persist(): Promise<void> {
  try {
    const raw = JSON.stringify(store);
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(PREFS_KEY, raw);
    } else {
      const { File, Paths } = await import("expo-file-system");
      new File(Paths.document, PREFS_FILE).write(raw);
    }
  } catch {
    // best effort
  }
}

function bump(): void {
  version++;
  listeners.forEach((l) => l());
}

export function subscribeVizColors(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function vizColorVersion(): number {
  return version;
}

export function setActiveAnum(anum: string | null): void {
  if (active.anum === anum) return;
  active.anum = anum;
  bump();
}

export function activeVizColors(): VizColorSettings {
  "worklet";
  return (active.anum && store.perAnum[active.anum]) || store.default;
}

export function hasPerSequenceOverride(anum: string): boolean {
  return !!store.perAnum[anum];
}

export function setVizColors(
  settings: VizColorSettings,
  scope: { anum?: string } = {}
): void {
  if (scope.anum) store.perAnum[scope.anum] = sanitize(settings);
  else store.default = sanitize(settings);
  bump();
  void persist();
}

export function clearPerSequenceOverride(anum: string): void {
  delete store.perAnum[anum];
  bump();
  void persist();
}

// --- color transform used by hslString (web) and hslToHex (native) ---

const PALETTE_STOPS: Record<Exclude<PaletteId, "rainbow" | "mono">, string[]> = {
  neon: palettes.neon,
  acid: palettes.acid,
  ocean: palettes.ocean,
  plasma: palettes.plasma,
};

/** Resolve an animated hue (deg) through the active settings.
 * Returns a hue for hsl composition, or a fixed hex for stop palettes. */
export function resolveVizColor(
  h: number
): { kind: "hue"; hue: number } | { kind: "hex"; hex: string } {
  "worklet";
  // worklet closures copy the store at creation; VizPreview remounts every
  // viz when settings change, so worklets are recreated with fresh values
  const s = activeVizColors();
  const hue = (((h + s.hueOffset) % 360) + 360) % 360;
  if (s.paletteId === "rainbow") return { kind: "hue", hue };
  if (s.paletteId === "mono") return { kind: "hue", hue: s.hueOffset };
  const stops = PALETTE_STOPS[s.paletteId];
  return { kind: "hex", hex: stops[Math.floor((hue / 360) * stops.length) % stops.length] };
}

export function vizGlowEnabled(): boolean {
  return activeVizColors().glow;
}

export function vizMotionEnabled(): boolean {
  return activeVizColors().motion;
}
