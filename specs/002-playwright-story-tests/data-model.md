# Data Model — Playwright Tests Per User Story

This feature introduces no runtime data model (no database, no API state). The "data" in scope is the set of filesystem and configuration entities that enforce the 1:1 feature↔test mapping. Each entity below describes the shape reviewers and tooling rely on.

## Entities

### Feature Spec

- **Physical location**: `specs/<NNN-short-name>/spec.md`.
- **Authoritative for**: the list of user stories a feature must test.
- **Discovery rule**: any directory under `specs/` whose name matches `^NNN-[a-z0-9-]+$` and contains a `spec.md` is a Feature Spec.
- **Relevant content**: `### User Story N - <title> (Priority: P1|P2|...)` headings in `spec.md`. Count of these headings = required test count.
- **Lifecycle**: created by `/speckit.specify`; updated by `/speckit.clarify` and direct authoring; consumed by `/speckit.tasks` and this feature's reviewer checklist.

### User Story

- **Physical location**: a `### User Story N` section inside a Feature Spec.
- **Required sub-sections** (for the policy to be testable): `**Acceptance Scenarios**:` with at least one `Given/When/Then` bullet.
- **Identity**: the position `N` in the heading and the `<title>` free-text.
- **Relationship**: each User Story maps to exactly one test in the corresponding Feature Test File (FR-002).
- **Change semantics**: adding, removing, renaming, renumbering, or splitting a User Story obligates the Feature Test File to be updated before merge (FR-008).

### Feature Test File

- **Physical location**: `tests/<NNN-short-name>.ts` where `<NNN-short-name>` is the exact full spec directory name (FR-004).
- **Required content**:
  - A top-level `import { test, expect } from '@playwright/test';` (or an equivalent Playwright test-runner import).
  - One `test('<story reference>', async ({ page }) => { ... })` call per User Story in the paired Feature Spec.
  - Each test MUST navigate via a relative path (e.g., `await page.goto('/blocks/<feature-slug>');`) so the base URL is controlled by `playwright.config.ts`.
  - Each test MUST assert every Acceptance Scenario listed under its story (FR-002, SC-002).
- **Naming of individual tests**: test names MUST reference the story they verify (e.g., by story title, by "User Story N", or by "US<N>: <title>"). Reviewers rely on this reference when confirming the 1:1 mapping (FR-011).
- **Invariants**: exactly one file per Feature Spec; never located outside `tests/`; always uses `.ts` extension.

### Preview Page

- **Physical location**: published by AEM EDS at `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>`.
- **Branch scoping**: one Preview Page per branch. The feature-branch preview is the pre-merge target; the `develop` preview is the post-merge regression target.
- **Feature-slug**: defaults to the short-name portion of the spec directory name (the part after the `NNN-` prefix); a feature MAY override by constructing the slug explicitly in its tests if its AEM page is authored under a different path.
- **Availability**: AEM EDS publishes a preview only after content and code are present on the target branch. Tests run before the preview is available will fail with navigation errors — this is the expected signal, not a bug.

### Playwright Configuration

- **Physical location**: `playwright.config.ts` at the repository root.
- **Responsibilities**:
  - Resolve `use.baseURL` from `process.env.BASE_URL`, defaulting to `https://develop--facilita-eds-ue--vilt-r-d.aem.page`.
  - Declare `testDir: 'tests'` and `testMatch: '*.ts'` so every file at `tests/*.ts` is picked up automatically (supports US2 by requiring zero per-feature config).
  - Select Chromium as the sole project.
  - Set retries to `2` under CI, `0` locally (per research §8).
  - Choose `reporter: process.env.CI ? 'github' : 'html'`.
- **Stability contract**: the fields above are the reviewer's touchpoints. Changes to them are themselves a spec-level concern (they affect every feature's tests).

### Reviewer Checklist

- **Physical location**: embedded in the PR review process (also captured in this feature's `contracts/reviewer-checklist.md`).
- **Items** (derived from FR-011):
  1. `tests/<full-spec-directory-name>.ts` exists in the PR.
  2. The file's test count equals the User Story count in the paired `spec.md`.
  3. Each test's name references a specific User Story.
  4. The PR body or a linked run demonstrates these tests passing against the feature-branch preview URL.
- **Relationship**: the Reviewer Checklist is the only enforcement mechanism in this policy (no automated gate).

## Relationships (summary)

- `Feature Spec 1..1 ───── 1..1 Feature Test File` (FR-001, FR-004)
- `Feature Spec 1..1 ───── 1..N User Story` (1..N where N ≥ 1; zero-story spec is blocked per Edge Cases)
- `User Story 1..1 ───── 1..1 Test inside Feature Test File` (FR-002)
- `Feature Spec 1..1 ───── 0..2 Preview Page` (0 before publish, 1 on a single branch, 2 when both branch-preview and develop-preview exist)
- `Playwright Configuration 1..1 ───── 1..N Feature Test File` (shared config for all test files)

## State transitions relevant to the policy

- **Spec authored** → at least one User Story exists.
- **Feature Test File created** → one test per existing User Story; file lives at `tests/<spec-dir>.ts`.
- **User Story mutated (add/remove/rename/split)** → Feature Test File must be updated before merge (FR-008).
- **PR opened to `develop`** → reviewer runs the Reviewer Checklist; green required before approval.
- **Merge to `develop`** → post-merge regression re-run against the `develop` preview (FR-010).
- **Feature reverted** → tests remain; they will fail against `develop` preview until re-merge or co-revert of tests (Edge Cases).
