// src/oeis/bfile.ts
//
// On-demand fetch of OEIS b-files (thousands of terms) with a file cache.
// b-file format: "n a(n)" per line, # comments.

import { File, Directory, Paths } from "expo-file-system";

const MAX_BFILE_TERMS = 2000;

export async function fetchMoreTerms(anum: string): Promise<string[] | null> {
  const dir = new Directory(Paths.cache, "bfiles");
  const cached = new File(dir, `${anum}.txt`);
  let text: string;
  if (cached.exists) {
    text = await cached.text();
  } else {
    const num = anum.slice(1);
    try {
      const res = await fetch(`https://oeis.org/${anum}/b${num}.txt`);
      if (!res.ok) return null;
      text = await res.text();
    } catch {
      return null;
    }
    if (!dir.exists) dir.create({ intermediates: true });
    cached.write(text);
  }
  const terms: string[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 2) terms.push(parts[1]);
    if (terms.length >= MAX_BFILE_TERMS) break;
  }
  return terms.length > 0 ? terms : null;
}
