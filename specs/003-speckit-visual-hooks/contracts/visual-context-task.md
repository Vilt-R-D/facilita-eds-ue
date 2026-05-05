# Contract: visual-context task block in `tasks.md`

This file is the binding contract for the prepended visual-context task that the after_tasks hook writes (or removes) at the top of `tasks.md`.

## Insertion point

The block MUST occupy positions starting at line 1 of `tasks.md`, before any pre-existing content. It MUST be followed by exactly one blank line before the original first line of `tasks.md` resumes.

If the block already exists (delimited by the `start`/`end` HTML comment markers), the existing block — including its trailing blank line — MUST be removed and the rewrite (or deletion) applied in place. No content outside the block may be touched.

## Markers

Exact text, no variations:

```markdown
<!-- visual-context-task:start -->
…
<!-- visual-context-task:end -->
```

The hook implementations MUST locate any prior block by literal string match on these two markers, on their own lines.

## Body

When the block is emitted (i.e., `spec.md` has a non-empty `## Visual References` section), the body inside the markers MUST be:

```markdown
- [ ] **T000** Load visual references from `spec.md`
  - <name1>: <link1>
  - <name2>: <link2>
  …
```

Indentation rules:

- The task line uses Markdown checkbox syntax (`- [ ]`).
- Each reference line is indented exactly **two spaces** before the `-`.
- The `<name>: <link>` payload is copied verbatim from the corresponding bullet of `## Visual References` in `spec.md` (no re-extraction from the `**Input**:` line).

The reference order MUST match the order of bullets in `spec.md`.

## Skip-write rule

If `spec.md` has no `## Visual References` heading, or the section's body is empty, the hook MUST:

1. Remove any pre-existing visual-context block (start/end markers and contents) from `tasks.md`.
2. Emit nothing in its place.
3. Leave the rest of `tasks.md` byte-identical (this enables FR-008 and SC-005).

## Failure mode

On extraction or write failure the hook MUST NOT partially mutate `tasks.md`. It MUST exit with non-zero status and emit a one-line warning to stderr:

```text
[specify] Warning: visual-refs after_tasks failed: <reason>; tasks.md preserved
```

The parent `/speckit-tasks` command MUST still report SUCCESS, mirroring FR-011 for the after_specify hook.

## Idempotency

Running the hook N times in a row against unchanged `spec.md` MUST yield byte-identical `tasks.md` after every run starting from N=1.

## Example

**`spec.md` Visual References**:

```markdown
## Visual References

- hero.png: C:\designs\hero.png
- icon.svg: https://cdn.example.com/icons/icon.svg
```

**`tasks.md` (input, immediately after `/speckit-tasks`)**:

```markdown
# Tasks: …

## Setup

- [ ] **T001** First task…
```

**`tasks.md` (output, after_tasks hook)**:

```markdown
<!-- visual-context-task:start -->
- [ ] **T000** Load visual references from `spec.md`
  - hero.png: C:\designs\hero.png
  - icon.svg: https://cdn.example.com/icons/icon.svg
<!-- visual-context-task:end -->

# Tasks: …

## Setup

- [ ] **T001** First task…
```

A subsequent run with the same `spec.md` produces the **same** output (no duplicate block). A run with an empty Visual References section restores the input shape.
