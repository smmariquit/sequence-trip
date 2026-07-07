# Contributing to Sequence Trip

Thanks for helping improve OEIS visualizations.

## Quick paths

| I want to… | Do this |
| --- | --- |
| Report a bug | [Open a bug report](https://github.com/smmariquit/oeis-visualize/issues/new?template=bug_report.yml) |
| Suggest a feature | [Open a feature request](https://github.com/smmariquit/oeis-visualize/issues/new?template=feature_request.yml) |
| Write code | Fork → branch → PR to `main` |

## Development setup

1. Node 20+, `npm ci`
2. `npm run build:db` (first time; downloads OEIS dumps)
3. `npm run web` or `npm start`

Full details: [README.md](README.md)

## Pull requests

- Target branch: **`main`**
- Run `npm run typecheck` and the relevant tests before opening
- UI or playback changes: `npm run test:all`
- Viz changes: update **both** `*.tsx` (Skia) and `*.web.tsx` (canvas) when behavior is shared
- Full-screen sequences start **paused**; only home previews auto-loop
- One focused change per PR when possible

Use the [pull request template](.github/pull_request_template.md).

## Agent / maintainer docs

AI agents and maintainers: read [AGENTS.md](AGENTS.md) and [docs/agent-contract.md](docs/agent-contract.md) before large changes.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) preferred: `feat(viz): …`, `fix(playback): …`, `test(e2e): …`.
