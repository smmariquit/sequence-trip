// src/content/infoContent.ts
//
// The wiki: articles made of sections. The About tab lists articles;
// /wiki/[id] renders one. Body paragraphs may carry $LaTeX$; `anums`
// render as tappable sequence chips.

export interface InfoLink {
  label: string;
  url: string;
}

export interface WikiImage {
  /** require()'d bundled asset (downloaded from Wikimedia Commons). */
  source: number;
  caption: string;
  /** Author + license, shown under the caption, linking to the file page. */
  credit: string;
  creditUrl: string;
  /** width / height of the bundled file. */
  aspectRatio: number;
}

export interface InfoSection {
  id: string;
  title: string;
  body?: string[];
  links?: InfoLink[];
  bullets?: string[];
  /** Sequences to open in-app, rendered as chips under the section. */
  anums?: string[];
  image?: WikiImage;
}

/** Bundled Commons photos, keyed for reuse across articles. */
export const WIKI_IMAGES = {
  sunflower: {
    source: require("../../assets/wiki/sunflower.jpg"),
    caption:
      "A sunflower head. Count the clockwise and counterclockwise seed spirals: consecutive Fibonacci numbers.",
    credit: "L. Shyamal, CC BY-SA 2.5, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Helianthus_whorl.jpg",
    aspectRatio: 640 / 480,
  },
  aloe: {
    source: require("../../assets/wiki/aloe.jpg"),
    caption:
      "Spiral aloe (Aloe polyphylla): five spiral arms of leaves, placed by the same golden-angle rule the polar spiral viz draws.",
    credit: "Stan Shebs, CC BY-SA 3.0, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Aloe_polyphylla_1.jpg",
    aspectRatio: 1280 / 1090,
  },
  romanesco: {
    source: require("../../assets/wiki/romanesco.jpg"),
    caption:
      "Romanesco broccoli: spirals made of spirals, phyllotaxis repeating at every scale.",
    credit: "Iifar, CC BY-SA 4.0, Wikimedia Commons",
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Romanesco_broccoli_(Brassica_oleracea).jpg",
    aspectRatio: 1280 / 1024,
  },
  yanghui: {
    source: require("../../assets/wiki/yanghui.gif"),
    caption:
      "Yang Hui's triangle, published in China around 1303, three centuries before Pascal.",
    credit: "Yang Hui, public domain, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Yanghui_triangle.gif",
    aspectRatio: 704 / 1095,
  },
} satisfies Record<string, WikiImage>;

export interface WikiArticle {
  id: string;
  title: string;
  summary: string;
  /** Ionicons name for the index card. */
  icon: string;
  sections: InfoSection[];
}

export const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "What an integer sequence is, and games to play with one.",
    icon: "school-outline",
    sections: [
      {
        id: "sequences",
        title: "What is a sequence?",
        body: [
          "An integer sequence is an ordered list of whole numbers (…, −2, −1, 0, 1, 2, 3, …) that follows a rule. Each number in the list is called a term.",
          "You already know several. Counting is 1, 2, 3, 4, 5, … Even numbers are 0, 2, 4, 6, 8, … The Fibonacci sequence 0, 1, 1, 2, 3, 5, 8, … adds the previous two terms to get the next one.",
          "Sequences hide everywhere. Count the petals on flowers, the spirals in a pinecone, or the ways you can climb stairs taking 1 or 2 steps at a time. All of those lists are in the OEIS.",
          "Some rules are simple (add 1 each time). Others are strange or still unsolved, like Collatz, where every starting number is believed to eventually reach 1, but nobody has proved it for all numbers. A kid can play with the same list an expert has studied for decades; that is the charm.",
        ],
        bullets: [
          "a(n) means \"the nth term\". E.g. in 1, 2, 3, … we have a(1) = 1, a(2) = 2.",
          "Term index n starts at 0 or 1 depending on the sequence. The caption shows you which.",
          "Search this app by name (\"fibonacci\"), by A-number (A000045), or by typing the first few terms (1,1,2,3,5).",
        ],
        anums: ["A000045", "A005843", "A000027"],
      },
      {
        id: "try",
        title: "Try it yourself",
        body: [
          "Cover the next number and guess it before it appears. The daily OEISdle tab is exactly this game, with a new sequence every day and three difficulty levels you can all play today.",
          "Pick a small rule of your own (double and subtract one, add the digits, anything) and write out ten terms. Then type them into the search box. If the OEIS knows your list, you have rediscovered something; if it does not, you may have found something genuinely new. People submit new sequences this way every week.",
          "Watch the same sequence with different visualizations (the chips on the top right of a visualization) and with sound on. A pattern your eyes miss, your ears often catch.",
        ],
      },
    ],
  },
  {
    id: "oeis-guide",
    title: "The OEIS",
    summary: "The encyclopedia behind the app, and how to read its entries.",
    icon: "library-outline",
    sections: [
      {
        id: "oeis",
        title: "What is the OEIS?",
        body: [
          "The On-Line Encyclopedia of Integer Sequences (OEIS) is a free, searchable catalog of number lists. Think of it as a dictionary for patterns in whole numbers.",
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
        id: "reading",
        title: "Reading an entry",
        body: [
          "Open any sequence here and tap the document icon to see its full OEIS entry. The parts, top to bottom:",
        ],
        bullets: [
          "A-number: the permanent catalog ID, like a serial number.",
          "Offset: the index of the first term. Offset 0 means the list starts at a(0).",
          "Keywords: short tags from OEIS editors. \"core\" marks foundational sequences, \"nice\" especially elegant ones, \"hard\" ones where computing more terms is an open problem, \"hear\" ones worth listening to.",
          "Data: the stored terms. Long sequences continue in a b-file, which this app fetches when you ask for more terms.",
          "Formula: exact and asymptotic expressions, recurrences, and generating functions contributed over the years, each signed and dated.",
          "Code: programs in PARI, Mathematica, Maple, Python, Haskell, and more that compute the sequence.",
          "Cross-references: relatives worth visiting next. The compare button next to each one plots the two sequences against each other.",
        ],
      },
    ],
  },
  {
    id: "famous",
    title: "Famous sequences",
    summary: "Six celebrities of the integer world, and why they earned it.",
    icon: "star-outline",
    sections: [
      {
        id: "famous",
        title: "Worth meeting first",
        bullets: [
          "Fibonacci (A000045): each term is the sum of the previous two; the spiral in sunflower heads and the ratio that approaches the golden number.",
          "Primes (A000040): the atoms of multiplication. Every whole number above 1 is built from them in exactly one way.",
          "Recamán (A005132): hop backward when you can, forward when you must. Nobody knows whether every number is eventually visited.",
          "Collatz stopping times (A006577): halve if even, triple and add one if odd. The most famous unsolved problem a child can state.",
          "Catalan numbers (A000108): the answer to dozens of different counting questions at once, from balanced brackets to mountain ranges.",
          "Kolakoski (A000002): the sequence that describes its own run lengths. Reading it IS generating it.",
        ],
        anums: ["A000045", "A000040", "A005132", "A006577", "A000108", "A000002"],
      },
    ],
  },
  {
    id: "seeing",
    title: "Ways to see a sequence",
    summary: "What each visualization reveals, and when to compare instead.",
    icon: "eye-outline",
    sections: [
      {
        id: "viz",
        title: "Visualization types",
        body: [
          "Some sequences have dedicated views (Recamán arcs, Fibonacci spiral, Ulam spiral, Collatz tree, Pascal fractal, digit flow).",
          "Everything else gets a generic viz chosen from the term shape: line plot, polar spiral, turtle walk, signed bar waveform, or mod-2 grid. The chips on the top right of a visualization switch between them; the help chip explains what the active one encodes.",
        ],
      },
      {
        id: "comparing",
        title: "Comparing sequences",
        body: [
          "Growth alone hides relationships that a comparison exposes. The Compare button on the home screen overlays up to four sequences on a shared log scale; with exactly two you also get a phase plane (one plotted against the other) and a term-by-term ratio.",
          "A straight ratio line means one sequence is an exact multiple or shift of the other. Parallel log-scale lines mean the same exponential base. Complementary pairs, two lists that together hit every whole number exactly once, hug the diagonal in the phase plane.",
          "The \"Classic matchups\" presets on the compare screen are curated examples of each of these behaviors.",
        ],
      },
      {
        id: "glossary",
        title: "Tags & difficulty",
        body: [
          "Sequences carry small tags so you can tell at a glance what area of math they touch and how approachable they are.",
          "Difficulty measures how easy the rule is to understand, not how hard the open problems are.",
        ],
        bullets: [
          "Beginner: you can follow this with basic counting.",
          "Intermediate: some math vocabulary helps, but the viz carries you.",
          "Advanced: easy to state, deeply subtle to grasp.",
          "Number theory: primes, divisors, and the hidden structure of whole numbers.",
          "Combinatorics: counting arrangements. How many ways can things combine?",
          "Geometry: shapes, spirals, and where numbers land in space.",
          "Analysis: constants like π and e, limits, and digit expansions.",
          "Algebra: polynomials, coefficients, and symbolic structure.",
          "Probability: randomness, expected values, and statistical patterns.",
          "Recreational: puzzles and playful rules, math for the fun of it.",
          "Fractals: self-similar patterns that repeat at every scale.",
        ],
      },
    ],
  },
  {
    id: "hearing",
    title: "Hearing a sequence",
    summary: "How numbers become notes, and why remainders make the melody.",
    icon: "musical-notes-outline",
    sections: [
      {
        id: "sound",
        title: "How the music works",
        body: [
          "There is no canonical way a sequence \"should\" sound; every sonification picks a mapping. The OEIS's own listen feature plays a(n) modulo 88 on piano keys. This app does the same thing with more control: the remainder of each term picks a step on a musical scale.",
          "Why remainders? Pitch range is finite and sequences are not, so values must be compressed. Remainders win because number theory lives in them: a sequence that is periodic modulo k becomes a literally repeating melody. Fibonacci modulo anything is periodic (the Pisano period), so Fibonacci genuinely loops as a tune.",
          "Each instrument reads the numbers its own way: Melody plays a(n) mod 25 on the chosen scale, Bass follows mod 15 an octave and a half down, Harmony shades with mod 5, Rhythm drums on parity and position, Digits plays the last four decimal digits as a run of notes, and Pad roots a slow chord on mod 10.",
          "The scale and key live in Settings. Pentatonic keeps everything pleasant; chromatic is the most faithful to the raw numbers and the most tense.",
        ],
      },
    ],
  },
  {
    id: "deep-end",
    title: "The deep end",
    summary: "Generating functions, transforms, and the OEIS as a research tool.",
    icon: "telescope-outline",
    sections: [
      {
        id: "deep",
        title: "For the researchers",
        body: [
          "For readers who want the real machinery, the OEIS is a working research instrument, not just a curiosity cabinet.",
          "Generating functions compress a whole sequence into one object: Fibonacci is $x/(1-x-x^2)$, and the Formula section of most entries records such closed forms alongside recurrences and asymptotics like $F(n) \\sim \\varphi^n/\\sqrt{5}$.",
          "Entries are connected by transforms (binomial, Euler, Möbius, and friends), so a sequence you meet in one problem is often a known transform of another; the cross-references map that web. Motzkin, Catalan, and the Riordan numbers form a binomial-transform ladder you can watch in the compare view.",
          "Empirically the OEIS even has structure of its own: plot how often each integer appears across the database and a thin band of under-represented numbers emerges, known as Sloane's gap.",
          "In practice: compute the first 8 or 10 terms of whatever your research produces and search them before proving anything. A hit hands you formulas, references, and fifty years of prior art; a miss is an invitation to submit.",
        ],
        links: [
          { label: "Superseeker (deep search)", url: "https://oeis.org/ol.html" },
          { label: "OEIS transforms", url: "https://oeis.org/transforms.html" },
          { label: "Sloane's gap (paper)", url: "https://arxiv.org/abs/1101.4470" },
        ],
        anums: ["A000045", "A001006", "A005043"],
      },
    ],
  },
  {
    id: "app-manual",
    title: "About this app",
    summary: "Controls, offline behavior, privacy, credits, and source.",
    icon: "information-circle-outline",
    sections: [
      {
        id: "help",
        title: "How to use",
        bullets: [
          "Search by name (e.g. fibonacci), A-number (A005132), or leading terms (1,1,2,3,5).",
          "Tap a result or featured card to open the full visualization.",
          "Play starts construction; Pause freezes it; Restart resets and plays from the beginning.",
          "Speed cycles through 0.5x, 1x, 2x, and 4x.",
          "Musicalize turns each new term into sound. Pick Melody, Bass, Harmony, Rhythm, or Digits and tap the speaker icon.",
          "Captions below the viz explain each step. Math notation uses LaTeX on web.",
          "Tap the OEIS id in the header to open the sequence on oeis.org.",
          "Tap the document icon in the visualize toolbar for the full OEIS entry: keywords, formulas, code, cross-refs, and more.",
        ],
      },
      {
        id: "offline",
        title: "Offline & privacy",
        body: [
          "Search and bundled terms work offline via the on-device OEIS database.",
          "Extra terms may download a b-file from oeis.org the first time you open a sequence; cached copies reuse local storage on native.",
          "The full OEIS entry (formulas, keywords, programs, cross-refs) loads from oeis.org when you tap the document icon on the visualize screen.",
          "No accounts, analytics, or tracking. Nothing leaves your device except explicit OEIS requests and app update checks.",
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
    ],
  },
];

/** Flat view of every section, for search and tests. */
export const INFO_SECTIONS: InfoSection[] = WIKI_ARTICLES.flatMap((a) => a.sections);

export function getArticle(id: string): WikiArticle | undefined {
  return WIKI_ARTICLES.find((a) => a.id === id);
}

export function getInfoSection(id: string): InfoSection | undefined {
  return INFO_SECTIONS.find((s) => s.id === id);
}
