# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| `main` | Yes |

## Reporting a vulnerability

Do **not** open a public issue for security problems.

1. Use [GitHub private vulnerability reporting](https://github.com/smmariquit/oeis-visualize/security/advisories/new) if enabled, or
2. Contact the repository owner via their GitHub profile.

Include steps to reproduce, impact, and affected platforms (web / Android / iOS).

## Automated scanning

- **CodeQL** runs on push, PR, and weekly (`.github/workflows/codeql.yml`).
- **Dependabot** opens weekly dependency update PRs (`.github/dependabot.yml`).
- **Dependency Review** blocks PRs that introduce critical CVEs.

Enable **Dependabot security updates** and **secret scanning** in the repository Settings → Code security when available.
