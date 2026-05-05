---

description: "Task list for feature 003-speckit-visual-hooks"
---

# Tasks: Speckit Visual Reference Hooks

**Input**: Design documents from `/specs/003-speckit-visual-hooks/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/extension-manifest.yml`, `contracts/visual-references-section.md`, `contracts/visual-context-task.md`, `quickstart.md`

**Tests**: Required by project constitution (E2E policy from feature `002-playwright-story-tests`). One Playwright `test(...)` per user story lives in `tests/003-speckit-visual-hooks.ts`. Tests use Node `child_process` against the bash scripts; no browser `page` fixture is required.

**Organization**: Phase 3 implements User Story 1 (after_specify hook). Phase 4 implements User Story 2 (after_tasks hook). Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Story label (US1, US2). Setup, Foundational, and Polish tasks have no story label.
- File paths in descriptions are repo-relative.

## Path Conventions

This feature is a speckit extension, not a runtime block. Source paths live under `.specify/extensions/visual-refs/`. Tests live under `tests/`. The aggregator config is `.specify/extensions.yml`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lay down the new extension's directory tree and manifest so subsequent phases have a stable home to write into.

- [X] T001 Create extension directory tree at `.specify/extensions/visual-refs/` with subdirs `commands/`, `scripts/bash/`, `scripts/powershell/`
- [X] T002 [P] Author extension manifest at `.specify/extensions/visual-refs/extension.yml` following `specs/003-speckit-visual-hooks/contracts/extension-manifest.yml` exactly (id `visual-refs`, both commands declared under `provides.commands`, both hooks declared under `hooks.after_specify` / `hooks.after_tasks` with `optional: false`)
- [X] T003 [P] Author one-pager `.specify/extensions/visual-refs/README.md` describing the two hooks, their failure mode, and the link to `specs/003-speckit-visual-hooks/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the new hooks into the active aggregator so any later script work can be exercised end-to-end via `/speckit-specify` and `/speckit-tasks`. Required before US1 or US2 can be tested through the real slash-command flow.

**⚠️ CRITICAL**: Until T004 lands, neither story is reachable through the speckit CLI; story phases assume the aggregator is wired.

- [X] T004 Modify `.specify/extensions.yml`: insert a new entry as the **first** item under `hooks.after_specify` (`extension: visual-refs`, `command: speckit.visual.extract-refs`, `enabled: true`, `optional: false`, `prompt: null`, `description`, `condition: null`) and a parallel entry as the **first** item under `hooks.after_tasks` (`command: speckit.visual.prepend-task`, same fields). The existing git entries MUST remain in place, second on each list, byte-identical.

**Checkpoint**: Aggregator now declares both hooks as mandatory and ahead of the git auto-commit. Story phases can begin in parallel.

---

## Phase 3: User Story 1 - Capture visual references during /specify (Priority: P1) 🎯 MVP

**Goal**: After `/speckit-specify`, the resulting `spec.md` carries a `## Visual References` section listing every PNG/SVG path or URL that appeared in the input, with deduplication and original casing preserved. Failure of the hook surfaces as a non-fatal warning.

**Independent Test**: Run `/speckit-specify "build hero, design at C:\designs\hero.png and icon at <https://cdn.example.com/icons/icon.svg>"` and confirm `spec.md` gains a `## Visual References` section listing both files between the front-matter and `## User Scenarios & Testing`. Re-run with input that has no images and confirm `spec.md` is unchanged.

### Tests for User Story 1 (REQUIRED by constitution E2E policy) ⚠️

> Write the test FIRST and watch it fail; the implementation tasks below make it pass.

- [X] T005 [P] [US1] Add `test('User Story 1 - extracts PNG/SVG references into spec.md', ...)` to `tests/003-speckit-visual-hooks.ts`. The test seeds four temp `spec.md` fixtures and invokes `.specify/extensions/visual-refs/scripts/bash/extract-refs.sh` against each via `child_process.execFileSync`. Assertions: (a) **multi-reference fixture** (mixed PNG/SVG paths + http URL + duplicate) produces a `## Visual References` section with deduplicated, original-cased entries in first-seen order, positioned **after** the `**Input**:` line and **before** any `## Clarifications` / `## User Scenarios & Testing` heading (covers FR-002 / FR-010 / SC-001); (b) **no-reference fixture** leaves `spec.md` byte-identical (covers FR-003 / SC-005); (c) **wrap-char fixture** strips leading `"`,`'`,`<`,`(` and trailing `"`,`'`,`>`,`)`,`.`,`,`,`;`,`:` correctly; (d) **failure-mode fixture** with a corrupted `**Input**:` line (missing closing quote) MUST cause the script to exit non-zero, write the warning string `[specify] Warning: visual-refs after_specify failed: …; spec.md preserved without Visual References section` to stderr, and leave `spec.md` byte-identical (covers FR-011). All four assertions wrapped in a single `test(...)` whose total wall-clock is asserted < 5000ms via `Date.now()` deltas around each `execFileSync` call (covers SC-004). Must use `@playwright/test` `test()` + `expect()`, no `page` fixture.

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement `.specify/extensions/visual-refs/scripts/bash/extract-refs.sh` per `specs/003-speckit-visual-hooks/contracts/visual-references-section.md`. Accepts a single arg: absolute path to `spec.md`. Reads the `**Input**: User description: "..."` line, runs the canonical regex, strips wrap/punct chars, deduplicates, and rewrites `spec.md` with the `## Visual References` section between the front-matter and the next `##` heading. On zero references, exits 0 and leaves `spec.md` untouched. On any error, exits non-zero and prints the warning line specified in the contract to stderr. Bash 4+, no PyYAML.
- [X] T007 [P] [US1] Implement `.specify/extensions/visual-refs/scripts/powershell/extract-refs.ps1` as a feature-parity mirror of T006. Same single-argument contract, same regex via `[regex]::Matches`, same exit codes and warning text. PowerShell 5.1 compatible.
- [X] T008 [US1] Author `.specify/extensions/visual-refs/commands/speckit.visual.extract-refs.md`. Slash-command Markdown that, when fired by the speckit host as the `after_specify` hook, (a) reads `.specify/init-options.json` to pick bash vs powershell, (b) resolves the active feature's `spec.md` via `.specify/feature.json`; if `feature.json` is missing or unparseable, fall back to `.specify/scripts/bash/common.sh::find_feature_dir_by_prefix` (or its powershell equivalent), (c) invokes the chosen script, (d) on non-zero exit captures the stderr warning line and re-emits it to the user-visible output without aborting `/speckit-specify`. Mirrors the structure of `.specify/extensions/git/commands/speckit.git.commit.md`. Depends on T006 + T007 (both scripts must exist before the command is wired).

**Checkpoint**: User Story 1 complete and independently shippable as MVP. After this point, every `/speckit-specify` run on the project produces a populated Visual References section when images are referenced. No tasks.md mutation yet.

---

## Phase 4: User Story 2 - Pull visual context into /implement via tasks.md (Priority: P1)

**Goal**: After `/speckit-tasks`, the leading block of `tasks.md` is the idempotent `<!-- visual-context-task:start -->`/`end` region listing every reference recorded in `spec.md`. Re-running `/speckit-tasks` replaces the block in place with no duplication. If `spec.md` has no Visual References section, `tasks.md` is left byte-identical.

**Independent Test**: With a `spec.md` carrying a non-empty Visual References section, run `/speckit-tasks` and confirm `tasks.md` begins with the delimited T000 block listing each image. Run `/speckit-tasks` again and confirm the file is byte-identical to the previous output. Remove the Visual References section, run `/speckit-tasks` once more, and confirm the block is gone and the rest of `tasks.md` is byte-identical to the no-block baseline.

### Tests for User Story 2 (REQUIRED by constitution E2E policy) ⚠️

- [X] T009 [P] [US2] Add `test('User Story 2 - prepends idempotent visual-context task to tasks.md', ...)` to `tests/003-speckit-visual-hooks.ts`. The test seeds a temp dir with both `spec.md` (carrying a Visual References section) and `tasks.md`. It invokes `.specify/extensions/visual-refs/scripts/bash/prepend-task.sh` and asserts: (a) `tasks.md` now begins with the exact `<!-- visual-context-task:start -->` block matching `contracts/visual-context-task.md`, including indented reference lines and trailing single blank line (covers FR-005 / SC-002); (b) running the script a second time leaves `tasks.md` byte-identical (covers FR-006 / SC-002 idempotency); (c) clearing the Visual References section in `spec.md` and re-running removes the block and leaves the rest byte-identical to the original `tasks.md` (covers FR-008 / SC-005); (d) **failure-mode fixture** with a malformed `## Visual References` section (heading present, body lines missing the `- name: link` shape) MUST cause the script to exit non-zero, write the warning string `[specify] Warning: visual-refs after_tasks failed: …; tasks.md preserved` to stderr, and leave `tasks.md` byte-identical to the pre-invocation state (covers FR-012). Total wall-clock asserted < 5000ms via `Date.now()` deltas around each `execFileSync` call (covers SC-004). Use `@playwright/test`, no `page` fixture.

### Implementation for User Story 2

- [X] T010 [P] [US2] Implement `.specify/extensions/visual-refs/scripts/bash/prepend-task.sh` per `specs/003-speckit-visual-hooks/contracts/visual-context-task.md`. Accepts a single arg: absolute path to the feature directory (containing both `spec.md` and `tasks.md`). Parses the `## Visual References` body from `spec.md`, deletes any existing visual-context block from `tasks.md` (literal start/end marker match), and either rewrites a fresh block or leaves `tasks.md` clean if the section is empty. Single trailing blank line after the block. On error, exits non-zero and prints the contract warning line.
- [X] T011 [P] [US2] Implement `.specify/extensions/visual-refs/scripts/powershell/prepend-task.ps1` as feature-parity mirror of T010. Same arg contract, same delete-and-rewrite semantics, same exit codes and warning text.
- [X] T012 [US2] Author `.specify/extensions/visual-refs/commands/speckit.visual.prepend-task.md`. Slash-command Markdown that, when fired by the speckit host as `after_tasks`, picks bash vs powershell from `.specify/init-options.json`, resolves the active feature dir via `.specify/feature.json` (with the same `find_feature_dir_by_prefix` fallback specified in T008 if `feature.json` is missing/unparseable), invokes the chosen script, and surfaces any stderr warning to the user without aborting `/speckit-tasks`. Mirrors the structure of T008. Depends on T010 + T011.

**Checkpoint**: Both user stories independently functional. End-to-end flow from `/speckit-specify` through `/speckit-tasks` to `/speckit-implement` now carries visual context into the implementer's session.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate cross-platform parity, project-wide hygiene, and the documented quickstart before the PR ships.

- [X] T013 [P] Run the bash smoke from `specs/003-speckit-visual-hooks/quickstart.md` steps 1–3 on Windows Git Bash and on macOS/Linux. Resolve any CRLF/LF or path-quoting differences in `extract-refs.sh` / `prepend-task.sh` (prefer `printf` over `echo`, force LF line endings via `tr -d '\r'` or git `.gitattributes` rules). **Definition of done**: both platforms produce byte-identical `## Visual References` and `tasks.md` output (verified via `cmp` or `diff`) for the quickstart fixture; commit any normalization changes alongside this task.
- [X] T014 [P] Update `CLAUDE.md` "Active Technologies" and "Recent Changes" sections to record `003-speckit-visual-hooks` (in the same style as the existing `002-playwright-story-tests` entry). Do not touch the `<!-- SPECKIT START -->` block (already pointed at the active plan).
- [X] T015 Run `npm run lint` (must pass with zero errors) and `npm test -- tests/003-speckit-visual-hooks.ts` (both story tests must pass). Fix any lint or test failures before proceeding.
- [ ] T016 Execute `specs/003-speckit-visual-hooks/quickstart.md` end-to-end on the local checkout — including step 4 (real `/speckit-specify` and `/speckit-tasks` against a scratch feature) — and confirm every "Expected" outcome matches. Capture any deviations as follow-up tasks before opening the PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must precede T002/T003 (they write into the directory T001 creates). T002 and T003 can run in parallel afterwards.
- **Foundational (Phase 2)**: T004 has no code dependency on Phase 1 (it edits `.specify/extensions.yml`, not the new extension dir), but the manifest in T002 references the same command names so T004 should ship in the same PR. The Phase 2 checkpoint is "aggregator wired" — once T004 lands, Phase 3 and Phase 4 can proceed in parallel.
- **User Stories (Phases 3, 4)**: Each story is independent (different scripts, different commands, different file targets). Both can be developed in parallel by different people once T004 is in.
- **Polish (Phase 5)**: T013 depends on T006/T007/T010/T011 (the scripts must exist to run the smoke). T014 depends on US2 landing (so the recent-changes line is accurate). T015 depends on T005 + T009 + the script implementations being committed. T016 depends on every prior phase.

### User Story Dependencies

- **US1 (P1)**: Foundational complete. Independently testable via T005 + script in T006.
- **US2 (P1)**: Foundational complete. Independently testable via T009 + script in T010. Does not depend on US1's implementation, but relies on the same `## Visual References` format described in `contracts/visual-references-section.md`. As long as US2's test seeds its own fixture spec carrying that section, the two stories can ship in any order.

### Within Each User Story

- Test (T005 / T009) MUST be written and FAIL before the matching implementation tasks are merged.
- Bash and PowerShell script implementations (T006/T007 and T010/T011) can run in parallel (different files).
- The slash-command Markdown task (T008 / T012) depends on both script tasks completing for that story.

### Parallel Opportunities

- T002 and T003 in parallel (different files under `.specify/extensions/visual-refs/`).
- After T004: all of T005, T006, T007 in parallel for US1; all of T009, T010, T011 in parallel for US2 — a four-developer team can ship both stories simultaneously.
- In Polish: T013 and T014 in parallel.

---

## Parallel Example: User Story 1

```bash
# Once T001–T004 are complete, kick off all of US1's parallel tasks:
Task: "Add Playwright test for US1 in tests/003-speckit-visual-hooks.ts"          # T005
Task: "Implement extract-refs.sh in .specify/extensions/visual-refs/scripts/bash/" # T006
Task: "Implement extract-refs.ps1 in .specify/extensions/visual-refs/scripts/powershell/" # T007

# Then run T008 (depends on T006 + T007):
Task: "Author speckit.visual.extract-refs.md slash command"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001–T003): extension directory + manifest + README.
2. Complete Phase 2 (T004): aggregator wired (US2 entry can stay no-op until T010 lands; the missing script will only matter once T012 wires it through, so no production runs are affected).
3. Complete Phase 3 (T005–T008): US1 fully functional — `/speckit-specify` populates Visual References.
4. **STOP and VALIDATE** with the US1 independent test. Ship the MVP.

### Incremental Delivery

1. Setup + Foundational → directory and aggregator ready.
2. Add US1 → Test independently → ship MVP.
3. Add US2 → Test independently → ship the implement-side context loader.
4. Polish → cross-platform verification + lint + quickstart end-to-end.

### Parallel Team Strategy

- One developer takes T001–T004 (single-stream, ~30 min).
- Two developers split US1 and US2; each develops their script + test + slash command independently.
- Polish handled by the developer who finishes second.

---

## Notes

- `[P]` tasks operate on different files with no dependency on incomplete tasks.
- Both user stories carry the `[US1]` / `[US2]` labels per the constitution's traceability requirement.
- Tests are mandatory here per the constitution's E2E policy (feature 002), even though the speckit tasks template marks them OPTIONAL by default.
- Commit after each task or logical group; the project's git extension auto-commit hook will batch the spec/plan/tasks files. Manual commits for code/test files.
- Avoid editing `.specify/extensions.yml` outside T004; one PR, one diff.
- This feature's own spec.md `**Input**:` line contains no actual `.png` / `.svg` filenames, so when `/speckit-tasks` runs at end of this phase, the after_tasks hook (once T010 + T012 land) will correctly no-op against this feature's `tasks.md`. Validate that no-op behaviour as part of T013.
