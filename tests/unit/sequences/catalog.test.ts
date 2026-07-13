import { sequences, getSequence, getVizType } from "../../../src/sequences/catalog";

describe("catalog", () => {
  it("lists featured sequences", () => {
    expect(sequences.length).toBeGreaterThanOrEqual(6);
  });

  it("finds Recamán by id", () => {
    const seq = getSequence("A005132");
    expect(seq?.vizType).toBe("recaman-arcs");
    expect(seq?.name).toMatch(/Recamán/i);
  });

  it("returns viz type helper", () => {
    expect(getVizType("A000045")).toBe("fibonacci-spiral");
    expect(getVizType("A999999")).toBeUndefined();
  });

  it("keeps catalog titles plain for native headers", () => {
    for (const sequence of sequences) {
      expect(sequence.name).not.toMatch(/[$\\]/);
    }
  });
});
