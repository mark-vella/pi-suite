# Agent Instructions

## Package Manager

- Use **Vite+** (`vp`) for all repo commands.
- Do not run `pnpm` directly.
- Key commands: `vp help`, `vp check`, `vp run ready`.

## Monorepo

- Workspaces: `extensions/*`.
- Each publishable extension owns its own `pi.extensions` manifest in `extensions/<pkg>/package.json`.
- Run package-specific commands from `extensions/<pkg>/`.

## File-Scoped Commands

| Task                | Command                                        |
| ------------------- | ---------------------------------------------- |
| Typecheck (package) | `cd extensions/<pkg> && vp exec tsgo --noEmit` |
| Lint file           | `vp lint path/to/file.ts`                      |
| Format file         | `vp fmt path/to/file.ts`                       |
| Test file           | `vp test path/to/file.test.ts`                 |
| Full check          | `vp check`                                     |
| Validate            | `vp run ready`                                 |

## Key Conventions

- Import from `vite-plus` and `vite-plus/test` only.
- Never import from `vite` or `vitest` directly.
- Do not install `vitest`, `oxlint`, `oxfmt`, or `tsdown`.
- Treat errors as values (no throw-first patterns); use `better-result` for typed error workflows.
- For adoption patterns, see `.agents/skills/better-result-adopt/`.
- Use `opensrc/sources.json` to find vendored dependency source in `opensrc/`.
- Fetch additional dependency source: `npx opensrc <package|owner/repo>`.
