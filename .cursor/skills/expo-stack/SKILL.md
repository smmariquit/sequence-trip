---
name: expo-stack
description: >-
  Load official Expo/EAS agent skills for Sequence Trip. Use for Expo Router,
  native UI, data fetching, SDK upgrades, EAS Build/Update/Submit, or store work.
---

# Expo stack (official skills)

Official Expo Skills live at `~/.agents/skills/` (Claude: `expo@claude-plugins-official`). Read the matching skill before Expo/EAS changes.

| Task | Skill |
| --- | --- |
| Screens / HIG | `~/.agents/skills/expo-native-ui/SKILL.md` |
| Expo Router | `~/.agents/skills/expo-router/SKILL.md` |
| Data fetching | `~/.agents/skills/expo-data-fetching/SKILL.md` |
| SDK upgrade | `~/.agents/skills/expo-upgrade/SKILL.md` |
| Dev client | `~/.agents/skills/expo-dev-client/SKILL.md` |
| Store release | `~/.agents/skills/eas-app-stores/SKILL.md` |
| EAS Workflows | `~/.agents/skills/eas-workflows/SKILL.md` |
| OTA insights | `~/.agents/skills/eas-update-insights/SKILL.md` |
| Cloud sim | `~/.agents/skills/eas-simulator/SKILL.md` |
| `@expo/ui` | `~/.agents/skills/expo-ui/SKILL.md` |
| Native modules | `~/.agents/skills/expo-module/SKILL.md` |

Docs: https://docs.expo.dev/skills/

## Repo overrides (win on conflict)

- Platform viz: update both Skia `*.tsx` and web `*.web.tsx` when behavior is shared ([AGENTS.md § Visualizations](../../AGENTS.md#visualizations)).
- OTA vs store: [docs/ota-compliance.md](../../docs/ota-compliance.md).
- Session workflow: [sequence-trip-agent-workflow](../sequence-trip-agent-workflow/SKILL.md).
- Web E2E: [playwright-e2e](../playwright-e2e/SKILL.md).

Prefer `npx expo install`. Use Expo MCP when available.
