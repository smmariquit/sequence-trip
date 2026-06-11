// src/visualizations/useWebCanvas.ts

import { useRef, useEffect, useCallback } from "react";

type DrawFn = (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => void;

export function useWebCanvas(
  width: number,
  height: number,
  draw: DrawFn
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const setRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
  }, []);

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
    ctx.scale(dpr, dpr);
    startRef.current = performance.now();

    const loop = (now: number) => {
      const t = (now - startRef.current) / 1000;
      ctx.clearRect(0, 0, width, height);
      draw(ctx, t, width, height);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, draw]);

  return setRef;
}

export function hslString(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360}, ${s}%, ${l}%)`;
}
