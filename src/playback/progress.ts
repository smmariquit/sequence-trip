// src/playback/progress.ts

import { STEP_MS } from "./progressConstants";

export function nextProgress(
  current: number,
  dtMs: number,
  speed: number,
  maxSteps: number
): number {
  return Math.min(maxSteps, current + (dtMs / STEP_MS) * speed);
}

export function progressStep(progress: number): number {
  return Math.floor(progress);
}
