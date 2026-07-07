// src/visualizations/useWebCanvas.ts

import { useRef, useEffect, useCallback } from "react";
import { usePlayback } from "../playback/PlaybackContext";
import { resolveVizColor, vizGlowEnabled, vizMotionEnabled } from "./vizColorStore";

type DrawFn = (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => void;

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
  // wheel zoom + drag pan (full views only); identity when untouched
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0 });
  const playback = usePlayback();
  if (animated) {
    speedRef.current = playback.speed ?? 1;
  }

  const setRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasRef.current = el;
      if (!el || !animated) return;
      el.style.touchAction = "none";
      el.onwheel = (e) => {
        e.preventDefault();
        const v = viewRef.current;
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const next = Math.min(10, Math.max(1, v.scale * factor));
        const applied = next / v.scale;
        // zoom around the cursor
        v.ox = mx - (mx - v.ox) * applied;
        v.oy = my - (my - v.oy) * applied;
        v.scale = next;
        if (v.scale === 1) {
          v.ox = 0;
          v.oy = 0;
        }
      };
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      el.onpointerdown = (e) => {
        if (viewRef.current.scale === 1) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        el.setPointerCapture(e.pointerId);
      };
      el.onpointermove = (e) => {
        if (!dragging) return;
        viewRef.current.ox += e.clientX - lastX;
        viewRef.current.oy += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      el.onpointerup = () => {
        dragging = false;
      };
      el.ondblclick = () => {
        viewRef.current = { scale: 1, ox: 0, oy: 0 };
      };
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
      const v = viewRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, dpr * v.ox, dpr * v.oy);
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
