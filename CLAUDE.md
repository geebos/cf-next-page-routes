# 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

# 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

# 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

# 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# 5. Development Branch Workflow

**All changes happen on development branches. Main stays clean.**

## Before Any Change

1. If on `main`, create a development branch: `dev/<short-description>` (e.g., `dev/fix-login`, `dev/add-export`)
2. If already on a dev branch, continue on it
3. If there are uncommitted changes on `main`, stash them first, then create the branch

## During Development

- All commits go to the development branch
- Commit freely — squash merge will consolidate them later
- Never push the dev branch unless the user explicitly asks

## After User Confirms Completion

1. Verify all changes are committed on the dev branch
2. Ask user: "All changes verified? Ready to squash merge into main?"
3. Once confirmed:
   - `git checkout main && git pull origin main`
   - `git merge --squash <dev-branch>`
   - Commit with a single message that **summarizes all changes** on the branch — a bullet-point summary of what was done and why
   - `git push origin main`
   - Delete the dev branch locally and remotely: `git branch -d <dev-branch> && git push origin --delete <dev-branch>`

## Squash Commit Message Format

```
<short title summarizing all changes on this branch>

- <change 1>
- <change 2>
- <change 3>
```

Use `git log main..<dev-branch> --oneline` to review all commits before writing the squash message. The message must cover every meaningful change, not just the last commit.

# 6. Subagent & Worktree Discipline

**When dispatching multiple subagents for parallel implementation:**

## File Ownership

- **One file, one agent.** Never dispatch two agents that modify the same file — they will conflict on cherry-pick.
- Design implementation tracks along file boundaries. If two tracks conceptually overlap on a file, merge them into one track or sequence them.
- Check file overlap before dispatching: scan each track's "Files" list for shared paths.

## Isolation

- **Always use `isolation: "worktree"`** when dispatching implementation agents. Without it, agents commit directly to the dev branch, bypassing isolation.
- The worktree handles branch creation and cleanup automatically — just pass the parameter.
- Agents in worktrees cannot pollute the dev branch or each other's working trees.

## Agent Scope

- Each agent prompt must start with a hard boundary: "Only modify these files: [list]. Do NOT touch any other file."
- Specify exact file paths, not patterns or directories.
- If an agent needs to read a file for context but not modify it, state that explicitly: "Read X for context. Do NOT edit X."

## Cherry-pick Hygiene

- Before cherry-picking an agent's worktree commit, ensure the working tree is clean: `git checkout HEAD -- <file>` for any dirty files.
- **After every cherry-pick, verify the target branch actually got the commit.** Cherry-pick can silently skip (empty commit), leaving the worktree commit orphaned. Run `git log --oneline -3` and confirm the commit message appears on the current branch.
- If a cherry-pick is empty (changes already applied or skipped), use the raw commit hash from the agent's worktree branch: `git cherry-pick <hash>` — don't rely on branch refs which may have been deleted.
- Verify each cherry-pick with `npx tsc --noEmit` before moving on.

## Sequential vs Parallel

- Parallel dispatch is safe only when file ownership is non-overlapping.
- When uncertain, dispatch sequentially. The time saved by parallelism is not worth the merge conflict cost.
- Review agents can always run in parallel with implementation agents (they only read files).