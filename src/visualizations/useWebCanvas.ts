// src/visualizations/useWebCanvas.ts

import { useRef, useEffect, useCallback } from "react";
import { usePlayback } from "../playback/PlaybackContext";
import { resolveVizColor, vizGlowEnabled, vizMotionEnabled } from "./vizColorStore";

type DrawFn = (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => void;

/** The most-recently-mounted animated (full-view) canvas, for image export. */
export let currentWebCanvas: HTMLCanvasElement | null = null;

/**
 * @param animated When false (preview thumbnails), draw once — no RAF loop.
 */
export function useWebCanvas(
  width: number,
  height: number,
  draw: DrawFn,
  animated = true
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const speedRef = useRef(1);
  const playback = usePlayback();
  if (animated) {
    speedRef.current = playback.speed ?? 1;
  }

  const setRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasRef.current = el;
      if (!el || !animated) return;
      // surface the on-screen full-view canvas for image export
      currentWebCanvas = el;
      el.style.touchAction = "none";
    },
    [animated]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // glow setting (#11): gate every draw's shadowBlur in one place instead
    // of threading the toggle through each viz
    const proto = Object.getPrototypeOf(ctx);
    const blurDesc = Object.getOwnPropertyDescriptor(proto, "shadowBlur");
    if (blurDesc?.set) {
      Object.defineProperty(ctx, "shadowBlur", {
        get: () => blurDesc.get!.call(ctx),
        set: (v: number) => blurDesc.set!.call(ctx, vizGlowEnabled() ? v : 0),
        configurable: true,
      });
    }

    if (!animated) {
      ctx.clearRect(0, 0, width, height);
      draw(ctx, 0, width, height);
      return;
    }

    let elapsed = 0;
    let last = performance.now();

    const loop = (now: number) => {
      // motion off: freeze ambient time, keep redrawing for playback state
      if (vizMotionEnabled()) {
        elapsed += ((now - last) / 1000) * speedRef.current;
      }
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      draw(ctx, elapsed, width, height);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, draw, animated]);

  return setRef;
}

export function hslString(h: number, s: number, l: number): string {
  const resolved = resolveVizColor(h);
  if (resolved.kind === "hex") return resolved.hex;
  return `hsl(${resolved.hue}, ${s}%, ${l}%)`;
}
