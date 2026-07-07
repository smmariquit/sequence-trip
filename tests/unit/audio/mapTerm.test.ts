import { mapStepToNotes } from "../../../src/audio/mapTerm";
import { indexToFreq } from "../../../src/audio/scales";

describe("audio/scales", () => {
  it("maps indices to ascending pentatonic frequencies", () => {
    const a = indexToFreq(0, 60);
    const b = indexToFreq(1, 60);
    expect(b).toBeGreaterThan(a);
  });
});

describe("audio/mapTerm", () => {
  it("returns melody note for a term", () => {
    const notes = mapStepToNotes({ step: 3, term: "5", speed: 1 }, ["melody"]);
    expect(notes).toHaveLength(1);
    expect(notes[0].frequency).toBeGreaterThan(0);
    expect(notes[0].wave).toBe("sine");
  });

  it("combines multiple elements", () => {
    const notes = mapStepToNotes({ step: 4, term: "13", speed: 1 }, ["melody", "bass"]);
    expect(notes.length).toBe(2);
    expect(notes[1].frequency).toBeLessThan(notes[0].frequency);
  });

  it("emits digit arpeggio notes", () => {
    const notes = mapStepToNotes({ step: 2, term: "1234", speed: 1 }, ["digits"]);
    expect(notes.length).toBeGreaterThan(1);
  });

  it("emits rhythm hits on even steps", () => {
    const notes = mapStepToNotes({ step: 4, term: "10", speed: 1 }, ["rhythm"]);
    expect(notes.some((n) => n.drum === "kick")).toBe(true);
  });
});
