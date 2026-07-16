# Sequence Trip Agent Guide

**Human developers:** skim [docs/agent-contract.md](docs/agent-contract.md) once. This file is the full agent policy.

> **Org template:** Adapted from [Room TBA](https://github.com/uplbtools/room-tba) `AGENTS.md` for the Expo / React Native stack.

## Doc map

Read the linked doc for your task; do not rely on this file alone for detailed checklists.

| When | Read |
| --- | --- |
| Starting a coding session, commit, or PR | [.cursor/skills/sequence-trip-agent-workflow/SKILL.md](.cursor/skills/sequence-trip-agent-workflow/SKILL.md) |
| Expo Router, native UI, SDK upgrade, EAS store/OTA | [.cursor/skills/expo-stack/SKILL.md](.cursor/skills/expo-stack/SKILL.md) → matching `~/.agents/skills/expo-*` / `eas-*` |
| Agent handoff to another session / model | [.cursor/skills/agent-handoff/SKILL.md](.cursor/skills/agent-handoff/SKILL.md) |
| Output style, token efficiency, Caveman / Ponytail | [docs/agent-contract.md](docs/agent-contract.md) + `.cursor/rules/agent-contract.mdc` |
| Playwright E2E, web dev server, CI | [.cursor/skills/playwright-e2e/SKILL.md](.cursor/skills/playwright-e2e/SKILL.md) |
| Worktrees, multiple agents | [AGENTS.md § Worktrees and multiple agents](#worktrees-and-multiple-agents) |
| Tests for a feature or bug fix | [AGENTS.md § Testing pyramid](#testing-pyramid) |
| New or changed visualization | [AGENTS.md § Visualizations](#visualizations) |
| OEIS data, search, b-file fetch | [AGENTS.md § OEIS data](#oeis-data) |
| Playback and animation | [AGENTS.md § Playback](#playback) |
| OTA (EAS Update) vs store builds | [docs/ota-compliance.md](docs/ota-compliance.md) |

## How to work

- **Agent efficiency:** Ponytail + agent contract rules in `.cursor/rules/`. Caveman for terse chat when enabled.
- **Bias toward action.** Do not pad estimates, over-explain tradeoffs, or defer work that is clearly scoped.
- **Default to implementing** when the request is concrete and the codebase path is discoverable. Ask only when a product decision is genuinely ambiguous or irreversible.
- **One pass is often enough.** Prefer a focused implementation plus verification over long planning loops or repeated “want me to…?” prompts.
- **Preserve the dirty tree.** Do not revert unrelated user changes unless explicitly asked.
- **Keep scope tight.** Avoid opportunistic refactors outside the request.
- **Infer intent over typos.** User messages are often rushed; read for what they mean, not only literal wording.
- **`gh` on maintainer machine:** run it yourself for PRs, issues, and check status when available. Do not punt to the dashboard when the CLI can do it.

### Agent time estimates (not human sprint math)

Estimate like **Composer with repo + shell access**, not like a human developer with meetings.

- **Do not quote human-day timelines** for scoped repo work. Prefer **“I’ll do it in this session”** or split by **deliverable** (PR1, PR2), not calendar days.
- **Scoped + discoverable path** (one viz fix, one test file, layout tweak) → usually **minutes to one session**.
- **Reserve multi-session / multi-PR** for true epics: new viz family across native + web, full catalog migration, or EAS release plumbing.
- **Say “blocked on you”** when waiting on secrets or product decisions: not “implementation takes a day.”

| Bad | Better |
| --- | --- |
| “Playwright will take 2–3 days” | “E2E spec + fix in this turn.” |
| “Want me to implement?” on obvious scope | Implement, then report what shipped. |
| “Optional next steps: …” after clear scope | **Do the steps.** Only ask when blocked. |

### Do not defer executable work

If the path is in the repo and the user did not say “plan only” or “don’t commit”:

1. **Implement:** do not end the turn with a backlog of items you could have done in minutes.
2. **Same PR:** feature + tests + doc updates; not “infra PR then tests PR.”
3. **Ask only when blocked:** missing secrets, irreversible product choice, or explicit user stop.
4. **Report what shipped:** not a menu of optional follow-ups. One line “Blocked on X” if truly stuck.

- **Default to one PR** for agent-delivered work. Do not habitually split unless the user asked for split review or the diff is unreviewably huge.

## Branches and pull requests

Default flow: **feature branch → `main`** (single integration branch).

| User says (approx.) | Do this |
| --- | --- |
| Open a PR | `gh pr create --base main --head <feature-branch>` |
| Merge / ship | Squash or merge PR into `main` after checks pass |
| Push | Only when the user asks |

- **`main`** is the default branch; CI runs unit, integration, and E2E on push and PR.
- Do not force-push `main` unless the user explicitly requests it.

## Worktrees and multiple agents

**Default:** one repo checkout on **`main`**. At session start:

```sh
git worktree list
git fetch origin main
git status --short --branch
```

| Do | Don't |
| --- | --- |
| **One active agent per worktree path** | Two agents editing the same path on `main` at once |
| `git fetch` + `git status` before editing | Assume the tree matches remote |
| Commit only your scoped changes; preserve unrelated dirty files | Revert or checkout away user WIP |
| Open a **separate worktree + branch** for parallel long tasks | Long-lived stashes as a substitute for branches |

```sh
git worktree add ../oeis-visualize-feat feat/my-thing
cd ../oeis-visualize-feat
# … work, commit, push, open PR …
git worktree remove ../oeis-visualize-feat   # after merge
```

### Session handoff checklist

Before ending a turn with code changes:

1. `git status`: clean or only intentional WIP left for the user.
2. Commits on the correct branch.
3. Push only if the user asked.
4. Note any manual verification still needed (native Android, device haptics).

## Testing pyramid

**Agents add tests in the same PR as the feature or fix.** Do not ship code and file a follow-up “tests PR.”

| Layer | Location | Runs |
| --- | --- | --- |
| **Unit** | `tests/unit/` | Pure logic: sequences, playback math, viz selection, LaTeX |
| **Integration** | `tests/integration/` | Extracted component logic (caption text, config); avoid mounting RN components in Jest when React 19 breaks the renderer |
| **E2E** | `e2e/` | Playwright against Expo web (`npm run test:e2e`) |

### Same-PR minimum by change type

| Change | Add in the same PR |
| --- | --- |
| Bug fix | Regression test that would have failed before the fix |
| New lib/helper/parser | `tests/unit/**/*.test.ts` |
| Playback / progress math | `tests/unit/playback/` |
| Caption or control logic | `tests/integration/components/` |
| User-visible web flow | Playwright spec in `e2e/` |
| New generic viz | Unit test for selection if applicable; manual web + native smoke note in PR |

### Commands

```sh
npm run test:unit
npm run test:integration
npm run test:e2e          # starts Expo web on port 8083 (or E2E_PORT)
npm run test:all
```

CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs typecheck, unit, integration, E2E, and Expo web export on push and PR. Native releases: [`.github/workflows/eas-build.yml`](.github/workflows/eas-build.yml) (requires `EXPO_TOKEN`).

### Jest constraints

- React Native component rendering in Jest is fragile on React 19. Prefer **extracting pure functions** (see `vizCaptionText.ts`, `controlsConfig.ts`) and testing those.
- Platform files: unit tests import shared logic from non-`.web.tsx` modules; mock Skia/Reanimated via `jest.setup.ts`.

## Verify before done

Adjust checks to change size.

| Step | When |
| --- | --- |
| `npm run typecheck` | Any TypeScript change |
| `npm run test:unit` | Logic, lib, playback, sequences changed |
| `npm run test:integration` | Component-adjacent extracted logic changed |
| `npm run test:e2e` | Web UI, routing, controls, captions changed |
| `npm run export:web` | Metro bundler / asset / web-only changes (also in CI) |
| `npm run test:all` | Before PR or when unsure |
| Manual web | Layout, animation smoothness, KaTeX rendering (`npm run web`, port 8081 default) |
| Manual native | Skia viz, haptics, safe areas (only when native viz files changed) |

Do not run full E2E after every one-line edit. Run targeted unit tests during iteration; run `test:all` once before commit/PR.

## Commits

- **Only create commits when the user asks.** Do not leave completed work uncommitted across turns without reporting it.
- **Use [Conventional Commits](https://www.conventionalcommits.org/)** when committing: `type(scope): imperative summary` (e.g. `feat(viz): add mod grid legend`, `fix(playback): pause on load`).
- **One logical unit per commit**; stage only files that belong together; message states _why_, not a file list.
- Do not push unless asked. Do not amend or force-push unless the user’s git rules allow it.

## Architecture (short)

- **App:** Expo 54 + React Native 0.81 + expo-router. Entry: `app/`.
- **Web:** react-native-web; platform overrides via `.web.tsx`. KaTeX CSS in `app/+html.tsx`.
- **Native viz:** `@shopify/react-native-skia` in `*.tsx`.
- **Web viz:** HTML canvas in `*.web.tsx`; reads `progressRef.current` each frame for smooth drawing.
- **Routing:** `app/index.tsx` (home/search), `app/visualize/[id].tsx` (full-screen viz).
- **Sequences:** curated catalog in [`src/sequences/catalog.ts`](src/sequences/catalog.ts); 397k+ rows in bundled SQLite ([`src/oeis/db.ts`](src/oeis/db.ts), built by `npm run build:db`).
- **Generic viz:** [`src/visualizations/generic/`](src/visualizations/generic/) + [`select.ts`](src/visualizations/generic/select.ts) picks viz from term shape.
- **Playback:** [`src/playback/PlaybackContext.tsx`](src/playback/PlaybackContext.tsx), [`useBuildAnimation.ts`](src/playback/useBuildAnimation.ts), [`drawProgress.ts`](src/playback/drawProgress.ts).
- **Theme:** [`src/theme.ts`](src/theme.ts).

## Playback

- **Full-screen viz:** starts **paused**. User presses Play or Restart. `useContextBuildAnimation` calls `setMaxSteps` only on load; **not** `restart()` (which auto-plays).
- **Home card previews:** auto-loop via `useLocalBuildAnimation` (`preview: true`).
- **Restart button:** resets progress **and** starts playing.
- **Smooth animation:** fractional `progressRef` + `requestAnimationFrame` ticker in `PlaybackContext`; web canvas reads ref each frame; native Skia uses `progressSV` + `makePolylinePath` where implemented.
- **Speed:** `useAnimSpeed()` in viz files; never destructure bare `speed` from context on native Skia paths (web `.web.tsx` ignores playback speed for canvas loop).

## Visualizations

### Platform split

Every user-facing viz needs **both** implementations when it ships on web and native:

| File | Renders with |
| --- | --- |
| `Foo.tsx` | Skia (`Canvas`, `Path`, …) |
| `Foo.web.tsx` | `<canvas>` + `useBuildAnimation` + `progressRef` |

Metro resolves `.web.tsx` on web automatically. Do not branch on `Platform.OS` inside draw loops when a platform file exists.

### Adding a generic viz

1. Implement `src/visualizations/generic/MyViz.tsx` and `MyViz.web.tsx`.
2. Register in [`select.ts`](src/visualizations/generic/select.ts) if selection logic applies.
3. Add unit tests for any new selection/normalization helpers.
4. Verify on web (Playwright or manual) and note native Skia smoke if touched.

### Dedicated viz types

Catalog sequences with `vizType` (e.g. `recaman-arcs`) live in [`src/visualizations/`](src/visualizations/) and are wired in [`VizPreview.tsx`](src/components/VizPreview.tsx).

## OEIS data

- **Bundled DB:** `assets/oeis.db` (gitignored or built in CI via `npm run build:db`). Metro serves `.db` via [`metro.config.js`](metro.config.js).
- **Search:** `src/oeis/db.ts` — unified for native and web (no separate `db.web.ts`).
- **Extended terms:** `src/oeis/bfile.ts` fetches b-file data when catalog/SQLite row lacks enough terms for generic viz.
- **Normalization:** `src/sequences/normalize.ts` before feeding terms into viz.

Do not commit large raw OEIS dumps. Use the build script.

### Tags and metadata (name-derived, sustainable at 397k)

- The bundled DB has only `(anum, name, terms)` — **no OEIS keywords**. So field tags come from the sequence **name** via `fieldsFromName` in [`src/sequences/metadata.ts`](src/sequences/metadata.ts), using OEIS naming conventions ("Number of …" = combinatorics, "Numbers k such that …"/"Primes …" = number theory, "Decimal expansion of …" = analysis, …). This tags every sequence; keep the regex list broad and always return ≥1 field (default number-theory) so a field filter never hides everything.
- **Difficulty is NOT a search filter.** It can only be honestly assigned to the ~26 curated sequences in `CURATED`; a difficulty filter over DB search results hides ~all of them. Difficulty shows only on curated cards and drives the Explore "Start here / Next steps / Deep dives" collections.
- **Sequence of the day** is a UTC-date hash → rowid ([`src/oeis/dayPick.ts`](src/oeis/dayPick.ts), pure and unit-tested). Reuse `picksForDates` to precompute future days while the DB is open (notifications, widget snapshot). The widget's headless task must **never** open the 130MB DB — it reads a slim `widget-picks.json` the app writes at launch.

## Hard-won gotchas

Things that cost real debugging time; check these first.

- **expo-sqlite web has no FTS5.** A `MATCH` query does not throw — it kills the SQLite worker, so the promise never settles **and every later DB call hangs**, looking like a total app freeze with no console error. Web must use `LIKE`; native keeps FTS5 (`searchNames` in `src/oeis/db.ts`).
- **Guard native-only modules on web.** `expo-notifications`' `useLastNotificationResponse()` and `react-native-android-widget`'s `registerWidgetTaskHandler` (uses `AppRegistry.registerHeadlessTask`) both **throw at runtime on web**, breaking the whole bundle. Gate them: notification tap routing lives in a native-only `<NotificationRouter>` (rendered only when `Platform.OS !== "web"`); widget registration in `index.js` is wrapped in `if (Platform.OS === "android")`. **Always `npx expo export -p web` (or e2e) after adding a native module** to catch this.
- **Managed prebuild.** `android/` is gitignored. ALL native config (permissions, plugins, widget/notification setup) goes through `app.json` `plugins` — never hand-edit the manifest. EAS runs prebuild automatically; a local native build needs `npx expo prebuild -p android --clean` or plugin changes silently don't apply.
- **Deep link scheme is already set** (`sequencetrip` in `app.json`); `sequencetrip://visualize/A000045` routes to `/visualize/[id]`. Notification taps and widget `OPEN_URI` reuse it — no new routing code.
- **Reanimated worklet closures freeze captured primitives.** A worklet that reads a module-level `let x` sees its value at closure-creation time, not live. Keep mutable store state **inside an object** (`const state = { current: … }`) so `state.current` reads stay fresh. Pattern in `vizColorStore.ts`, `musicSettings.ts`, `notifyStore.ts`.
- **Persistence pattern** (copy verbatim for new settings): module store = `state` object + `version` counter + `Set` of listeners + `sanitize()`; `useSyncExternalStore(subscribe, version, version)` in UI; load/persist = `Platform.OS==="web" ? localStorage : new File(Paths.document,"x.json").write()` via `await import("expo-file-system")` (SDK-54 File/Paths API); load once in `app/_layout.tsx` useEffect.
- **Canvas arc direction (web):** canvas y grows **downward**, so the *top* half-circle is the `(PI, 2PI)` sweep, not `(PI, 0)`. A wrong sweep silently draws every arc on the same side (the long-standing Recamán "half" bug). Native Skia `addArc` uses degrees and was already correct — verify web against native with a pixel probe.
- **Metro assetExts:** new binary asset types (e.g. `.ogg`) must be added to `config.resolver.assetExts` in `metro.config.js` or the web export fails to resolve them.
- **EAS build/submit:** bump `expo.android.versionCode` every build. Submit track is `alpha` (closed testing) in `eas.json`. `--auto-submit` needs `play-service-account.json` on disk (gitignored); no key → build succeeds, submit step fails. Cancel + rebuild (new versionCode) if a JS fix must ride the same native build rather than shipping the known-bad one to testers.
- **EAS Update (OTA):** `expo-updates` + channels in `eas.json`. JS/assets hotfixes only via `npm run update:production`; native/plugin/manifest/db changes need a store build. Policy: [docs/ota-compliance.md](docs/ota-compliance.md). `runtimeVersion` policy is `appVersion`; bump `expo.version` when native code changes.

## UX guardrails

- **No em dashes (—) in any user-facing string.** Use a period, comma, or colon. (Comments/code are fine.) This is a hard user rule.
- **Web and mobile are different niches; do not blindly reuse a wide row on a phone.** Below ~600px width, collapse secondary toolbar actions into an overflow sheet, keep text larger (body 15-16px, not 12-13), and make the primary action (Play) dominant. The visualize `Controls` toolbar gates inline-vs-overflow on `useWindowDimensions().width < 600`; desktop keeps inline buttons.
- **On-canvas viz labels compete with overlays on narrow screens.** Keep axis titles short ("a(n)", not "a(n) (log scale)" — the "?" guide explains scaling), give floating controls like `VizSwitcher` an opaque backing, and back head-labels with a translucent pill (`SkiaLabel` / `drawBackedLabel`) so they read over neon strokes.
- **No decorative emojis** in UI copy, controls, or captions.
- **Web layout:** [`WebPageShell`](src/components/WebPageShell.tsx) centers content (~1280px max). Full-screen viz uses flex column: Controls → viz area → caption; bars must not overlap the canvas.
- **LaTeX (strict):** KaTeX only when copy contains `$…$` or `$$…$$` delimiters (`MathText`). OEIS names, titles, search results, and live numeric readouts use [`PlainText`](src/components/PlainText.tsx) — never auto-render undelimited formulas.
- **Calm UI:** no pulsing badges, blinking “live” dots, or attention-seeking animation outside construction playback.
- **Controls:** plain text labels (Back, Play, Pause, Restart). `testID`s: `controls-back`, `controls-play`, `visualize-screen`, `home-title`, `search-input`.
- **testIDs:** add stable `testID`s when building user-visible flows that E2E covers.

## GitHub issues

When work is issue-linked:

- **Before starting:** `gh issue view N`; verify cited paths still exist.
- **With the PR:** comment with PR link; check off acceptance criteria.
- **Same PR:** feature + tests; do not defer tests.

## Agentic browser / E2E

When Playwright or browser automation is available, **use it** for web UI verification.

| Use E2E for | Still manual |
| --- | --- |
| Home load, search input, navigation to visualize | Animation “feel” on native Skia |
| Controls visible, play/pause toggle, back navigation | Haptics, Android back gesture |
| Caption text / KaTeX presence on web | Device-specific safe areas |

**Practices:**

- E2E runs against Expo web (`playwright.config.ts` starts `expo start --web`).
- Set `E2E_PORT` if 8083 is taken locally.
- Prefer `getByTestId` over brittle text selectors when duplicates exist (e.g. sequence title in card vs header).
- Full-screen load shows **Play** (paused), not Pause.

If no browser tools are available, say so and list manual checks still needed.
