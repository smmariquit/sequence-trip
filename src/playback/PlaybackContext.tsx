// src/playback/PlaybackContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

import { STEP_MS } from "./progressConstants";
import { nextProgress } from "./progress";

export { STEP_MS } from "./progressConstants";

interface Playback {
  speed: number;
  setSpeed: (s: number) => void;
  progressRef: React.MutableRefObject<number>;
  progressSV: SharedValue<number>;
  /** Integer step for captions (floor of progress). */
  step: number;
  maxSteps: number;
  playing: boolean;
  setMaxSteps: (n: number) => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  togglePlay: () => void;
}

const defaultProgressRef = { current: 0 };
const defaultProgressSV = { value: 0 } as SharedValue<number>;

const Ctx = createContext<Playback>({
  speed: 1,
  setSpeed: () => {},
  progressRef: defaultProgressRef,
  progressSV: defaultProgressSV,
  step: 0,
  maxSteps: 0,
  playing: false,
  setMaxSteps: () => {},
  play: () => {},
  pause: () => {},
  restart: () => {},
  togglePlay: () => {},
});

function useProgressTicker(
  playing: boolean,
  maxSteps: number,
  speed: number,
  progressRef: React.MutableRefObject<number>,
  progressSV: SharedValue<number>,
  onStep: (step: number) => void,
  onComplete: () => void
) {
  useEffect(() => {
    if (!playing || maxSteps <= 0) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const next = nextProgress(progressRef.current, dt, speed, maxSteps);
      progressRef.current = next;
      progressSV.value = next;

      const newStep = Math.floor(next);
      onStep(newStep);

      if (next >= maxSteps) {
        onComplete();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, maxSteps, speed, progressRef, progressSV, onStep, onComplete]);
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const [maxSteps, setMaxStepsState] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);
  const progressSV = useSharedValue(0);

  const setMaxSteps = useCallback((n: number) => {
    setMaxStepsState(n);
    progressRef.current = 0;
    progressSV.value = 0;
    setStep(0);
  }, [progressSV]);

  const play = useCallback(() => {
    if (step === 0 && maxSteps > 0 && progressRef.current >= maxSteps) {
      progressRef.current = 0;
      progressSV.value = 0;
    }
    setPlaying(true);
  }, [step, maxSteps, progressSV]);

  const pause = useCallback(() => setPlaying(false), []);

  const restart = useCallback(() => {
    progressRef.current = 0;
    progressSV.value = 0;
    setStep(0);
    setPlaying(true);
  }, [progressSV]);

  const togglePlay = useCallback(() => {
    setPlaying((wasPlaying) => {
      if (wasPlaying) return false;
      if (step === 0 && maxSteps > 0 && progressRef.current >= maxSteps) {
        progressRef.current = 0;
        progressSV.value = 0;
      }
      return true;
    });
  }, [step, maxSteps, progressSV]);

  const onStep = useCallback((newStep: number) => {
    setStep((s) => (s !== newStep ? newStep : s));
  }, []);

  const onComplete = useCallback(() => {
    setPlaying(false);
  }, []);

  useProgressTicker(
    playing,
    maxSteps,
    speed,
    progressRef,
    progressSV,
    onStep,
    onComplete
  );

  const value = useMemo(
    () => ({
      speed,
      setSpeed,
      progressRef,
      progressSV,
      step,
      maxSteps,
      playing,
      setMaxSteps,
      play,
      pause,
      restart,
      togglePlay,
    }),
    [
      speed,
      step,
      maxSteps,
      playing,
      setMaxSteps,
      play,
      pause,
      restart,
      togglePlay,
      progressRef,
      progressSV,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePlayback = () => useContext(Ctx);

export function useAnimSpeed(): number {
  return usePlayback().speed || 1;
}
