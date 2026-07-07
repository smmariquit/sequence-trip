// src/audio/AmbientContext.tsx
//
// Zen ambience on app entry (native). Toggle + volume, persisted.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  applyAmbient,
  loadAmbientPrefs,
  saveAmbientPrefs,
  DEFAULT_AMBIENT,
  type AmbientPrefs,
} from "./ambient";

interface AmbientValue extends AmbientPrefs {
  toggle: () => void;
  setVolume: (v: number) => void;
}

const Ctx = createContext<AmbientValue>({
  ...DEFAULT_AMBIENT,
  enabled: false,
  toggle: () => {},
  setVolume: () => {},
});

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AmbientPrefs | null>(
    Platform.OS === "web" ? { ...DEFAULT_AMBIENT, enabled: false } : null
  );
  // null until persisted prefs load — otherwise a disabled user hears a blip
  // on launch. A user interaction before the load resolves must win over the
  // loaded value, never be clobbered by it.
  const touched = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    void loadAmbientPrefs().then((p) => {
      setPrefs((cur) => (touched.current ? cur : { ...p }));
    });
  }, []);

  useEffect(() => {
    if (!prefs) return;
    void applyAmbient(prefs);
    if (Platform.OS !== "web") void saveAmbientPrefs(prefs);
  }, [prefs]);

  const toggle = useCallback(() => {
    touched.current = true;
    setPrefs((p) => {
      const base = p ?? DEFAULT_AMBIENT;
      return { ...base, enabled: !base.enabled };
    });
  }, []);
  const setVolume = useCallback((v: number) => {
    touched.current = true;
    setPrefs((p) => ({
      ...(p ?? DEFAULT_AMBIENT),
      volume: Math.min(1, Math.max(0, v)),
    }));
  }, []);

  const value = prefs ?? DEFAULT_AMBIENT;
  return (
    <Ctx.Provider value={{ ...value, toggle, setVolume }}>{children}</Ctx.Provider>
  );
}

export const useAmbient = () => useContext(Ctx);
