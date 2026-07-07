// src/content/infoContent.ts

export interface InfoLink {
  label: string;
  url: string;
}

export interface InfoSection {
  id: string;
  title: string;
  body?: string[];
  links?: InfoLink[];
  bullets?: string[];
}

export const INFO_SECTIONS: InfoSection[] = [
  {
    id: "about",
    title: "About",
    body: [
      "Sequence Trip lets you watch integer sequences grow — as pictures, animations, and optional music.",
      "It is built on the On-Line Encyclopedia of Integer Sequences (OEIS), the catalog Neil J. A. Sloane (N. J. A. Sloane) started in 1964 and that thousands of contributors have expanded since.",
      "No math background required. If you've ever noticed a pattern in a list of numbers, you're already exploring sequences.",
    ],
  },
  {
    id: "sequences",
    title: "What is an integer sequence?",
    body: [
      "An integer sequence is an ordered list of whole numbers (…, −2, −1, 0, 1, 2, 3, …) that follows a rule. Each number in the list is called a term.",
      "You already know several. Counting is 1, 2, 3, 4, 5, … Even numbers are 0, 2, 4, 6, 8, … The Fibonacci sequence 0, 1, 1, 2, 3, 5, 8, … adds the previous two terms to get the next one.",
      "Some rules are simple (add 1 each time). Others are strange or still unsolved — like Collatz, where every starting number is believed to eventually reach 1, but nobody has proved it for all numbers.",
    ],
    bullets: [
      "Term index n starts at 0 or 1 depending on the sequence — the caption shows you which.",
      "a(n) means \"the nth term\" — e.g. in 1, 2, 3, … we have a(1) = 1, a(2) = 2.",
      "Search this app by name (\"fibonacci\"), by A-number (A000045), or by typing the first few terms (1,1,2,3,5).",
    ],
  },
  {
    id: "oeis",
    title: "What is the OEIS?",
    body: [
      "The On-Line Encyclopedia of Integer Sequences (OEIS) is a free, searchable catalog of number lists — think of it as a dictionary for patterns in whole numbers.",
      "Neil J. A. Sloane (often cited as N. J. A. Sloane) began it in 1964 as a handwritten card file at AT&T Bell Labs, collecting every interesting sequence he encountered. It moved online in 1996 and has since grown to hundreds of thousands of entries from researchers, puzzle fans, and hobbyists worldwide.",
      "Every entry gets a permanent ID called an A-number (like A005132 for Recamán's sequence). The same sequence always has the same A-number, so you can cite it, search for it, and share it unambiguously.",
      "You do not need to be a mathematician to use it. People look up sequences when they notice a pattern in a puzzle, a game, nature (petals, seed spirals), or computer output and wonder: has anyone seen this list before?",
    ],
    links: [
      { label: "Browse oeis.org", url: "https://oeis.org" },
      { label: "N. J. A. Sloane (OEIS founder)", url: "https://oeis.org/wiki/User:N._J._A._Sloane" },
      { label: "OEIS for beginners (wiki)", url: "https://oeis.org/wiki/Welcome" },
    ],
  },
  {
    id: "help",
    title: "How to use",
    bullets: [
      "Search by name (e.g. fibonacci), A-number (A005132), or leading terms (1,1,2,3,5).",
      "Tap a result or featured card to open the full visualization.",
      "Play starts construction; Pause freezes it; Restart resets and plays from the beginning.",
      "Speed cycles through 0.5x, 1x, 2x, and 4x.",
      "Musicalize turns each new term into sound — pick Melody, Bass, Harmony, Rhythm, or Digits and tap the speaker icon.",
      "Captions below the viz explain each step. Math notation uses LaTeX on web.",
      "Tap the OEIS id in the header to open the sequence on oeis.org.",
      "Tap the document icon in the visualize toolbar for the full OEIS entry — keywords, formulas, code, cross-refs, and more.",
    ],
  },
  {
    id: "viz",
    title: "Visualization types",
    body: [
      "Some sequences have dedicated views (Recamán arcs, Fibonacci spiral, Ulam spiral, Collatz tree, Pascal fractal, digit flow).",
      "Everything else gets a generic viz chosen from the term shape: line plot, polar spiral, turtle walk, signed bar waveform, or mod-2 grid.",
    ],
  },
  {
    id: "offline",
    title: "Offline & privacy",
    body: [
      "Search and bundled terms work offline via the on-device OEIS database.",
      "Extra terms may download a b-file from oeis.org the first time you open a sequence; cached copies reuse local storage on native.",
      "The full OEIS entry (formulas, keywords, programs, cross-refs) loads from oeis.org when you tap the document icon on the visualize screen.",
      "No accounts, analytics, or tracking. Nothing leaves your device except explicit OEIS requests.",
    ],
  },
  {
    id: "credits",
    title: "Credits",
    body: [
      "Sequence data from the On-Line Encyclopedia of Integer Sequences (OEIS), founded by Neil J. A. Sloane (N. J. A. Sloane) and maintained by The OEIS Foundation Inc., under CC BY-SA 4.0.",
      "This app is not affiliated with or endorsed by The OEIS Foundation or Dr. Sloane.",
      "Ambient music: \"Heavenly Loop\" by isaiah658 (CC0, opengameart.org).",
    ],
    links: [
      { label: "oeis.org", url: "https://oeis.org" },
      { label: "N. J. A. Sloane (OEIS founder)", url: "https://oeis.org/wiki/User:N._J._A._Sloane" },
      {
        label: "OEIS End-User License Agreement",
        url: "https://oeis.org/wiki/The_OEIS_End-User_License_Agreement",
      },
      { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
    ],
    bullets: [
      "KaTeX for math rendering (web)",
      "Expo, React Native, and Shopify React Native Skia",
      "SQLite OEIS index built from official stripped + names dumps",
    ],
  },
  {
    id: "source",
    title: "Source",
    body: ["Open source. Bug reports and contributions welcome on GitHub."],
    links: [
      {
        label: "github.com/smmariquit/oeis-visualize",
        url: "https://github.com/smmariquit/oeis-visualize",
      },
    ],
  },
];

export function getInfoSection(id: string): InfoSection | undefined {
  return INFO_SECTIONS.find((s) => s.id === id);
}
