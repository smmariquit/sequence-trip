import {
  MAX_GUESSES,
  PUZZLE_COUNT,
  challengeFor,
  dailyPuzzleByAnum,
  dailyPuzzle,
  isCorrectGuess,
  normalizeIntegerGuess,
  practicePuzzle,
  shareText,
  statsFor,
  type DailyPlay,
} from "../../../src/game/daily";

function play(date: string, won: boolean): DailyPlay {
  return {
    date,
    anum: "A000045",
    difficulty: "normal",
    guesses: won ? ["8"] : ["5", "7", "9"],
    completed: true,
    won,
  };
}

describe("daily OEISdle", () => {
  test("uses one deterministic puzzle across difficulties", () => {
    const puzzle = dailyPuzzle("2026-07-14");
    expect(dailyPuzzle("2026-07-14")).toEqual(puzzle);
    expect(dailyPuzzleByAnum(puzzle.anum)).toEqual(puzzle);
    expect(challengeFor(puzzle, "easy", "2026-07-14").clues).toHaveLength(8);
    expect(challengeFor(puzzle, "normal", "2026-07-14").clues).toHaveLength(6);
    expect(challengeFor(puzzle, "hard", "2026-07-14").clues).toHaveLength(5);
  });

  test("builds deterministic unique choices containing the answer", () => {
    for (let day = 1; day <= 31; day++) {
      const date = `2026-07-${String(day).padStart(2, "0")}`;
      const puzzle = dailyPuzzle(date);
      for (const [difficulty, count] of [["easy", 4], ["normal", 6]] as const) {
        const first = challengeFor(puzzle, difficulty, date);
        const second = challengeFor(puzzle, difficulty, date);
        expect(first.choices).toEqual(second.choices);
        expect(first.choices).toHaveLength(count);
        expect(new Set(first.choices).size).toBe(count);
        expect(first.choices).toContain(first.answer);
      }
      expect(challengeFor(puzzle, "hard", date).choices).toEqual([]);
    }
  });

  test("normalizes whole-number guesses without losing large integers", () => {
    expect(normalizeIntegerGuess(" 1,234 ")).toBe("1234");
    expect(normalizeIntegerGuess("+0007")).toBe("7");
    expect(normalizeIntegerGuess("1.5")).toBeNull();
    expect(isCorrectGuess("9,223,372,036,854,775,808", "9223372036854775808")).toBe(true);
  });

  test("counts a current streak and completed games", () => {
    const plays = {
      "2026-07-12": play("2026-07-12", false),
      "2026-07-13": play("2026-07-13", true),
      "2026-07-14": play("2026-07-14", true),
    };
    expect(statsFor(plays, "2026-07-14")).toEqual({ played: 3, wins: 2, streak: 2 });
    expect(statsFor({ "2026-07-13": plays["2026-07-13"] }, "2026-07-14").streak).toBe(1);
    expect(statsFor({ "2026-07-14": play("2026-07-14", false) }, "2026-07-14").streak).toBe(0);
  });

  test("serves a valid, never-consecutive-repeating puzzle through 2026", () => {
    let prev = "";
    for (
      let t = Date.parse("2026-07-22T00:00:00Z");
      t <= Date.parse("2026-12-31T00:00:00Z");
      t += 86_400_000
    ) {
      const date = new Date(t).toISOString().slice(0, 10);
      const puzzle = dailyPuzzle(date);
      expect(puzzle.terms.length).toBe(10);
      expect(puzzle.anum).not.toBe(prev);
      prev = puzzle.anum;
    }
  });

  test("practice reaches every pool puzzle and each supports all difficulties", () => {
    const seen = new Set<string>();
    for (let i = 0; i < PUZZLE_COUNT; i++) {
      const puzzle = practicePuzzle(i);
      seen.add(puzzle.anum);
      for (const difficulty of ["easy", "normal", "hard"] as const) {
        const challenge = challengeFor(puzzle, difficulty, `practice:${i}`);
        expect(challenge.answer).toMatch(/^-?\d+$/);
        if (difficulty !== "hard") {
          expect(challenge.choices).toContain(challenge.answer);
          expect(new Set(challenge.choices).size).toBe(challenge.choices.length);
        }
      }
    }
    expect(seen.size).toBe(PUZZLE_COUNT);
  });

  test("a win on any difficulty keeps the day's streak alive", () => {
    const plays = {
      "2026-07-13:normal": play("2026-07-13", true),
      "2026-07-14:easy": { ...play("2026-07-14", false), difficulty: "easy" as const },
      "2026-07-14:hard": { ...play("2026-07-14", true), difficulty: "hard" as const },
    };
    expect(statsFor(plays, "2026-07-14")).toEqual({ played: 3, wins: 2, streak: 2 });
  });

  test("shares a compact score without revealing the answer", () => {
    const result = play("2026-07-14", true);
    expect(shareText(result)).toBe(`OEISdle 2026-07-14\nNormal 1/${MAX_GUESSES}\nSequence Trip`);
    expect(shareText(result)).not.toContain(result.anum);
  });
});
