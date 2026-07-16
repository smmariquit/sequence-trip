---
name: sequence-trip-agent-workflow
description: Guides agentic coding workflow in Sequence Trip (oeis-visualize), including scoped edits, preserving user work, platform viz constraints, verification cadence, commits, and PR prep. Use before making code changes, committing, or opening PRs in this repository.
---

# Sequence Trip Agent Workflow

Policy (commits, verification tiers, architecture, UX rules) lives in [AGENTS.md](../../AGENTS.md). This skill covers **session execution**.

Domain skills (read when the task matches): [expo-stack](../expo-stack/SKILL.md) (official Expo/EAS), [playwright-e2e](../playwright-e2e/SKILL.md), [agent-handoff](../agent-handoff/SKILL.md).

## Coding practices

- Read the relevant existing code paths and local conventions before editing.
- Keep changes narrowly scoped to the user request; avoid opportunistic refactors.
- Preserve user work in a dirty tree. Do not revert unrelated changes unless the user explicitly asks.
- Prefer existing helpers, playback patterns, viz structure, and theme tokens over new abstractions.
- **Platform files:** if you change draw logic, update both `*.tsx` (Skia) and `*.web.tsx` (canvas) unless the change is platform-only.
- **Do not underestimate agent throughput.** Scoped tasks → one session without hedging.

## Verification cadence

Follow [AGENTS.md § Verify before done](../../AGENTS.md#verify-before-done).

- During iterative edits, prefer targeted unit tests on changed files.
- Run `npm run typecheck` when editing TypeScript.
- Run `npm run test:all` once before commit/PR when UI or playback changed.
- E2E needs a free port (default 8083); set `E2E_PORT` if occupied.
- Native Skia changes: note manual device/emulator smoke in the PR; CI only covers web E2E.

## Commits and PRs

Commit policy and Conventional Commits: [AGENTS.md § Commits](../../AGENTS.md#commits).

- Do not commit unless the user asks.
- Do not end a session with uncommitted completed work unless the user deferred commit or a hook blocked it.
- Before opening a PR, summarize the **full branch diff**, not just the latest commit.
- Push with `-u origin HEAD` only when the user asked to push/open a PR.
- Base branch: **`main`**.

### PR prep checklist

1. Run applicable tests (`test:unit`, `test:integration`, `test:e2e` as needed).
2. For viz changes: confirm web layout (no bar overlap), captions render, playback starts paused on full-screen.
3. For issue-linked work: update AC; comment with PR URL.
4. Call out native-only manual checks when Skia files changed.
