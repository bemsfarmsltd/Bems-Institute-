<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working on this repo (Claude Code + Antigravity + Codex)

This is the live company website for BEMS Institute of Technology
(https://bems-institute.vercel.app). Real students, payments (Paystack) and
admissions run through it. Three AI agents (Claude Code, Antigravity and
Codex) work on it, directed by the owner. Treat every change as production
work.

## Lanes and workspaces

Each agent works only in its own folder, outside OneDrive, and only on tasks
tagged to it in [`TASKS.md`](TASKS.md).

| Agent | Lane | Folder | Branch prefix |
|---|---|---|---|
| Claude Code | Backend, security, deployment (holds Render access), reviews | `C:\dev\bems-*` worktrees | `claude/` |
| Antigravity | Frontend, UI/UX, LMS flows, admin screens | `C:\dev\bems` | `antigravity/` |
| Codex | Review and testing: audits branches before merge, writes tests, docs | `C:\dev\bems-codex` | `codex/` |

- Never edit files in another agent's folder, even to "fix" something.
- Codex's job is to find problems and add tests. A behaviour change in code
  another agent owns gets flagged in `TASKS.md` for that agent, not made
  directly.
- Only Claude Code changes Render settings. No agent reads, edits or commits
  `.env*` files (the tests load them on their own), or touches
  the Neon production database or the owner's saved API keys.

## Coordination
- **Check before you start.** Run `git status` and `git log -5`. Uncommitted
  changes you didn't make belong to another agent or the owner — don't
  commit, revert, reformat or "clean up" them. Ask the owner.
- **One task, one branch.** Never commit straight to `main`, which deploys to
  production. Branch as `claude/<topic>`, `antigravity/<topic>` or
  `codex/<topic>`, and open a PR so CI (`.github/workflows/ci.yml`) runs. The
  owner merges.
- **Claim work in [`TASKS.md`](TASKS.md)** before starting: add your name and
  the files or areas you'll touch. Don't edit files another agent has claimed;
  if you must, note it there and tell the owner.
- **Hand off in writing.** When you finish or stop, update `TASKS.md` with
  what changed, what's left, and anything the other agents must know.

## Quality bar
- Before pushing: `npx tsc --noEmit` and `npm run lint` must pass in both the
  root app and `backend/`, plus `npm test` in `backend/`. Run `npm run build`
  for changes to routing, config or dependencies.
- Keep the frontend and `backend/` in step: API routes live in
  `backend/src/routes`, and the frontend calls them through
  `src/lib/api-client.ts`.
- Database changes go through a Prisma migration in `backend/prisma`. Never
  edit an applied migration, and never run destructive commands (reset, drop,
  `--force`) against the Neon production database.
- Never commit secrets. `.env*` files stay local; new variables go in
  `backend/.env.example` and get noted for the owner to add in Vercel/Render.
- Check that every change works at phone width. Most visitors are on mobile.
- Commit messages follow the existing convention:
  `feat(scope): …`, `fix(scope): …`.
