---
name: playwright-e2e
description: Runs and debugs Sequence Trip Playwright E2E against Expo web. Use when e2e fails locally or in GitHub Actions, port conflicts, or adding web UI specs.
---

# Playwright E2E (Sequence Trip)

Full policy: [AGENTS.md § Testing pyramid](../../AGENTS.md#testing-pyramid).

## Commands

| Command | Use |
| --- | --- |
| `npm run test:e2e` | Full E2E; starts Expo web via `playwright.config.ts` |
| `E2E_PORT=8099 npm run test:e2e` | Alternate port when 8083 is busy |
| `npx playwright test e2e/home.spec.ts` | Single spec |
| `npx playwright show-report` | After failure with trace |

Config: [`playwright.config.ts`](../../playwright.config.ts). Specs: [`e2e/`](../../e2e/).

## CI

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): builds `oeis.db`, then `npm run test:e2e` with `CI=true` in the E2E job.

## Stable selectors

Prefer `testID`s already in the app:

| testID | Screen |
| --- | --- |
| `home-title` | Home header |
| `search-input` | OEIS search |
| `visualize-screen` | Full-screen viz |
| `controls-back` | Back button |
| `controls-play` | Play / Pause toggle |

## Common failures

| Symptom | Fix |
| --- | --- |
| Port in use | `E2E_PORT=8099 npm run test:e2e` |
| Strict mode violation on text | Scope to `getByTestId('visualize-screen')` or use `.first()` |
| Expect Play but see Pause | Full-screen should start paused; if Pause shows, check `useBuildAnimation` is not calling `restart()` on load |
| Back test fails | Navigate from home first so `router.back()` has history |
| Expo web slow to start | CI timeout is 120s; locally wait for webServer ready |

## Adding specs

1. Add `testID` to RN component if none exists.
2. Put spec in `e2e/*.spec.ts`.
3. Run locally before PR.
4. Keep specs focused on user-visible web behavior; do not assert pixel-perfect canvas output.
