// src/widget/snapshot.ts
//
// The home-screen widget's headless task must not open the 130MB sqlite db.
// The foreground app writes a slim JSON snapshot of the next 30 days' picks
// at launch; the widget task only reads that file.

import { Platform } from "react-native";
import { isoDate } from "../oeis/dayPick";
import { picksForDates } from "../oeis/db";
import { latexToUnicode } from "../math/latexToUnicode";

const SNAPSHOT_FILE = "widget-picks.json";
const DAYS = 30;

export interface WidgetPick {
  date: string;
  anum: string;
  name: string;
  terms: string[];
}

export async function writeWidgetSnapshot(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    const dates = Array.from({ length: DAYS }, (_, i) => isoDate(i));
    const picks = await picksForDates(dates);
    const slim: WidgetPick[] = picks.map((p) => ({
      date: p.date,
      anum: p.anum,
      // Widget TextWidget cannot render KaTeX.
      name: latexToUnicode(p.name),
      terms: p.terms.slice(0, 10),
    }));
    const { File, Paths } = await import("expo-file-system");
    new File(Paths.document, SNAPSHOT_FILE).write(JSON.stringify(slim));
  } catch {
    // widget just shows a fallback if the snapshot is missing
  }
}

export async function readTodayPick(): Promise<WidgetPick | null> {
  try {
    const { File, Paths } = await import("expo-file-system");
    const f = new File(Paths.document, SNAPSHOT_FILE);
    if (!f.exists) return null;
    const arr: WidgetPick[] = JSON.parse(await f.text());
    return arr.find((p) => p.date === isoDate()) ?? arr[0] ?? null;
  } catch {
    return null;
  }
}
