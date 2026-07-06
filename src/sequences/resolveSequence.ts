// src/sequences/resolveSequence.ts

import * as oeis from "../oeis/db";
import { getSequence } from "./catalog";
import type { OEISSequence } from "./types";

export function mergeWithCatalog(db: OEISSequence | null, anum: string): OEISSequence | null {
  const cat = getSequence(anum);
  if (!cat && !db) return null;
  if (!cat) return db;
  if (!db) return cat;
  return {
    ...db,
    ...cat,
    name: cat.name ?? db.name,
    terms: db.terms ?? cat.terms,
    vizType: cat.vizType,
    generate: cat.generate,
    description: cat.description ?? db.description,
  };
}

export async function resolveSequence(anum: string): Promise<OEISSequence | null> {
  try {
    const db = await oeis.getById(anum);
    return mergeWithCatalog(db, anum);
  } catch (err) {
    console.warn(`Failed to resolve ${anum} from db:`, err);
    return mergeWithCatalog(null, anum);
  }
}

export async function resolveSequences(anums: string[]): Promise<Map<string, OEISSequence>> {
  const unique = [...new Set(anums)];
  const pairs = await Promise.all(
    unique.map(async (anum) => [anum, await resolveSequence(anum)] as const)
  );
  const map = new Map<string, OEISSequence>();
  for (const [anum, seq] of pairs) {
    if (seq) map.set(anum, seq);
  }
  return map;
}
