import { captionForSequence, recamanCaption, collatzCaption, genericCaption } from "../../../src/components/vizCaptionText";
import type { OEISSequence } from "../../../src/sequences/types";

describe("captionForSequence", () => {
  it("describes Recamán at step zero", () => {
    const { live, guide } = recamanCaption(0);
    expect(live).toMatch(/Press Play/);
    expect(guide).toMatch(/semicircle/i);
  });

  it("updates live readout with term values", () => {
    const { live } = recamanCaption(3);
    expect(live).toMatch(/a\(3\) = \d+/);
    expect(live).not.toContain("$");
  });

  it("handles generic database sequences", () => {
    const seq: OEISSequence = {
      anum: "A000001",
      name: "Test",
      terms: ["1", "2", "3"],
    };
    const { live, guide } = genericCaption(seq, 2);
    expect(live).toMatch(/a\(2\) = 2/);
    // guide must describe the viz actually picked for these terms
    const { pickGenericVizInfo } = require("../../../src/visualizations/generic/select");
    expect(guide).toBe(pickGenericVizInfo(seq.terms).guide);
  });

  it("routes featured viz types", () => {
    const seq: OEISSequence = {
      anum: "A000796",
      name: "Pi",
      vizType: "digit-flow",
    };
    const { guide } = captionForSequence(seq, 0);
    expect(guide).toMatch(/\\pi/);
  });

  it("explains Collatz journeys in live + guide", () => {
    const { live, guide } = collatzCaption(0);
    expect(live).toMatch(/Press Play/);
    expect(guide).toMatch(/Collatz rule/);

    const playing = collatzCaption(3);
    expect(playing.live).toMatch(/Path 3\/40/);
    expect(playing.live).toMatch(/start n = 4/);
    expect(playing.live).toMatch(/→/);

    const extended = collatzCaption(50, 100);
    expect(extended.live).toMatch(/Path 50\/100/);
  });

  it("uses collatz caption for collatz-tree viz", () => {
    const seq: OEISSequence = {
      anum: "A006577",
      name: "Collatz",
      vizType: "collatz-tree",
      terms: ["0", "1", "2", "3"],
    };
    const { live } = captionForSequence(seq, 2);
    expect(live).toMatch(/Path 2/);
    expect(live).not.toMatch(/a\(n\)/);
  });
});
