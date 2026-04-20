# Implementation Plan: Playwright Tests Per User Story

**Branch**: `002-playwright-story-tests` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-playwright-story-tests/spec.md`

## Summary

Establish a project-wide policy and supporting infrastructure so that every new feature contributes exactly one Playwright test file at `tests/<full-spec-dir-name>.ts`, containing one comprehensive end-to-end test per user story in its paired `spec.md`. Tests target the AEM EDS preview URL pattern `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` — feature-branch preview as the pre-merge acceptance gate, `develop` preview as the post-merge regression gate — and the same test logic runs against either by varying only the `<branch>` segment. Enforcement is via PR reviewer checklist (no automated CI gate is required by this policy).

This feature delivers: (1) `@playwright/test` installed as a devDependency; (2) a top-level `tests/` directory with a parametrized `playwright.config.ts` at project root; (3) an environment-variable-driven base URL so the same suite can target either preview host; (4) documentation updates in `CLAUDE.md` and `.docs/Pacotes Nodes.md`; (5) a constitution amendment removing the "No test suite" statement; (6) a reference/template test file illustrating the convention for downstream features.

## Technical Context

**Language/Version**: TypeScript 5.x for test files (`tests/*.ts`). Node.js 18 LTS or newer for the Playwright runner. The existing application code remains vanilla JavaScript — TypeScript is scoped to the `tests/` tree.
**Primary Dependencies**: `@playwright/test` (latest stable 1.x) as the only new devDependency. Playwright bundles its own TypeScript toolchain; no separate `typescript` / `ts-node` package is required for test authoring.
**Storage**: N/A. Tests operate over HTTP against AEM EDS preview URLs; no persisted state in the test project.
**Testing**: `@playwright/test` is itself the testing framework introduced by this feature and used by all downstream features.
**Target Platform**: Node.js for the test runner; Chromium (Playwright default) for browser execution. Tests exercise public HTTPS previews on `*.aem.page` hosts.
**Project Type**: Frontend-infrastructure addition to an existing AEM EDS site. The repo gains a top-level `tests/` directory alongside `blocks/`, `scripts/`, `styles/`, and `models/`.
**Performance Goals**: Soft target — an individual feature's test file completes in under 60s on a warm preview. The policy itself imposes no hard performance SLA.
**Constraints**:
- `@playwright/test` must remain a devDependency only — it MUST NOT ship in the production bundle or be imported by `scripts/`, `blocks/`, or `styles/` code paths.
- Tests target deployed previews; they do NOT spin up a local `aem up` server.
- The base URL is resolved from an environment variable at test-run time, so one config serves both the pre-merge (feature-branch preview) and post-merge (`develop` preview) gates.
- This feature itself does not publish a `/blocks/<slug>` page, so per the spec's Assumptions it is self-exempt from the URL-convention portion of the policy. Its "tests" are meta-checks on scaffolding, not browser E2E against a rendered page.
**Scale/Scope**: One test file per feature; grows linearly with the number of features. Initial delivery = infrastructure + one reference/example file illustrating the convention.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluation against `.specify/memory/constitution.md` (v1.0.0):

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Block Self-Containment (NON-NEGOTIABLE) | PASS (N/A) | This feature does not add a `blocks/{name}/` block. |
| II. Zero Dependencies | **Justified violation** | Adds `@playwright/test` devDependency. The principle permits this if documented in `.docs/Pacotes Nodes.md`; that documentation is a deliverable of this feature. |
| III. Performance-First Loading (E-L-D) | PASS (N/A) | Tests are dev/CI-time only; never loaded by the delivered page. No impact on LCP or E-L-D phases. |
| IV. CSS Scoping | PASS (N/A) | No CSS introduced. |
| V. Universal Editor Compliance | PASS (N/A) | No `_{name}.json` partials introduced. |
| EDS Technical Constraints: URL pattern | PASS | Spec locks tests to the existing `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page` pattern explicitly named in the constitution. |
| EDS Technical Constraints: Unix line endings, 2-space indent, `.js` import extension | PASS | `tests/*.ts` files will follow project conventions (Unix `\n`, 2-space indent); `.js` extension rule applies to JS imports, not TS. |
| Development Workflow: "No test suite" statement | **Amendment required** | The constitution explicitly states "This project has no automated test framework." That statement is the direct object of this feature and must be amended (MINOR version bump 1.0.0 → 1.1.0) as part of this PR. |
| Development Workflow: Speckit clarify behavior | PASS (advisory) | This constraint governs `/speckit.clarify` and is orthogonal to `/speckit.plan` and the feature under design. No action for this feature. |

**Gate result**: PASS with two items requiring explicit tracking in Complexity Tracking (Principle II justified violation and the constitution amendment). No unjustified violations remain. Phase 0 may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/002-playwright-story-tests/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/
│   ├── reviewer-checklist.md   # Reviewer enforcement contract
│   ├── playwright-config.md    # Config surface contract
│   └── test-runner-cli.md      # npm-script / CLI contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
tests/                                # NEW — top-level directory (User Story 2)
├── 002-playwright-story-tests.ts     # Meta-tests for this feature (scaffolding assertions)
└── <future-feature>.ts               # One .ts file per future feature, named after its spec directory

playwright.config.ts                  # NEW — shared runner config with env-driven baseURL
package.json                          # UPDATED — adds @playwright/test devDependency + npm scripts
.gitignore                            # UPDATED — excludes test-results/ and playwright-report/
.docs/Pacotes Nodes.md                # UPDATED — justifies @playwright/test per Principle II
CLAUDE.md                             # UPDATED — documents the testing convention for future agent sessions
.specify/memory/constitution.md       # UPDATED — MINOR bump to remove "No test suite" line

# Unchanged
blocks/
scripts/
styles/
models/
component-definition.json             # Auto-generated; untouched
component-models.json                 # Auto-generated; untouched
component-filters.json                # Auto-generated; untouched
```

**Structure Decision**: A single flat top-level `tests/` directory (no per-feature subfolders). A single `playwright.config.ts` at the project root resolves the base URL from the `BASE_URL` environment variable (default: `https://develop--facilita-eds-ue--vilt-r-d.aem.page`), so the identical suite runs against any branch's preview by setting `BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page npm test`. Test file naming follows FR-004 exactly: `tests/<full-spec-directory-name>.ts` (e.g., `tests/002-playwright-story-tests.ts`) — preserves numeric prefix so `/tests` sorts parallel to `/specs` and the feature↔test mapping is mechanical.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| New devDependency `@playwright/test` (Principle II: Zero Dependencies) | The policy's explicit purpose is to introduce Playwright as the E2E testing framework. The spec mandates `.ts` test files navigating real preview pages — there is no vanilla-JS equivalent. | A `fetch`-based smoke suite cannot exercise DOM rendering, block decoration, or visual regressions — it would not satisfy the spec's acceptance scenarios. Puppeteer is an equivalent-weight dependency with fewer testing ergonomics; swapping one framework for another is not simpler. Principle II's escape hatch (justification in `.docs/Pacotes Nodes.md`) is used as intended. |
| Constitution amendment removing "No test suite" line (MINOR bump) | The current constitution explicitly asserts the project has no automated test framework. That statement is the direct object of this feature — it cannot stand unchanged. | There is no alternative: either the feature does not land or the constitution is updated. The amendment is narrowly scoped (one line removed, one replacement line describing the E2E policy) and is a necessary prerequisite. |
