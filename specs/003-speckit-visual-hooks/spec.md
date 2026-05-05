# Feature Specification: Speckit Visual Reference Hooks

**Feature Branch**: `feat/speckit-visual-hooks`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "preciso criar dois hooks speckit para aperfeiçoar o workflow de implement. o primeiro hook deve, após o specify, popular o spec.md com o nome e o link de arquivos png/svg fornecidos no input do specify (imagino que dê para recuperar já que o hook é disparado dentro da mesma sessão claude), que podem servir como referência visual da feature. o outro hook deve ser disparado depois do tasks, com um prepend de tasks para recuperar essas imagens e ter esse contexto visual na sessão para desenvolver o componente."

## Clarifications

### Session 2026-05-05

- Q: When the mandatory after_specify hook fails, what is the user-visible outcome? → A: `/speckit-specify` reports SUCCESS for the spec write, then reports the hook failure as a non-fatal warning; `spec.md` keeps everything except the **Visual References** section.
- Q: How is ordering between the new visual hook and the existing git auto-commit hook on `after_specify` guaranteed? → A: Hooks execute in `.specify/extensions.yml` declaration order; the visual hook is registered as the first entry under `after_specify`, git commit second.
- Q: Which input source does the after_specify hook parse to find PNG/SVG references? → A: Parse the `**Input**: User description: "..."` line in `spec.md` (already persisted by `/speckit-specify`); extraction does not depend on conversation transcript access.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture visual references during /specify (Priority: P1)

A feature author runs `/speckit-specify` and includes one or more PNG/SVG file paths or URLs in the feature description (e.g., a Figma export saved locally, a design screenshot, an icon mockup). After the specification is generated, an automatic hook scans the original specify input, extracts every PNG/SVG reference (name + link), and writes them into a dedicated **Visual References** section of `spec.md`. The author opens `spec.md` and immediately sees which design assets back the feature.

**Why this priority**: Without visual references persisted in the spec, the design intent gets lost between phases. This is the foundation that the second hook depends on.

**Independent Test**: Run `/speckit-specify "build hero block, design at C:\designs\hero.png and icon.svg"`, then open the resulting `spec.md` and confirm a **Visual References** section lists `hero.png` and `icon.svg` with their paths. Even without the second hook, the spec already carries the visual context for any human or AI reader.

**Acceptance Scenarios**:

1. **Given** the author runs `/speckit-specify` with a description containing one PNG path, **When** the after-specify hook fires, **Then** `spec.md` gains a **Visual References** section listing that file's name and full path.
2. **Given** the author runs `/speckit-specify` with a description containing multiple PNG/SVG references (mix of local paths and URLs), **When** the after-specify hook fires, **Then** every PNG/SVG reference is captured exactly once with original casing and path preserved.
3. **Given** the author runs `/speckit-specify` with a description that contains no PNG/SVG references, **When** the after-specify hook fires, **Then** `spec.md` is left unchanged and no empty **Visual References** section is added.

---

### User Story 2 - Pull visual context into /implement via tasks.md (Priority: P1)

After running `/speckit-tasks`, an automatic hook prepends a setup task at the top of `tasks.md` that instructs the implementer (Claude session running `/speckit-implement`) to load the visual references recorded in `spec.md` before generating any code. When the author then runs `/speckit-implement`, the first action is a load of those PNG/SVG files into the session, so the implementing agent has the design in context for every subsequent task.

**Why this priority**: The whole point of capturing references in Story 1 is to have them in the implementer's working context. Without this hook, references sit in the spec but never reach the agent that builds the component.

**Independent Test**: After Story 1 has populated `spec.md` with at least one visual reference, run `/speckit-tasks` and confirm `tasks.md` starts with a `T000` (or equivalent prepended) task whose action is "Load visual references from spec.md". Run `/speckit-implement` and confirm the agent reads the listed image files before working on any feature task.

**Acceptance Scenarios**:

1. **Given** `spec.md` contains a non-empty **Visual References** section, **When** the after-tasks hook fires, **Then** `tasks.md` is modified so that its first task instructs the implementer to load each listed image.
2. **Given** the author re-runs `/speckit-tasks` on a feature that already has a prepended visual-context task, **When** the after-tasks hook fires again, **Then** the prepended task is replaced (not duplicated) so `tasks.md` still has exactly one such task at the top.
3. **Given** `spec.md` has no **Visual References** section or that section is empty, **When** the after-tasks hook fires, **Then** `tasks.md` is left unchanged.

---

### Edge Cases

- Author references a file that does not exist on disk (typo, moved file): the after-specify hook still records the name and link as written; validity is not silently corrected. The after-tasks hook also records it; the implementer reports the missing file at /implement time.
- Author references the same image twice in the specify input: the **Visual References** section deduplicates by full path, listing each image once.
- Author edits `spec.md` after /specify and adds/removes images by hand: the after-tasks hook reads the **Visual References** section as the source of truth (not the original specify input) so manual edits are honored.
- Author renames the **Visual References** section heading manually: the after-tasks hook fails to find references and treats the spec as having none (no prepended task added). Author must keep the heading exact.
- Specify input contains a PNG/SVG reference inside a code block or quoted text used as illustration only: the hook extracts it anyway. Author must rephrase if they want to exclude it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect PNG and SVG references by parsing the `**Input**: User description: "..."` line that `/speckit-specify` writes verbatim into `spec.md`, recognizing both local file paths (absolute or relative, Windows or POSIX style) and URLs (http/https). Conversation transcript access is NOT required.
- **FR-002**: System MUST add a **Visual References** section to `spec.md` immediately after the front-matter block (the four bold lines `Feature Branch`, `Created`, `Status`, `Input`) and **before** any pre-existing `## Clarifications` or `## User Scenarios & Testing` heading. Each detected image is listed as `- <name>: <path-or-url>`, where `<name>` is the file's basename.
- **FR-003**: System MUST skip writing the **Visual References** section entirely when no PNG/SVG references were detected in the specify input.
- **FR-004**: System MUST register the first hook under `hooks.after_specify` in `.specify/extensions.yml` with `enabled: true`, `optional: false` (mandatory), and a clear extension/command identifier.
- **FR-005**: System MUST detect existing visual references in `spec.md` after `/speckit-tasks` runs and prepend a single setup task to `tasks.md` that instructs the implementer to read each image file into context before any other task is executed.
- **FR-006**: System MUST treat the prepended task as idempotent — re-running `/speckit-tasks` MUST replace any existing prepended visual-context task instead of stacking duplicates.
- **FR-007**: System MUST register the second hook under `hooks.after_tasks` in `.specify/extensions.yml` with `enabled: true`, `optional: false`, and a clear extension/command identifier.
- **FR-008**: System MUST leave `tasks.md` untouched when `spec.md` has no **Visual References** section or the section is empty.
- **FR-009**: System MUST preserve the existing `after_specify` git auto-commit hook behavior; the new hooks MUST coexist with the git extension and not block the commit step. The visual extraction hook MUST be registered as the first entry under `hooks.after_specify` in `.specify/extensions.yml` and the git commit hook second, so that declaration order yields "visual mutates spec.md → git commits the mutated spec.md". The same declaration-order rule applies to `hooks.after_tasks`: the visual-context-prepend hook is registered first, git commit second.
- **FR-010**: System MUST deduplicate image references (by full normalized path/URL) so that the same asset listed twice in the specify input appears only once in `spec.md`.
- **FR-011**: When the after_specify visual hook fails (extraction error, IO error, or any non-zero exit), `/speckit-specify` MUST still report SUCCESS for the spec write and surface the hook failure as a non-fatal warning to the author. `spec.md` MUST be preserved exactly as written by the core specify step, just without the **Visual References** section. The mandatory flag (`optional: false`) signals that the hook always runs, not that its failure aborts the parent command.
- **FR-012**: When the after_tasks visual hook fails (extraction error from `spec.md`, IO error against `tasks.md`, or any non-zero exit), `/speckit-tasks` MUST still report SUCCESS for the tasks write and surface the hook failure as a non-fatal warning to the author. `tasks.md` MUST NOT be partially mutated — on failure the file MUST be byte-identical to its post-`/speckit-tasks` state (no half-written visual-context block). Same `optional: false` semantics as FR-011 apply.

### Key Entities

- **Visual Reference**: A pair of (basename, full path or URL) extracted from the original specify input. Lives in the **Visual References** section of `spec.md` as the persistence point between phases.
- **Visual-Context Task**: A single, prepended entry in `tasks.md` whose action is to load every Visual Reference listed in `spec.md` into the implementing session's context before any feature task runs.
- **Hook Registration Entry**: A YAML record in `.specify/extensions.yml` under `hooks.after_specify` and `hooks.after_tasks`, identifying which extension command runs and whether it is mandatory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For 100% of `/speckit-specify` runs whose input contains at least one PNG/SVG reference, the resulting `spec.md` contains a **Visual References** section listing every referenced image, with no manual edit required from the author.
- **SC-002**: For 100% of `/speckit-tasks` runs against a spec that has a non-empty **Visual References** section, `tasks.md` starts with a single setup task that names each referenced image; re-running `/speckit-tasks` does not increase the count of such setup tasks beyond one.
- **SC-003**: (Outcome metric, observed across implementations) An implementer running `/speckit-implement` opens at least one referenced image file as part of the first task in 100% of features that carry visual references, eliminating the prior step where the author had to paste image paths into chat manually. Verified by manual review of the first three production runs of `/speckit-implement` against features carrying a Visual References section, not by automated test.
- **SC-004**: Hook execution adds no more than **5 seconds** of latency to the `/speckit-specify` and `/speckit-tasks` flows on a reference-shape spec (`spec.md` ≤ 100 KB, ≤ 200 PNG/SVG references, `tasks.md` ≤ 100 KB). Larger inputs are out of scope for this budget.
- **SC-005**: Specs and task files for features without visual references are byte-identical to what the equivalent unhooked workflow would produce (zero collateral changes).

## Assumptions

- Speckit hooks registered under `after_specify` / `after_tasks` execute after the parent command has finished writing its primary file (`spec.md` / `tasks.md`); the canonical input for the visual hook is the persisted `**Input**:` line in `spec.md`, not the live conversation transcript.
- The specify input is the only source of truth for visual references at /specify time; references introduced later via `/speckit-clarify` are out of scope for the first hook (manual edits to `spec.md` remain possible).
- Only PNG and SVG file extensions are recognized; other formats (jpg, webp, pdf, fig) are out of scope and can be added later.
- Visual references may be local filesystem paths (Windows or POSIX) or http(s) URLs; FTP, S3, and other schemes are out of scope.
- The implementing agent's session has permission (via the Read tool) to load any local image path written into `spec.md` — file access policy is handled outside this feature.
- The after-tasks hook trusts the **Visual References** section in `spec.md` as authoritative, which means manual edits there will be honored on the next `/speckit-tasks` run.
- The git auto-commit hooks already present in `.specify/extensions.yml` continue to run after the new hooks. (Ordering rule itself is normative and lives in FR-009; this assumption documents that we are *layering on top of* the existing git extension rather than replacing it.)
