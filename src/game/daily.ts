import { dayHash, isoDate } from "../oeis/dayPick";
import type { OEISSequence } from "../sequences/types";

export type GameDifficulty = "easy" | "normal" | "hard";

export interface DailyPuzzle extends OEISSequence {
  terms: string[];
}

export interface DailyPlay {
  date: string;
  anum: string;
  difficulty: GameDifficulty;
  guesses: string[];
  completed: boolean;
  won: boolean;
}

export const MAX_GUESSES = 3;

export const GAME_DIFFICULTIES: Record<
  GameDifficulty,
  {
    label: string;
    description: string;
    visibleTerms: number;
    choiceCount: number;
    hintAfter: number;
  }
> = {
  easy: {
    label: "Easy",
    description: "8 terms, a hint, and 4 choices",
    visibleTerms: 8,
    choiceCount: 4,
    hintAfter: 0,
  },
  normal: {
    label: "Normal",
    description: "6 terms and 6 choices",
    visibleTerms: 6,
    choiceCount: 6,
    hintAfter: 1,
  },
  hard: {
    label: "Hard",
    description: "5 terms, type the answer",
    visibleTerms: 5,
    choiceCount: 0,
    hintAfter: 2,
  },
};

const DAILY_PUZZLES: DailyPuzzle[] = [
  { anum: "A000002", name: "Kolakoski sequence", terms: ["1", "2", "2", "1", "1", "2", "1", "2", "2", "1"] },
  { anum: "A000035", name: "Alternating parity", terms: ["0", "1", "0", "1", "0", "1", "0", "1", "0", "1"] },
  { anum: "A000040", name: "Prime numbers", terms: ["2", "3", "5", "7", "11", "13", "17", "19", "23", "29"] },
  { anum: "A000045", name: "Fibonacci numbers", terms: ["0", "1", "1", "2", "3", "5", "8", "13", "21", "34"] },
  { anum: "A000079", name: "Powers of two", terms: ["1", "2", "4", "8", "16", "32", "64", "128", "256", "512"] },
  { anum: "A000108", name: "Catalan numbers", terms: ["1", "1", "2", "5", "14", "42", "132", "429", "1430", "4862"] },
  { anum: "A000142", name: "Factorials", terms: ["1", "1", "2", "6", "24", "120", "720", "5040", "40320", "362880"] },
  { anum: "A000217", name: "Triangular numbers", terms: ["0", "1", "3", "6", "10", "15", "21", "28", "36", "45"] },
  { anum: "A000796", name: "Digits of pi", terms: ["3", "1", "4", "1", "5", "9", "2", "6", "5", "3"] },
  { anum: "A000959", name: "Lucky numbers", terms: ["1", "3", "7", "9", "13", "15", "21", "25", "31", "33"] },
  { anum: "A000961", name: "Prime powers", terms: ["1", "2", "3", "4", "5", "7", "8", "9", "11", "13"] },
  { anum: "A001097", name: "Twin primes", terms: ["3", "5", "7", "11", "13", "17", "19", "29", "31", "41"] },
  { anum: "A001113", name: "Digits of e", terms: ["2", "7", "1", "8", "2", "8", "1", "8", "2", "8"] },
  { anum: "A001358", name: "Semiprimes", terms: ["4", "6", "9", "10", "14", "15", "21", "22", "25", "26"] },
  { anum: "A002193", name: "Digits of square root of 2", terms: ["1", "4", "1", "4", "2", "1", "3", "5", "6", "2"] },
  { anum: "A002378", name: "Oblong numbers", terms: ["0", "2", "6", "12", "20", "30", "42", "56", "72", "90"] },
  { anum: "A005132", name: "Recamán's sequence", terms: ["0", "1", "3", "6", "2", "7", "13", "20", "12", "21"] },
  { anum: "A005185", name: "Hofstadter Q-sequence", terms: ["1", "1", "2", "3", "3", "4", "5", "5", "6", "6"] },
  { anum: "A005384", name: "Sophie Germain primes", terms: ["2", "3", "5", "11", "23", "29", "41", "53", "83", "89"] },
  { anum: "A006577", name: "Collatz stopping times", terms: ["0", "1", "7", "2", "5", "8", "16", "3", "19", "6"] },
  { anum: "A007318", name: "Pascal's triangle by rows", terms: ["1", "1", "1", "1", "2", "1", "1", "3", "3", "1"] },
  { anum: "A007376", name: "Counting digits", terms: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] },
  { anum: "A010060", name: "Thue-Morse sequence", terms: ["0", "1", "1", "0", "1", "0", "0", "1", "1", "0"] },
];

export function dailyPuzzle(date = isoDate()): DailyPuzzle {
  return DAILY_PUZZLES[dayHash(`oeisdle:${date}`) % DAILY_PUZZLES.length];
}

export function dailyPuzzleByAnum(anum: string): DailyPuzzle | undefined {
  return DAILY_PUZZLES.find((puzzle) => puzzle.anum === anum);
}

export function challengeFor(
  puzzle: DailyPuzzle,
  difficulty: GameDifficulty,
  date = isoDate()
): { clues: string[]; answer: string; choices: string[] } {
  const config = GAME_DIFFICULTIES[difficulty];
  const visible = Math.min(config.visibleTerms, puzzle.terms.length - 1);
  const answer = puzzle.terms[visible];
  if (config.choiceCount === 0) {
    return { clues: puzzle.terms.slice(0, visible), answer, choices: [] };
  }

  const choices = [answer];
  const seen = new Set(choices);
  const add = (value: string | undefined) => {
    if (choices.length < config.choiceCount && value !== undefined && !seen.has(value)) {
      seen.add(value);
      choices.push(value);
    }
  };
  add(puzzle.terms[visible - 1]);
  add(puzzle.terms[visible + 1]);

  const answerNumber = BigInt(answer);
  for (let delta = 1; choices.length < config.choiceCount; delta++) {
    add((answerNumber + BigInt(delta)).toString());
    add((answerNumber - BigInt(delta)).toString());
  }

  let seed = dayHash(`${date}:${puzzle.anum}:${difficulty}`) || 1;
  for (let i = choices.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {
    clues: puzzle.terms.slice(0, visible),
    answer,
    choices,
  };
}

export function normalizeIntegerGuess(value: string): string | null {
  const compact = value.trim().replace(/[\s,]/g, "");
  if (!/^[+-]?\d+$/.test(compact)) return null;
  return BigInt(compact).toString();
}

export function isCorrectGuess(value: string, answer: string): boolean {
  return normalizeIntegerGuess(value) === normalizeIntegerGuess(answer);
}

function previousDate(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

export function statsFor(
  plays: Record<string, DailyPlay>,
  today = isoDate()
): { played: number; wins: number; streak: number } {
  const completed = Object.values(plays).filter((play) => play.completed);
  const wins = completed.filter((play) => play.won).length;
  const todayPlay = plays[today];
  if (todayPlay?.completed && !todayPlay.won) {
    return { played: completed.length, wins, streak: 0 };
  }

  let date = todayPlay?.won ? today : previousDate(today);
  let streak = 0;
  while (plays[date]?.completed && plays[date].won) {
    streak++;
    date = previousDate(date);
  }
  return { played: completed.length, wins, streak };
}

export function shareText(play: DailyPlay): string {
  const score = play.won ? `${play.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `OEISdle ${play.date}\n${GAME_DIFFICULTIES[play.difficulty].label} ${score}\nSequence Trip`;
}
