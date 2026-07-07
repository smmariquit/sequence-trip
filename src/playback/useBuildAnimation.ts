// src/playback/useBuildAnimation.ts
//
// Smooth fractional construction progress.
// Web canvas reads progressRef each frame; native Skia uses progressSV.

import { useEffect, useRef, useState } from "react";
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { usePlayback } from "./PlaybackContext";

export interface BuildAnimation {
  progressRef: React.MutableRefObject<number>;
  progressSV: SharedValue<number>;
  step: number;
}

function useLocalBuildAnimation(totalSteps: number, enabled: boolean): BuildAnimation {
  const progressRef = useRef(0);
  const progressSV = useSharedValue(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    progressRef.current = totalSteps;
    progressSV.value = totalSteps;
    setStep(totalSteps);
  }, [enabled, totalSteps, progressSV]);

  return { progressRef, progressSV, step: enabled ? step : 0 };
}

function useContextBuildAnimation(totalSteps: number, enabled: boolean): BuildAnimation {
  const { progressRef, progressSV, step, playing, setMaxSteps } = usePlayback();

  useEffect(() => {
    if (!enabled || totalSteps <= 0) return;
    setMaxSteps(totalSteps);
  }, [enabled, totalSteps, setMaxSteps]);

  const idleAtStart = enabled && !playing && step === 0 && totalSteps > 0;

  useEffect(() => {
    if (!idleAtStart) return;
    progressRef.current = totalSteps;
    progressSV.value = totalSteps;
  }, [idleAtStart, totalSteps, progressRef, progressSV]);

  const drawStep = idleAtStart ? totalSteps : Math.min(step, totalSteps);

  return {
    progressRef,
    progressSV,
    step: enabled ? drawStep : 0,
  };
}

export function useBuildAnimation(totalSteps: number, preview?: boolean): BuildAnimation {
  const local = useLocalBuildAnimation(totalSteps, !!preview);
  const ctx = useContextBuildAnimation(totalSteps, !preview);
  return preview ? local : ctx;
}

/** 0→1 reveal fraction for the item at `index`, driven on the UI thread. */
export function useItemFrac(
  progressSV: SharedValue<number>,
  index: number
): SharedValue<number> {
  return useDerivedValue(() => {
    const v = progressSV.value - index;
    return v <= 0 ? 0 : v >= 1 ? 1 : v;
  }, [index]);
}
