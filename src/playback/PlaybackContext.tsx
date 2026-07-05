// src/playback/PlaybackContext.tsx

import React, { createContext, useContext, useState } from "react";

interface Playback {
  speed: number;
  setSpeed: (s: number) => void;
}

const Ctx = createContext<Playback>({ speed: 1, setSpeed: () => {} });

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [speed, setSpeed] = useState(1);
  return <Ctx.Provider value={{ speed, setSpeed }}>{children}</Ctx.Provider>;
}

export const usePlayback = () => useContext(Ctx);
