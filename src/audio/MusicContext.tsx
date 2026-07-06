// src/audio/MusicContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OEISSequence } from "../sequences/types";
import { usePlayback } from "../playback/PlaybackContext";
import { DEFAULT_ELEMENTS } from "./elements";
import { mapStepToNotes } from "./mapTerm";
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

    const notes = mapStepToNotes(
      { step, term: hit.term, prevTerm: hit.prevTerm, speed },
      elements
    );
    void playNotes(notes);
  }, [preview, enabled, playing, step, speed, sequence, elements]);

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
