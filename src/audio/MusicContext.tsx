// src/audio/MusicContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OEISSequence } from "../sequences/types";
import { usePlayback, STEP_MS } from "../playback/PlaybackContext";
import { deltaLogs } from "../sequences/normalize";
import { DEFAULT_ELEMENTS } from "./elements";
import { mapStepToNotes, tempoSubNotes } from "./mapTerm";
import { termsAtStep } from "./termsAtStep";
import { playNotes, setAudioSuspended } from "./engine";
import type { MusicElementId } from "./types";

interface MusicContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  elements: MusicElementId[];
  toggleElement: (id: MusicElementId) => void;
}

const Ctx = createContext<MusicContextValue>({
  enabled: false,
  toggleEnabled: () => {},
  elements: DEFAULT_ELEMENTS,
  toggleElement: () => {},
});

export function MusicProvider({
  sequence,
  preview = false,
  children,
}: {
  sequence: OEISSequence;
  preview?: boolean;
  children: React.ReactNode;
}) {
  const { step, playing, speed } = usePlayback();
  const [enabled, setEnabled] = useState(false);
  const [elements, setElements] = useState<MusicElementId[]>(DEFAULT_ELEMENTS);
  const prevStepRef = useRef(0);
  const subTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Local steepness in symlog space — drives variable tempo sampling.
  const { deltas, maxDelta } = useMemo(() => {
    const d = sequence.terms?.length ? deltaLogs(sequence.terms) : [];
    let max = 0;
    for (const v of d) max = Math.max(max, Math.abs(v));
    return { deltas: d, maxDelta: max };
  }, [sequence.terms]);

  const toggleEnabled = useCallback(() => {
    setEnabled((on) => {
      const next = !on;
      setAudioSuspended(!next);
      return next;
    });
  }, []);

  const toggleElement = useCallback((id: MusicElementId) => {
    setElements((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length ? next : prev;
      }
      return [...prev, id];
    });
  }, []);

  useEffect(() => {
    if (preview || !enabled || !playing) return;
    if (step <= 0 || step === prevStepRef.current) return;

    prevStepRef.current = step;
    const hit = termsAtStep(sequence, step);
    if (!hit) return;

    const ctx = { step, term: hit.term, prevTerm: hit.prevTerm, speed };
    void playNotes(mapStepToNotes(ctx, elements));

    // Variable tempo: steeper local slope → more, denser sub-notes this step.
    if (elements.includes("melody") && maxDelta > 0) {
      const steep = Math.abs(deltas[step - 1] ?? 0) / maxDelta;
      const subCount = Math.min(3, Math.floor(steep * 4));
      const stepWindow = STEP_MS / Math.max(speed, 0.25);
      tempoSubNotes(ctx, subCount).forEach((note, i) => {
        const t = setTimeout(
          () => void playNotes([note]),
          ((i + 1) / (subCount + 1)) * stepWindow
        );
        subTimersRef.current.push(t);
      });
    }

    return () => {
      subTimersRef.current.forEach(clearTimeout);
      subTimersRef.current = [];
    };
  }, [preview, enabled, playing, step, speed, sequence, elements, deltas, maxDelta]);

  useEffect(() => {
    if (step === 0) prevStepRef.current = 0;
  }, [step]);

  useEffect(() => {
    if (!enabled) setAudioSuspended(true);
  }, [enabled]);

  return (
    <Ctx.Provider value={{ enabled, toggleEnabled, elements, toggleElement }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMusic = () => useContext(Ctx);
