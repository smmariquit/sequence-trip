// src/oeis/db.web.ts
//
// ponytail: web demo runs featured-only — the 130MB bundled SQLite DB is
// native-only. Full search needs the app.

import { sequences } from "../sequences/catalog";
import type { OEISSequence } from "../sequences/types";

export async function getById(anum: string): Promise<OEISSequence | null> {
  return sequences.find((s) => s.anum === anum.toUpperCase()) ?? null;
}

export async function searchNames(text: string): Promise<OEISSequence[]> {
  const q = text.toLowerCase();
  return sequences.filter((s) => s.name.toLowerCase().includes(q));
}

export async function searchTerms(_terms: string): Promise<OEISSequence[]> {
  return [];
}

export async function random(): Promise<OEISSequence> {
  return sequences[Math.floor(Math.random() * sequences.length)];
}

export async function sequenceOfTheDay(): Promise<OEISSequence> {
  const day = Math.floor(Date.now() / 86400000);
  return sequences[day % sequences.length];
}

export async function search(query: string): Promise<OEISSequence[]> {
  const q = query.trim();
  if (!q) return [];
  if (/^a\d{1,6}$/i.test(q)) {
    const hit = await getById("A" + q.slice(1).padStart(6, "0"));
    return hit ? [hit] : [];
  }
  return searchNames(q);
}
