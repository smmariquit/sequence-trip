# Sequence Trip

Visualize [OEIS](https://oeis.org) integer sequences as animated constructions: number lines, spirals, modular grids, turtle walks, and more.

[![CI](https://github.com/smmariquit/oeis-visualize/actions/workflows/ci.yml/badge.svg)](https://github.com/smmariquit/oeis-visualize/actions/workflows/ci.yml)
[![CodeQL](https://github.com/smmariquit/oeis-visualize/actions/workflows/codeql.yml/badge.svg)](https://github.com/smmariquit/oeis-visualize/actions/workflows/codeql.yml)
[![Expo SDK](https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)

## What this is

**Sequence Trip** (package name `sequence-trip`) is an Expo app that turns OEIS sequences into watchable visualizations. Play the daily OEISdle puzzle, browse featured classics, search 397k+ sequences by name or terms, and step through constructions with playback and zoom controls.

Works on **web** (react-native-web + canvas), **Android**, and **iOS** (Skia native rendering).

## Features

| Feature | Details |
| --- | --- |
| Featured catalog | Curated sequences with dedicated viz types (Recamán, Fibonacci spiral, Ulam, Collatz, Pascal, digit flow) |
| Full OEIS search | Bundled SQLite database built from official OEIS dumps |
| Daily OEISdle | One shared puzzle each UTC day, with Easy, Normal, and Hard modes, streaks, and spoiler-free sharing |
| Generic visualizations | Line plot, bar waveform, mod grid, polar spiral, turtle walk for arbitrary term lists |
| Smooth construction | Fractional progress animation (not discrete step ticks) |
| Math captions | KaTeX on web; stripped delimiters on native |
| Playback controls | Play, pause, restart, speed presets, pinch zoom, pan, and reset |

## Stack

- [Expo 54](https://expo.dev) + [expo-router](https://docs.expo.dev/router/introduction/)
- [React Native 0.81](https://reactnative.dev) / [React 19](https://react.dev)
- [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/) (native)
- HTML `<canvas>` (web via `*.web.tsx`)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for bundled OEIS data
- [KaTeX](https://katex.org/) for math in captions
- [Jest](https://jestjs.io/) + [Playwright](https://playwright.dev/) for tests
- [EAS Build](https://docs.expo.dev/build/introduction/) for native releases

Agent and contributor notes: [AGENTS.md](AGENTS.md)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm (lockfile is `package-lock.json`)
- For native builds: [EAS CLI](https://docs.expo.dev/build/setup/) (`npm i -g eas-cli`) and an Expo account

## Setup

```sh
git clone https://github.com/smmariquit/oeis-visualize.git
cd oeis-visualize
npm ci

# Bundled search database (~397k sequences). Downloads OEIS dumps on first run.
npm run build:db
```

## Development

```sh
npm start          # Expo dev server (QR / platform picker)
npm run web        # Web only (default port 8081)
npm run android    # Android emulator or device
npm run ios        # iOS simulator (macOS only)
```

Web dev on a specific port (e.g. to match E2E):

```sh
npx expo start --web --port 8083
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run build:db` | Build `assets/oeis.db` from [oeis.org](https://oeis.org) stripped + names dumps (CC BY-SA 4.0) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run export:web` | Static web export to `dist/` |
| `npm run test:unit` | Unit tests (`tests/unit/`) |
| `npm run test:integration` | Integration tests (`tests/integration/`) |
| `npm run test:e2e` | Playwright against Expo web (port 8083) |
| `npm run test:all` | Full test pyramid |
| `npm run build:android` | EAS production Android build |
| `npm run build:preview` | EAS preview APK |

## Testing

Three layers (see [AGENTS.md § Testing pyramid](AGENTS.md#testing-pyramid)):

```sh
npm run test:unit
npm run test:integration
npm run test:e2e
```

E2E starts Expo web automatically. If port 8083 is busy:

```sh
E2E_PORT=8099 npm run test:e2e
```

## CI/CD

GitHub Actions (`.github/workflows/`):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| **CI** | Push to `main`, all PRs | Typecheck, unit + integration tests, build OEIS db, Playwright E2E, Expo web export |
| **CodeQL** | Push/PR to `main`, weekly | JavaScript/TypeScript security analysis |
| **Dependency Review** | PRs to `main` | Blocks new critical CVEs in dependencies |
| **EAS Build** | Manual dispatch, `v*` tags | Native builds via Expo Application Services |

### EAS Build (maintainers)

1. Create an [Expo access token](https://expo.dev/accounts/[account]/settings/access-tokens).
2. Add repository secret: `EXPO_TOKEN`.
3. Run **EAS Build** workflow from Actions, or push a tag `v1.0.1` for production Android + iOS builds.

EAS runs `npm run build:db` post-install (`eas-build-post-install` in `package.json`) so the OEIS database is included in native builds.

Local EAS profiles are in [`eas.json`](eas.json). Android submit expects `play-service-account.json` (gitignored).

### Dependabot

Weekly npm and GitHub Actions update PRs (`.github/dependabot.yml`). Review and merge after CI passes.

## Project layout

```
app/                    expo-router screens (home, daily, visualize/[id], about)
src/
  components/           UI (Controls, captions, cards, MathText)
  game/                 Daily puzzle selection, mechanics, and progress
  oeis/                 SQLite access + b-file fetch
  playback/             Animation progress and PlaybackContext
  sequences/            Catalog, generators, normalization
  visualizations/       Dedicated + generic viz (Skia + web canvas)
  math/                 KaTeX rendering helpers
assets/                 Icons, oeis.db (generated)
e2e/                    Playwright specs
tests/                  Jest unit + integration
scripts/build-db.mjs    OEIS database builder
```

## Data license

OEIS sequence data is used under the [OEIS End-User License Agreement](https://oeis.org/wiki/The_OEIS_End-User_License_Agreement) (CC BY-SA 4.0). The app code is MIT; see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue before large changes. PRs should pass CI (`npm run test:all` locally when touching UI or playback).
