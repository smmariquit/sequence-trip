// src/audio/AmbientContext.tsx
//
// Zen ambience on app entry (native). Cycle: on → low → off.

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { setAmbientLevel, type AmbientLevel } from "./ambient";

interface AmbientValue {
  level: AmbientLevel;
  cycleLevel: () => void;
}

const Ctx = createContext<AmbientValue>({ level: "off", cycleLevel: () => {} });

const ORDER: AmbientLevel[] = ["on", "low", "off"];

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<AmbientLevel>(
    Platform.OS === "web" ? "off" : "on"
  );

  useEffect(() => {
    void setAmbientLevel(level);
  }, [level]);

  const cycleLevel = useCallback(() => {
    setLevel((l) => ORDER[(ORDER.indexOf(l) + 1) % ORDER.length]);
  }, []);

  return <Ctx.Provider value={{ level, cycleLevel }}>{children}</Ctx.Provider>;
}

export const useAmbient = () => useContext(Ctx);
