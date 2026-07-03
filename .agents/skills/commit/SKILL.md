---
name: commit
description: Commits all pending changes to git using a standardized Conventional Commits message. USE WHEN the user says "commit", "commit this", "commit these changes", or asks to save work to git with a proper message.
---

# Commit — Standardized Git Commits

Goal: turn the current working-tree changes into **one well-formed commit** (or a small, logical series) using a consistent message format — never a vague "fix stuff" message, never a silent `git commit -a`.

## Rules

1. **Only commit when explicitly asked.** If invoked, that request counts as the ask — do not re-confirm, but never chain into this skill from unrelated work.
2. **Never stage blindly.** Use `git add <specific files>`, not `git add -A` / `git add .` — avoids sweeping in `.env`, credentials, or unrelated in-progress work.
3. **Never use destructive or history-rewriting flags** (`--amend`, `--no-verify`, `--force`) unless the user explicitly asks.
4. **One logical change per commit.** If the working tree mixes unrelated changes (e.g. a Jenkins→Actions migration AND an unrelated bug fix), split into separate commits rather than bundling.
5. **Respect pre-commit hooks** (`lint-staged` / Prettier). If a hook modifies files during commit, that's expected — do not re-run with `--no-verify` to bypass a failure; fix the underlying issue instead.

## Workflow

### Step 1 — Survey

Run in parallel:

```bash
git status
git diff HEAD
git log --oneline -10
```

`git status` shows untracked files (never use `-uall`). `git diff HEAD` shows staged + unstaged changes. `git log` shows this repo's real message style (see Message format below — it's mixed, but Conventional Commits is the target going forward).

### Step 2 — Determine type and scope

Classify the change using [Conventional Commits](https://www.conventionalcommits.org/):

| Type       | When                                                          |
| ---------- | ------------------------------------------------------------- |
| `feat`     | New user-facing capability (endpoint, entity, UI, service)    |
| `fix`      | Bug fix                                                       |
| `refactor` | Behavior-preserving code restructure                          |
| `chore`    | Tooling, CI, deps, infra, config — no runtime behavior change |
| `docs`     | Markdown/doc-only changes                                     |
| `test`     | Test-only changes                                             |
| `perf`     | Performance improvement                                       |

Derive **scope** from the affected Nx project(s) where unambiguous — check touched paths against `bun nx show projects` or `apps/backend/*`, `library/backend/*`, `apps/frontend/*`. Examples: `feat(trips-service): ...`, `chore(ci): ...`, `fix(auth): ...`. Omit the scope if changes span many unrelated projects (e.g. a repo-wide infra change) — use just `chore: ...`.

### Step 3 — Draft the message

Format:

```
<type>(<scope>): <imperative, present-tense summary, ≤70 chars>

<1-3 sentence body: WHY this change, not what — the diff already shows what>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

- Summary: imperative mood ("add", "fix", "remove" — not "added"/"fixes"), no trailing period, capitalize first word after the `type(scope):` prefix.
- Body: optional for trivial changes, required when the "why" isn't obvious from the diff (e.g. replacing infra, migrating a pattern, working around a bug). Skip restating file names — that's what `git show` is for.
- Never mention "Claude" or Claude Code anywhere except the required `Co-Authored-By` trailer.

### Step 4 — Stage and commit

```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
<type>(<scope>): <summary>

<body>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git status
```

If pre-commit hooks (lint-staged/Prettier) modify files, they're auto re-staged by the hook — verify with the final `git status` that the tree is clean and the commit succeeded.

### Step 5 — Handle hook failures

If a hook fails (lint error, type error), the commit does **not** happen. Fix the underlying issue, re-stage, and re-run Step 4 as a **new** commit attempt — never `--no-verify` to force past a real failure.

## What NOT to do

- Don't invent a commit message from the task description alone — always base it on the actual `git diff`.
- Don't commit files likely to contain secrets (`.env`, `credentials.json`, private keys) — warn the user instead.
- Don't squash unrelated changes into one commit for convenience.
- Don't push after committing unless separately asked (see the `pull-request` skill for that flow).
