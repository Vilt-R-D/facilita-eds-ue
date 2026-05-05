# Quickstart: Speckit Visual Reference Hooks

A developer dropping into this feature should be able to verify the two hooks end-to-end in under five minutes. The flow below uses the bash scripts on macOS/Linux/Git Bash; PowerShell mirrors are equivalent.

## Prerequisites

- This branch (`feat/speckit-visual-hooks`) checked out.
- The implementation has landed: `.specify/extensions/visual-refs/` exists and `.specify/extensions.yml` has the new entries as the **first** items under `hooks.after_specify` and `hooks.after_tasks`.
- Node 18+ for the Playwright meta-test.

## 1. Smoke test — after_specify hook in isolation

Create a fixture spec and run the script directly (this bypasses the full `/speckit-specify` flow so you can iterate without committing branches):

```bash
mkdir -p /tmp/visual-refs-smoke
cat > /tmp/visual-refs-smoke/spec.md <<'EOF'
# Feature Specification: Smoke

**Feature Branch**: `feat/smoke`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "build hero, design at C:\designs\hero.png and icon at <https://cdn.example.com/icons/icon.svg>"

## User Scenarios & Testing *(mandatory)*

(body)
EOF

bash .specify/extensions/visual-refs/scripts/bash/extract-refs.sh /tmp/visual-refs-smoke/spec.md
cat /tmp/visual-refs-smoke/spec.md
```

Expected: a `## Visual References` section appears between the `**Input**:` line and `## User Scenarios & Testing`, listing `hero.png` and `icon.svg`.

## 2. Smoke test — after_tasks hook in isolation

With the spec from step 1 in place, seed a `tasks.md`:

```bash
cat > /tmp/visual-refs-smoke/tasks.md <<'EOF'
# Tasks: Smoke

## Setup

- [ ] **T001** Some task
EOF

bash .specify/extensions/visual-refs/scripts/bash/prepend-task.sh /tmp/visual-refs-smoke
cat /tmp/visual-refs-smoke/tasks.md
```

Expected: the file now begins with the `<!-- visual-context-task:start --> … <!-- visual-context-task:end -->` block listing both references, followed by a blank line and the original `# Tasks: Smoke` heading.

Run the same command again. Expected: byte-identical output (idempotency check).

## 3. Skip-write check — empty input

Repeat step 1 with an `**Input**:` line that mentions no images:

```bash
sed -i 's|build hero.*|add a privacy toggle to the cookie modal.|' /tmp/visual-refs-smoke/spec.md
diff <(bash .specify/extensions/visual-refs/scripts/bash/extract-refs.sh /tmp/visual-refs-smoke/spec.md && cat /tmp/visual-refs-smoke/spec.md) /tmp/visual-refs-smoke/spec.md
```

Expected: empty diff (the hook left the file untouched).

## 4. End-to-end via /speckit-* commands

On a scratch branch, invoke the real slash commands:

```bash
# In Claude Code:
# /speckit-specify "build a footer block, design at ./mocks/footer.png"
# Confirm spec.md has the Visual References section.

# /speckit-tasks
# Confirm tasks.md begins with the visual-context-task block.
```

## 5. Run the Playwright meta-test

```bash
npm test -- tests/003-speckit-visual-hooks.ts
```

Expected: two `test(...)` cases pass — one per user story. No browser is launched; the test invokes the bash scripts via `child_process` and asserts on file output.

## Troubleshooting

- **Hook didn't fire after `/speckit-specify`**: confirm the entry in `.specify/extensions.yml` under `hooks.after_specify` lists `extension: visual-refs` as the **first** item and that `enabled: true`.
- **`spec.md` unchanged but input had a `.png`**: check that the path token isn't surrounded by characters outside the strip set (e.g., parentheses around the entire path). Refine the `**Input**:` text and re-run.
- **`tasks.md` has two visual-context blocks**: the start/end markers must be exact. If a previous (manual) experiment left a stale block with mismatched markers, delete it once and re-run.
- **PowerShell on Windows fails with execution policy errors**: run with `pwsh -ExecutionPolicy Bypass -File ...` for the spike, then commit a permanent fix to the slash-command Markdown to use the same prefix.
