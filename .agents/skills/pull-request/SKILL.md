---
name: pull-request
description: Creates a GitHub pull request for the current branch with a standardized description, test report, and checklist. USE WHEN the user says "create a PR", "open a pull request", "make a PR for this", or asks to submit the current branch for review.
---

# Pull Request — Standardized PR Creation

Goal: open **one PR** for the current branch with a consistent, reviewable description — summary, full test report, and a standard checklist — never a bare `gh pr create` with an empty body.

## Rules

1. **Always ask for the base branch** — every invocation, even if you think you know it. Never assume `main`/`master` silently; branch conventions change (release branches, `develop`, stacked PRs).
2. **Never force-push or rewrite history** to prepare the PR unless explicitly asked.
3. **Never push directly to the base branch itself.**
4. **Report the PR URL back to the user** when done — that's the deliverable.
5. If `gh` is not installed/authenticated, say so explicitly and fall back to printing the push command + a compare URL — don't fabricate a PR link.

## Workflow

### Step 1 — Ask for the base branch

Use `AskUserQuestion` (don't just assume):

- Options: `main` (most common default — mark Recommended only if it's clearly the repo default), any other branch visible in `git branch -r` that looks relevant (e.g. a release or staging branch), and let the user free-type via "Other".

```bash
git branch -r
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null   # repo's actual default branch, if set
```

### Step 2 — Survey the branch

Run in parallel:

```bash
git status
git branch --show-current
git fetch origin <base-branch>
git log <base-branch>...HEAD --oneline
git diff <base-branch>...HEAD --stat
```

If the current branch has no commits ahead of `<base-branch>`, stop and tell the user — nothing to open a PR for.

If there are uncommitted changes, ask whether to commit them first (use the `commit` skill) — don't silently leave them out of the PR.

### Step 3 — Run the test report

Before drafting the PR body, get real results — don't claim tests pass without running them:

```bash
bun nx affected -t lint test build --base=<base-branch> --head=HEAD
```

Capture the pass/fail summary per project. If something fails, tell the user and ask whether to fix it first or note it as a known failure in the PR — don't silently omit failures from the Test Report section.

If the branch touches areas covered by the `qa` skill (broad/cross-cutting changes), consider running the fuller `bun nx run-many -t lint test` instead and note that this ran the full suite, not just affected.

### Step 4 — Push the branch

```bash
git push -u origin <current-branch>
```

Skip if already up to date with remote (check `git status` output from Step 2).

### Step 5 — Draft the PR body

Use this exact structure:

```markdown
## Summary

<1-4 bullet points: what changed and why, written for a reviewer with no prior context — derive this from `git log <base>...HEAD` and `git diff <base>...HEAD`, not from the task description alone>

## Changes

<Grouped by area/project if the diff spans multiple Nx projects, e.g.:>

- `auth-service`: ...
- `library/backend/config`: ...

## Test Report

<Paste the real output summary from Step 3, e.g.:>

- ✅ `lint` — passed for N affected projects
- ✅ `test` — passed for N affected projects (M tests)
- ✅ `build` — passed for N affected projects
- ⚠️ Note any skipped/failing checks explicitly — do not hide them

## Checklist

- [ ] Code follows existing patterns in the touched project(s) (see `AGENTS.md`/`CLAUDE.md`)
- [ ] `bun nx affected -t lint test build` passes locally (see Test Report above)
- [ ] No new e2e tests/config added (out of scope pre-go-live)
- [ ] Docs updated in the same change if behavior/patterns/endpoints changed (`docs-sync` skill)
- [ ] No secrets or `.env` values committed
- [ ] New env vars (if any) added to `EnvSchema` in `@tc/config`
- [ ] Module boundaries respected (`scope:backend` / `scope:frontend` / `scope:shared`)
- [ ] Migrations committed if entities changed (no reliance on `synchronize: true`)
```

Omit checklist items that are structurally not applicable to this diff (e.g. drop the migrations line if no entities changed) rather than leaving them unchecked and irrelevant — but don't drop items just because they're inconvenient.

### Step 6 — Create the PR

```bash
gh pr create --base <base-branch> --title "<type(scope): concise title, ≤70 chars>" --body "$(cat <<'EOF'
<the drafted body from Step 5>
EOF
)"
```

Title format matches the `commit` skill's Conventional Commits style (`feat(trips-service): ...`, `chore(ci): ...`).

If `gh` is unavailable or unauthenticated:

```bash
gh --version || echo "gh not installed"
gh auth status
```

Tell the user explicitly, then fall back to:

```bash
git push -u origin <current-branch>
```

And give them the manual compare URL shape: `https://github.com/<owner>/<repo>/compare/<base-branch>...<current-branch>?expand=1` — do not claim a PR was created if it wasn't.

### Step 7 — Report back

Give the user the PR URL (from `gh pr create` output) or the fallback compare URL. One or two sentences — no need to repeat the full body back to them, they can see it in the PR.

## What NOT to do

- Don't skip Step 1 because the user "probably means main" — ask every time, per the rules above.
- Don't write a Test Report section from memory/assumption — run the commands in Step 3.
- Don't use `--admin` to bypass branch protection or merge the PR yourself — this skill only **opens** PRs.
- Don't include unrelated commits in the PR — if `git log <base>...HEAD` shows commits that don't belong, flag it to the user before proceeding.
