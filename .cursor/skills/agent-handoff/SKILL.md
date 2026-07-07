---
name: agent-handoff
description: >-
  Write structured handoff prompts when ending a session or delegating to another
  agent (Claude, Codex, Cursor). Use when user says handoff, delegate, continue
  in new chat, or epic spans multiple sessions.
---

# Agent handoff

Produce a **copy-paste handoff** the next agent can run without this chat.

## When

- Epic spans multiple PRs or sessions
- User delegates to another model/host
- Context window getting long — prefer fresh session + handoff over continuation

## Handoff template

```markdown
# Sequence Trip — [Epic name]

**Repo:** oeis-visualize · **Workspace:** absolute path
**Read first:** AGENTS.md, docs/agent-contract.md, relevant .cursor/skills/*

## North star
One sentence goal.

## Done (main)
| PR | What |

## In flight
- Branch, PR URL, commit, what's left

## Next steps (ordered)
1. …
2. …

## Key files
- `path` — why

## Verify
- [ ] `npm run test:unit`
- [ ] `npm run test:e2e` (if UI)
- [ ] manual web / native note

## Constraints
- Full-screen viz starts paused
- Both `.tsx` and `.web.tsx` for viz changes
- Commit only when user asks

## Success criteria
- [ ] checkboxes
```

## Rules

- Absolute paths for workspace and key files
- Link open PRs and issues (`#NNN`)
- State what was verified vs not (CI green, E2E local only, native untested)
- Do not paste secrets
