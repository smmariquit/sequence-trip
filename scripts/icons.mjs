#!/usr/bin/env node
// Regenerate PNG icon assets from assets/logo.svg and assets/logo-mark.svg.
// Requires: rsvg-convert (librsvg2-tools)

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets");

const jobs = [
  ["logo.svg", "icon.png", 1024],
  ["logo-mark.svg", "adaptive-icon.png", 1024],
  ["logo.svg", "favicon.png", 512],
  ["logo.svg", "splash-icon.png", 200],
  ["logo.svg", "apple-touch-icon.png", 180],
];

for (const [src, dest, size] of jobs) {
  const inPath = path.join(assets, src);
  const outPath = path.join(assets, dest);
  execSync(`rsvg-convert -w ${size} -h ${size} "${inPath}" -o "${outPath}"`, {
    stdio: "inherit",
  });
  console.log(`${dest} (${size}px)`);
}

const pub = path.join(root, "public");
execSync(`mkdir -p "${pub}"`);
for (const file of ["logo.svg", "favicon.png", "apple-touch-icon.png", "icon.png"]) {
  execSync(`cp "${path.join(assets, file)}" "${path.join(pub, file)}"`);
}
console.log("public/ web icons synced");
