// src/audio/scales.ts

/** C-major pentatonic semitone offsets from root. */
const PENTATONIC = [0, 2, 4, 7, 9];

const A4 = 440;

export function midiToHz(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

/** Map a non-negative index into a pentatonic frequency (baseMidi ≈ C4). */
export function indexToFreq(index: number, baseMidi = 60): number {
  const i = ((index % 25) + 25) % 25;
  const octave = Math.floor(i / 5);
  const degree = PENTATONIC[i % 5];
  return midiToHz(baseMidi + octave * 12 + degree);
}
