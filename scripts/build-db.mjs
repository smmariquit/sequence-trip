// scripts/build-db.mjs
//
// Builds assets/oeis.db from the official OEIS dumps:
//   https://oeis.org/stripped.gz  (leading terms of every sequence)
//   https://oeis.org/names.gz     (sequence names)
// Data license: CC BY-SA 4.0, see https://oeis.org/wiki/The_OEIS_End-User_License_Agreement
//
// Usage: node scripts/build-db.mjs [dir-with-dumps]
//   Downloads the dumps into the dir if missing (default: scripts/.oeis-data).
//
// Uses better-sqlite3 (not node:sqlite) so this runs on Node 20 EAS builders.

import { createReadStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const MAX_TERMS = 48; // b-files are fetched on demand for more
const MAX_TERMS_CHARS = 400; // huge-value sequences get fewer stored terms
const dataDir = process.argv[2] ?? path.join(import.meta.dirname, ".oeis-data");
const dbPath = path.join(import.meta.dirname, "..", "assets", "oeis.db");

async function download(name) {
  const file = path.join(dataDir, name);
  if (existsSync(file) && statSync(file).size > 0) return file;
  console.log(`downloading ${name}...`);
  const res = await fetch(`https://oeis.org/${name}`, {
    headers: { "User-Agent": "sequence-trip-db-build" },
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(file));
  return file;
}

async function* lines(gzFile) {
  const rl = createInterface({
    input: createReadStream(gzFile).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.startsWith("#") && line.length > 0) yield line;
  }
}

mkdirSync(dataDir, { recursive: true });
const strippedGz = await download("stripped.gz");
const namesGz = await download("names.gz");

console.log("reading names...");
const names = new Map();
for await (const line of lines(namesGz)) {
  const sp = line.indexOf(" ");
  names.set(line.slice(0, sp), line.slice(sp + 1).trim());
}
console.log(`${names.size} names`);

rmSync(dbPath, { force: true });
mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = OFF");
db.pragma("synchronous = OFF");
db.exec(`
  CREATE TABLE seq (anum TEXT PRIMARY KEY, name TEXT NOT NULL, terms TEXT NOT NULL);
  CREATE VIRTUAL TABLE seq_fts USING fts5(name, content='seq', content_rowid='rowid', detail='none');
`);

console.log("inserting sequences...");
const ins = db.prepare("INSERT INTO seq (anum, name, terms) VALUES (?, ?, ?)");
const insFts = db.prepare("INSERT INTO seq_fts (rowid, name) VALUES (?, ?)");
db.exec("BEGIN");
let count = 0;
for await (const line of lines(strippedGz)) {
  const sp = line.indexOf(" ");
  const anum = line.slice(0, sp);
  const raw = line.slice(sp + 1).trim().replace(/^,|,$/g, "");
  let terms = raw.split(",").slice(0, MAX_TERMS).join(",");
  if (terms.length > MAX_TERMS_CHARS) {
    terms = terms.slice(0, MAX_TERMS_CHARS).replace(/,[^,]*$/, "");
  }
  const name = names.get(anum) ?? "";
  const { lastInsertRowid } = ins.run(anum, name, terms);
  insFts.run(lastInsertRowid, name);
  if (++count % 50000 === 0) console.log(count);
}
db.exec("COMMIT");
db.exec("INSERT INTO seq_fts(seq_fts) VALUES('optimize'); VACUUM;");
db.close();
console.log(`done: ${count} sequences -> ${dbPath} (${(statSync(dbPath).size / 1e6).toFixed(1)} MB)`);
