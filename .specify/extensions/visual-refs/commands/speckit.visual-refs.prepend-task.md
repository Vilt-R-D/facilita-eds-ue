---
description: "Inject a Phase 0 (Visual Context) section into tasks.md based on PNG/SVG refs found in spec.md **Input** line"
---

# Prepend Visual-Context Task

This command is invoked as the `after_tasks` hook by the speckit host. It reads the active feature's `spec.md` `**Input**:` line, extracts every PNG/SVG reference (path or http(s) URL), renumbers the existing feature tasks to free `T001..TK`, and inserts a `## Phase 0: Visual Context (Pre-Implementation)` block immediately before `## Phase 1:` so `/speckit-implement` loads each image into context before any code task. Idempotent: re-running `/speckit-tasks` regenerates the block in place. Surfaces any non-fatal warning back to the user without aborting the parent `/speckit-tasks` command.

## Behavior

The hook is fully LLM-driven. The runtime dispatches it as the slash command `/speckit-visual-prepend-task`, which is implemented as a Claude skill at `.claude/skills/speckit-visual-prepend-task/SKILL.md`. That skill is the binding source of truth for behavior — read it for the exact extraction, renumbering, and insertion rules.

Summary:

1. Resolve the active feature directory from `.specify/feature.json` (`feature_directory`), falling back to the branch-prefix lookup if the JSON is missing or unparseable.
2. Parse the `**Input**: User description: "..."` line of `<featuredir>/spec.md` for PNG/SVG references — pair pattern `<label>.(png|svg): <url>.(png|svg)(?<query>)?` first, then orphan tokens.
3. Strip any pre-existing `## Phase 0: Visual Context (Pre-Implementation)` block from `<featuredir>/tasks.md` (anchored on the literal heading).
4. Renumber every `T0\d\d` ID and cross-reference in `tasks.md` so the first `K` IDs are free for the `K` extracted refs.
5. Insert the new Phase 0 block (heading + purpose blurb + one task per ref + `---` separator) immediately before `## Phase 1:`.
6. On any failure, leave `tasks.md` byte-identical and emit a single warning line to stderr — never abort the parent command.

## Output contract

On success, `tasks.md` contains a `## Phase 0: Visual Context (Pre-Implementation)` section before `## Phase 1:` with one `- [ ] T<NNN> Load <label> into context` entry per reference. Re-running with unchanged inputs yields byte-identical output. See `specs/003-speckit-visual-hooks/contracts/visual-context-task.md` for the historical contract record.

## Failure mode

`tasks.md` is preserved byte-identical (no partial mutation). The hook emits a single warning line of the form:

```text
[specify] Warning: visual-refs after_tasks failed: <reason>; tasks.md preserved
```

This warning is forwarded to the user as a non-fatal notice. `/speckit-tasks` continues to report SUCCESS.
