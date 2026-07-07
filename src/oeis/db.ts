// src/oeis/db.ts
//
// Bundled OEIS dataset (assets/oeis.db, built by scripts/build-db.mjs).
// Schema: seq(anum, name, terms)  +  seq_fts(name) FTS5 over names.

import { Platform } from "react-native";
import {
  importDatabaseFromAssetAsync,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import type { OEISSequence } from "../sequences/types";

interface Row {
  anum: string;
  name: string;
  terms: string;
}

function toSequence(r: Row): OEISSequence {
  return { anum: r.anum, name: r.name, terms: r.terms.split(",") };
}

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function open(): Promise<SQLiteDatabase> {
  // no-op if already imported (native file copy or web OPFS import)
  await importDatabaseFromAssetAsync("oeis.db", { assetId: require("../../assets/oeis.db") });
  return openDatabaseAsync("oeis.db");
}

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

/** Open/import the bundled DB early so first search is not janky. */
export function warmDb(): Promise<void> {
  return getDb().then(() => undefined);
}

export async function getById(anum: string): Promise<OEISSequence | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>("SELECT * FROM seq WHERE anum = ?", [
    anum.toUpperCase(),
  ]);
  return row ? toSequence(row) : null;
}

export async function searchNames(text: string, limit = 30): Promise<OEISSequence[]> {
  const db = await getDb();
  const tokens = text.match(/[A-Za-z0-9]+/g);
  if (!tokens) return [];

  // expo-sqlite's web wasm build has no FTS5 — a MATCH query kills the worker
  // and every pending promise hangs. LIKE scan instead (runs off-main-thread).
  if (Platform.OS === "web") {
    const where = tokens.map(() => "name LIKE ? ESCAPE '\\'").join(" AND ");
    const params = tokens.map((t) => `%${t.replace(/[%_\\]/g, "\\$&")}%`);
    const rows = await db.getAllAsync<Row>(
      `SELECT * FROM seq WHERE ${where} ORDER BY rowid LIMIT ?`,
      [...params, limit]
    );
    return rows.map(toSequence);
  }

  // quote each token for FTS5, prefix-match the last one as the user types
  const match = tokens.map((t, i) => `"${t}"${i === tokens.length - 1 ? "*" : ""}`).join(" ");
  const rows = await db.getAllAsync<Row>(
    `SELECT s.* FROM seq_fts f JOIN seq s ON s.rowid = f.rowid
     WHERE seq_fts MATCH ? ORDER BY f.rowid LIMIT ?`,
    [match, limit]
  );
  return rows.map(toSequence);
}

export async function searchTerms(terms: string, limit = 30): Promise<OEISSequence[]> {
  const db = await getDb();
  const needle = terms.replace(/\s+/g, "").replace(/^,|,$/g, "");
  if (!needle) return [];
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM seq WHERE ',' || terms || ',' LIKE ? ORDER BY rowid LIMIT ?`,
    [`%,${needle},%`, limit]
  );
  return rows.map(toSequence);
}

export async function random(): Promise<OEISSequence> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    "SELECT * FROM seq WHERE rowid = (ABS(RANDOM()) % (SELECT MAX(rowid) FROM seq)) + 1"
  );
  return toSequence(row!);
}

/** Deterministic per-day pick — same sequence for everyone on a given date. */
export async function sequenceOfTheDay(): Promise<OEISSequence> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const ch of today) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const row = await db.getFirstAsync<Row>(
    "SELECT * FROM seq WHERE rowid = (? % (SELECT MAX(rowid) FROM seq)) + 1",
    [hash]
  );
  return toSequence(row!);
}

/** Auto-detect query mode: A-number, raw terms, or name keywords. */
export async function search(query: string): Promise<OEISSequence[]> {
  const q = query.trim();
  if (!q) return [];
  if (/^a\d{1,6}$/i.test(q)) {
    const anum = "A" + q.slice(1).padStart(6, "0");
    const hit = await getById(anum);
    return hit ? [hit] : [];
  }
  if (/^[\d\s,-]+$/.test(q) && /\d/.test(q)) {
    return searchTerms(q);
  }
  return searchNames(q);
}
