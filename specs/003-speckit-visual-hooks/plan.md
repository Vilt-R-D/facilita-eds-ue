# Implementation Plan: Speckit Visual Reference Hooks

**Branch**: `feat/speckit-visual-hooks` (alias: spec dir `003-speckit-visual-hooks`) | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-speckit-visual-hooks/spec.md`

## Summary

Two new speckit hook commands ship as a single in-tree extension under `.specify/extensions/visual-refs/`. The `after_specify` hook reads the persisted `**Input**: User description: "..."` line from `spec.md`, extracts every PNG/SVG path or http(s) URL, deduplicates, and writes a `## Visual References` section just below the front-matter. The `after_tasks` hook reads that section and rewrites the leading block of `tasks.md` so an idempotent `T000` setup task — delimited by HTML-comment markers — instructs `/speckit-implement` to load each image into context before any feature task runs. Both hooks are registered as the **first** entry on their respective events in `.specify/extensions.yml` so the existing git auto-commit hook (registered second) captures the file mutation. Failure of the after_specify hook surfaces as a non-fatal warning; `spec.md` is preserved without the visual section. A Playwright meta-test (`tests/003-speckit-visual-hooks.ts`, no browser fixture) drives the bash scripts via `child_process` and asserts on the resulting `spec.md` / `tasks.md` byte contents.

## Technical Context

**Language/Version**: Bash 4+ (POSIX-compatible) for the active path; PowerShell 5.1 mirror for Windows users; Markdown for slash-command definitions; YAML 1.2 for the extension manifest. TypeScript 5.x for the Playwright meta-test (Node 18 LTS runner).
**Primary Dependencies**: speckit ≥0.8.5 (already installed); `@playwright/test` 1.x already present as a devDependency from feature 002. No new npm packages. PyYAML is *not* required (the new scripts use grep/sed only).
**Storage**: Filesystem only — `.specify/extensions/visual-refs/`, the aggregator `.specify/extensions.yml`, the per-feature `specs/<dir>/spec.md` and `specs/<dir>/tasks.md`.
**Testing**: `@playwright/test` via `tests/003-speckit-visual-hooks.ts` using Node `child_process` + `fs` to invoke the bash scripts against fixture markdown files; no browser `page` fixture required (mirrors the meta-test pattern noted in `CLAUDE.md` for feature 002).
**Target Platform**: Cross-platform speckit project. Bash scripts must run on macOS, Linux, and Git Bash for Windows; PowerShell scripts must run on Windows PowerShell 5.1 and PowerShell Core 7+.
**Project Type**: Speckit extension (developer tooling). Not a runtime block, not a web service.
**Performance Goals**: Hook execution under 5 seconds on a typical feature spec (SC-004). Targets are easy to hit because both hooks are O(spec size) text munging.
**Constraints**: Zero new npm dependencies (Constitution II). Must coexist with the existing git extension; declaration order in `.specify/extensions.yml` is the only ordering mechanism. `spec.md` and `tasks.md` for features with no visual references must be byte-identical to the unhooked output (SC-005).
**Scale/Scope**: ~10 new files (1 manifest, 2 command Markdowns, 4 scripts, 1 test, ~2 contracts, 1 quickstart). One YAML diff in `.specify/extensions.yml` adding two `after_*` entries. No changes to runtime block code, `scripts/`, or `blocks/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|---|---|---|---|
| I. Block Self-Containment | No | N/A | Feature ships as a speckit extension, not an AEM block. |
| II. Zero Dependencies | Yes | PASS | No new npm packages; PyYAML not required; reuses existing Playwright. |
| III. Performance-First Loading (E-L-D) | No | N/A | No browser-runtime assets are introduced. |
| IV. CSS Scoping | No | N/A | No CSS authored. |
| V. Universal Editor Compliance | No | N/A | No block model JSON authored. |
| EDS Technical Constraints (no nesting, flat HTML, `.js` imports, LF, indentation) | Partial | PASS | Only `.js`-import / LF / indentation rules apply to the TS test file; ESLint config already enforces them. |
| Development Workflow & Tooling — Branching | Yes | PASS | Working on `feat/speckit-visual-hooks`; PR will target `main` via `develop`. |
| Development Workflow & Tooling — E2E tests | Yes | PASS | One `tests/003-speckit-visual-hooks.ts` file with one `test(...)` per user story. Both stories are tooling-level, so the test uses `child_process` against the bash scripts — same meta-test exception called out in `CLAUDE.md` for feature 002. |
| Development Workflow & Tooling — Speckit clarify single-response rule | Yes | NOTE | The /speckit-clarify run that produced this plan asked questions one-per-turn rather than batched. This violates the constitution's "single response" rule for clarify. It does not affect this plan's correctness, but should be raised separately as either a clarify-skill bug or a constitution amendment; **not a blocker for this feature**. |

No principle violations require entries in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-speckit-visual-hooks/
├── plan.md                     # this file
├── research.md                 # Phase 0 output
├── data-model.md               # Phase 1 output
├── quickstart.md               # Phase 1 output
├── contracts/
│   ├── extension-manifest.yml          # canonical shape of .specify/extensions/visual-refs/extension.yml
│   ├── visual-references-section.md    # exact format & regex contract for the spec.md section
│   └── visual-context-task.md          # exact format & idempotency contract for the tasks.md prepend
├── checklists/
│   └── requirements.md                 # already present from /speckit-specify
└── tasks.md                            # produced later by /speckit-tasks
```

### Source Code (repository root)

```text
.specify/
├── extensions.yml                          # MODIFY: add visual-refs entries as the FIRST item under after_specify and after_tasks
└── extensions/
    └── visual-refs/                        # NEW extension
        ├── extension.yml                   # manifest (id, hooks, command file pointers)
        ├── README.md                       # one-pager for the extension
        ├── commands/
        │   ├── speckit.visual.extract-refs.md     # after_specify hook command (calls extract script)
        │   └── speckit.visual.prepend-task.md     # after_tasks hook command (calls prepend script)
        └── scripts/
            ├── bash/
            │   ├── extract-refs.sh                 # parses spec.md Input line, writes Visual References section
            │   └── prepend-task.sh                 # reads Visual References, rewrites delimited T000 in tasks.md
            └── powershell/
                ├── extract-refs.ps1
                └── prepend-task.ps1

tests/
└── 003-speckit-visual-hooks.ts             # NEW: Playwright meta-test (no page fixture)
```

**Structure Decision**: Tooling extension layout mirrors the existing `.specify/extensions/git/` shape (manifest + commands + scripts). The active aggregator `.specify/extensions.yml` is hand-edited because this project's speckit installer was already run; the new extension's own `extension.yml` is shipped for parity and future re-installs. The Playwright test sits next to feature 002's tests under `tests/`, named after the spec dir per the policy in `specs/002-playwright-story-tests/spec.md`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to track. The clarify-single-response observation under Constitution Check is a separate skill/constitution discrepancy, not a complexity introduced by this feature.
