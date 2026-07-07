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

/**
 * Target step for a manual scrub of `delta` whole steps.
 * Idle-at-start (paused at step 0 with progress snapped to maxSteps to show
 * the finished viz): "next" starts the walk at 1, "previous" scrubs back from
 * the end. Mid-play, floor forward / ceil backward lands on the adjacent term
 * instead of skipping one. Never returns 0 going backward — paused step 0
 * means "idle", which renders the finished viz.
 */
export function scrubTarget(
  progress: number,
  step: number,
  delta: number,
  maxSteps: number
): number {
  const idle = step === 0 && progress >= maxSteps;
  const cur = idle ? (delta > 0 ? 0 : maxSteps) : progress;
  const base = delta > 0 ? Math.floor(cur) : Math.ceil(cur);
  return Math.max(delta < 0 ? 1 : 0, Math.min(maxSteps, base + delta));
}
