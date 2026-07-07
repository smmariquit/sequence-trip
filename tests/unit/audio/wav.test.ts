import { padToWavUri } from "../../../src/audio/wav";

describe("padToWavUri", () => {
  it("produces a valid WAV data URI with a seamless loop seam", () => {
    const uri = padToWavUri([110, 165, 220, 330], 4, 22050);
    expect(uri.startsWith("data:audio/wav;base64,")).toBe(true);

    const bytes = Buffer.from(uri.split(",")[1], "base64");
    const samples = 4 * 22050;
    expect(bytes.length).toBe(44 + samples * 2);

    // All frequencies complete integer cycles over the loop, so the last
    // sample must land near the zero-crossing the first sample starts at.
    const first = bytes.readInt16LE(44);
    const last = bytes.readInt16LE(44 + (samples - 1) * 2);
    expect(first).toBe(0);
    expect(Math.abs(last)).toBeLessThan(1500); // < ~5% of full scale
  });
});
