// src/audio/engine.web.ts

import type { NoteSpec } from "./types";

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  playNotes(notes: NoteSpec[]) {
    const ctx = this.ensure();
    const t0 = ctx.currentTime;
    for (const note of notes) {
      if (note.drum) {
        this.playDrum(ctx, note, t0);
      } else {
        this.playOsc(ctx, note, t0);
      }
    }
  }

  private playOsc(ctx: AudioContext, note: NoteSpec, t0: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.wave;
    osc.frequency.value = note.frequency;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(note.gain, 0.0001), t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.duration);
    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(t0);
    osc.stop(t0 + note.duration + 0.04);
  }

  private playDrum(ctx: AudioContext, note: NoteSpec, t0: number) {
    const gain = ctx.createGain();
    gain.connect(this.master!);

    if (note.drum === "kick") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, t0);
      osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.08);
      gain.gain.setValueAtTime(note.gain, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.duration);
      osc.connect(gain);
      osc.start(t0);
      osc.stop(t0 + note.duration + 0.02);
      return;
    }

    if (note.drum === "snare") {
      const len = Math.floor(ctx.sampleRate * note.duration);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const env = 1 - i / len;
        data[i] = (Math.random() * 2 - 1) * env * note.gain;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(gain);
      src.start(t0);
      return;
    }

    // hi-hat — short noise burst
    const len = Math.floor(ctx.sampleRate * note.duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, 2);
      data[i] = (Math.random() * 2 - 1) * env * note.gain;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    src.start(t0);
  }

  suspend() {
    void this.ctx?.suspend();
  }

  resume() {
    void this.ctx?.resume();
  }
}

let engine: WebAudioEngine | null = null;

export function playNotes(notes: NoteSpec[]) {
  if (!notes.length) return;
  if (!engine) engine = new WebAudioEngine();
  engine.playNotes(notes);
}

export function setAudioSuspended(suspended: boolean) {
  if (!engine) return;
  if (suspended) engine.suspend();
  else engine.resume();
}
