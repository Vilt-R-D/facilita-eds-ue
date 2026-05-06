# Visual Reference Hooks

A speckit hook that threads design assets from `/speckit-specify` through `/speckit-tasks` into the implementer's session.

## What it does

- **after_tasks** — `speckit.visual.prepend-task`
  Reads the `**Input**: User description: "..."` line that `/speckit-specify` writes into `spec.md`, extracts every PNG/SVG path or http(s) URL (deduplicated, first-seen order; `<label>: <url>` pairs preserved verbatim), renumbers existing `T0\d\d` task IDs by the count of refs, and injects a `## Phase 0: Visual Context (Pre-Implementation)` section immediately before `## Phase 1:` of `tasks.md`. Each ref becomes a `- [ ] T<NNN> Load <label> into context` task so `/speckit-implement` walks the references before any feature task. Idempotent: re-running `/speckit-tasks` regenerates the section in place.

The hook is fully LLM-driven. The runtime dispatches `/speckit-visual-prepend-task`, which is implemented as a Claude skill at `.claude/skills/speckit-visual-prepend-task/SKILL.md` — read that file for the binding behavior contract.

## Failure mode

The hook is mandatory (`optional: false`) but its failure is non-fatal:

- The parent `/speckit-tasks` command always reports SUCCESS for its own write.
- The hook emits a warning to stderr in the form `[specify] Warning: visual-refs after_tasks failed: <reason>; tasks.md preserved`.
- `tasks.md` is never partially mutated.

## Layout

```text
.specify/extensions/visual-refs/
├── extension.yml
├── README.md
└── commands/
    └── speckit.visual.prepend-task.md
```

## Hook ordering

Registered as the **first** entry under `hooks.after_tasks` in `.specify/extensions.yml`, so the existing git auto-commit hook (registered second) captures the file mutation in its commit.

## Source spec

- `specs/003-speckit-visual-hooks/spec.md`
- `specs/003-speckit-visual-hooks/plan.md`
- `specs/003-speckit-visual-hooks/quickstart.md`
