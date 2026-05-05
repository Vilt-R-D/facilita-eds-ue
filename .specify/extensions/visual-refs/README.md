# Visual Reference Hooks

A speckit hook that threads design assets from `/speckit-specify` through `/speckit-tasks` into the implementer's session.

## What it does

- **after_tasks** — `speckit.visual.prepend-task`
  Reads the `**Input**: User description: "..."` line that `/speckit-specify` writes into `spec.md`, extracts every PNG/SVG path or http(s) URL (deduplicated, first-seen order), and rewrites the leading delimited block of `tasks.md` so `/speckit-implement` loads each image into context before any feature task runs. Idempotent: re-running `/speckit-tasks` replaces the block in place.

## Failure mode

The hook is mandatory (`optional: false`) but its failure is non-fatal:

- The parent `/speckit-tasks` command always reports SUCCESS for its own write.
- The hook emits a warning to stderr in the form `[specify] Warning: visual-refs after_tasks failed: <reason>; tasks.md preserved`.
- `tasks.md` is never partially mutated.

See `specs/003-speckit-visual-hooks/contracts/visual-context-task.md` for the binding output format.

## Layout

```text
.specify/extensions/visual-refs/
├── extension.yml
├── README.md
├── commands/
│   └── speckit.visual.prepend-task.md
└── scripts/
    ├── bash/
    │   └── prepend-task.sh
    └── powershell/
        └── prepend-task.ps1
```

## Hook ordering

Registered as the **first** entry under `hooks.after_tasks` in `.specify/extensions.yml`, so the existing git auto-commit hook (registered second) captures the file mutation in its commit.

## Source spec

- `specs/003-speckit-visual-hooks/spec.md`
- `specs/003-speckit-visual-hooks/plan.md`
- `specs/003-speckit-visual-hooks/quickstart.md`
