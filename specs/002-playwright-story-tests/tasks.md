---

description: "Task list for feature 002-playwright-story-tests"
---

# Tasks: Playwright Tests Per User Story

**Input**: Design documents from `/specs/002-playwright-story-tests/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ (all present)

**Tests**: For this specific feature, the "tests" are the policy deliverable itself — the meta-tests in `tests/002-playwright-story-tests.ts` that verify the scaffolding. They are therefore treated as implementation tasks, not optional. Future features following this policy will author browser E2E tests per story instead.

**Organization**: Tasks are grouped by user story so each phase can be verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps the task to a specific user story (US1, US2, US3)
- Every task includes an exact file path

## Path Conventions

Repository-root layout (per plan.md Structure Decision):

- New: `tests/` (top-level), `playwright.config.ts` (root)
- Updated: `package.json`, `.gitignore`, `CLAUDE.md`, `.docs/Pacotes Nodes.md`, `.specify/memory/constitution.md`
- Untouched: `blocks/`, `scripts/`, `styles/`, `models/`, auto-generated root JSON files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Playwright, create the `/tests` directory, and wire the npm scripts so the runner is invocable.

- [X] T001 Update `package.json` — add `"@playwright/test": "^1.x"` to `devDependencies`, and add the `"test": "playwright test"` and `"test:develop": "BASE_URL=https://develop--facilita-eds-ue--vilt-r-d.aem.page playwright test"` scripts per `contracts/test-runner-cli.md`
- [X] T002 [P] Append `test-results/` and `playwright-report/` to `.gitignore` (create the file if missing)
- [X] T003 [P] Create the `tests/` directory at the repository root (add a `.gitkeep` if needed to preserve the empty directory until T009 adds the reference file)
- [X] T004 [P] `npm install` run (3 packages added). `npx playwright install chromium` intentionally deferred — this feature's meta-tests do not use the `page` fixture and therefore do not require a browser binary; the one-time install is documented in CLAUDE.md for downstream features that do need it

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the shared configuration, dependency justification, constitution amendment, and convention documentation that every User Story of this feature (and every future feature) relies on.

**CRITICAL**: No user story phase can complete until T005–T008 are in place — US1/US2/US3 meta-tests all depend on `playwright.config.ts` existing and on the reviewer being able to find the convention documented.

- [X] T005 [P] Create `playwright.config.ts` at the repository root implementing the full surface in `specs/002-playwright-story-tests/contracts/playwright-config.md`: `testDir: 'tests'`, `testMatch: '**/*.ts'`, `use.baseURL = process.env.BASE_URL ?? 'https://develop--facilita-eds-ue--vilt-r-d.aem.page'`, single `chromium` project, `retries: process.env.CI ? 2 : 0`, `workers: 1`, `reporter: process.env.CI ? 'github' : 'html'`
- [X] T006 [P] Edit `.docs/Pacotes Nodes.md` — add an entry for `@playwright/test` justifying the devDependency per Constitution Principle II (Zero Dependencies): purpose, scope (devDependency only), alternatives rejected (rationale summarised from `specs/002-playwright-story-tests/research.md` §1)
- [X] T007 [P] Amend `.specify/memory/constitution.md` — replace the "No test suite" rule in Development Workflow & Tooling with an "E2E tests" paragraph referencing feature 002. Version bumped 1.0.0 → 1.1.0. Sync Impact Report updated with the change and prior-history line
- [X] T008 [P] Edit `CLAUDE.md` — removed "There is no test suite in this project." Added test commands under `## Commands` (npm test, test:develop, BASE_URL override, single-file run, one-time browser install). Added "Testing" bullet under `## Conventions` referencing the spec, reviewer checklist, and quickstart

**Checkpoint**: Foundation ready — `playwright.config.ts` exists, `@playwright/test` is installable, documentation points to the policy. User story phases may now begin.

---

## Phase 3: User Story 1 — Each user story has a corresponding end-to-end test (Priority: P1) 🎯 MVP

**Goal**: Establish the 1:1 story-to-test mapping as an executable, self-verifying rule for this feature itself — the reference test file contains exactly one test per user story in the paired spec, and that mapping is machine-checkable.

**Independent Test**: Run `npm test -- tests/002-playwright-story-tests.ts`; the US1 meta-test passes only when the number of `### User Story` headings in `specs/002-playwright-story-tests/spec.md` equals the number of `test(...)` calls in `tests/002-playwright-story-tests.ts`. Remove one of the three `test()` calls and the US1 meta-test should fail — proving the policy is enforced, not decorative.

### Implementation for User Story 1

- [X] T009 [US1] Create `tests/002-playwright-story-tests.ts` with imports (`@playwright/test`, `node:fs`, `node:path`) and three `test(...)` declarations named `'US1: ...'`, `'US2: ...'`, `'US3: ...'`
- [X] T010 [US1] US1 test body: reads `specs/002-playwright-story-tests/spec.md`, counts `### User Story N` headings, counts `^test(` matches in this file, and asserts equality (plus `storyCount > 0`)

**Checkpoint**: The US1 meta-test passes when story count equals test count. Removing or adding a test OR adding or removing a `### User Story` heading must make it fail. This alone satisfies FR-001, FR-002, and FR-004 for this feature and demonstrates the policy end-to-end for the MVP.

---

## Phase 4: User Story 2 — Tests live in a predictable, per-feature location (Priority: P2)

**Goal**: Prove the `/tests` top-level directory convention holds for this feature and is discoverable by mechanical inspection.

**Independent Test**: Run `npm test -- tests/002-playwright-story-tests.ts -g "US2"`; the US2 meta-test passes only when `tests/` exists at the project root and `__filename` resolves inside it with the exact name `002-playwright-story-tests.ts`. Move the file to any other directory and the test fails.

### Implementation for User Story 2

- [X] T011 [US2] US2 test body: asserts `tests/` exists at repo root, `dirname(__filename)` equals the tests directory, and `basename(__filename)` equals `002-playwright-story-tests.ts` (pins FR-004)

**Checkpoint**: US1 + US2 both verified. A developer who violates the naming rule (`.spec.ts`, `.test.ts`, missing prefix, wrong directory) gets a test failure, not a style nit.

---

## Phase 5: User Story 3 — Tests target the EDS branch preview (pre-merge) and develop preview (post-merge) (Priority: P2)

**Goal**: Prove the dual-preview targeting mechanism is in place — `playwright.config.ts` resolves `baseURL` from `BASE_URL` with the `develop` preview host as the documented fallback. Tests run against feature-branch preview pre-merge and develop preview post-merge by varying only one env var.

**Independent Test**: Run `npm test -- tests/002-playwright-story-tests.ts -g "US3"`; the US3 meta-test passes only when importing the config produces a resolved `baseURL` equal to the `develop` preview fallback when `BASE_URL` is unset, and equal to an injected value when `BASE_URL` is set. If someone hardcodes the host in config, or drops the env-var fallback, this test fails.

### Implementation for User Story 3

- [X] T012 [US3] US3 test body: reads `playwright.config.ts` as text and asserts (a) it references `process.env.BASE_URL`, (b) contains the `develop` preview host as the default, (c) uses `??` or `||` for fallback — i.e., `BASE_URL` provably overrides the default. This source-level check avoids the Node module-cache issue that would break a dynamic re-import approach

**Checkpoint**: All three user stories verified by meta-tests running against the real `@playwright/test` runner. `npm test -- tests/002-playwright-story-tests.ts` produces three green results.

---

## Phase 6: Validation & PR Readiness

**Purpose**: Produce the reviewer evidence and run through the documented quickstart to confirm nothing is broken.

- [X] T013 [P] Ran `npx playwright test tests/002-playwright-story-tests.ts --reporter=list`. All three meta-tests passed (US1 39ms, US2 21ms, US3 5ms; 3 passed in 1.8s). Evidence suitable for PR description captured
- [X] T014 [P] Quickstart commands verified: `npm install` succeeded (3 packages added), `npm test` ran the full suite against the default (develop preview) base URL and passed. `npx playwright install chromium` deferred (not needed by these meta-tests; documented in CLAUDE.md for downstream features)
- [X] T015 Ran `npm run lint`. Files added/modified by this feature (`package.json`, `.gitignore`, `playwright.config.ts`, `tests/002-playwright-story-tests.ts`, `.docs/Pacotes Nodes.md`, `CLAUDE.md`, `.specify/memory/constitution.md`) produce zero lint errors. The CRLF linebreak errors visible in the output come from pre-existing files in `blocks/`, `scripts/`, and the root `.eslintrc.js` — Git autocrlf artifacts on this Windows checkout, unrelated to this feature and out of scope
- [ ] T016 Open the PR against `develop`. In the PR description, link the spec (`specs/002-playwright-story-tests/spec.md`), the reviewer checklist (`contracts/reviewer-checklist.md`), and paste the T013 passing-run evidence. Explicitly call out the self-exception: this feature does not publish a `/blocks/<slug>` page (per the spec's own Assumptions) and uses meta-tests instead of a browser E2E navigation. **This is a user action — not performed by `/speckit.implement`.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. T001 must complete before T005 (config needs the package installed) and T006 (justification must match the devDep actually added). T007 and T008 documentation tasks can run as soon as the plan is agreed; they do not need the package installed.
- **Phase 3 (US1)**: Depends on Phase 2 — the test file imports from `@playwright/test` (T001) and sits in `tests/` (T003) and relies on `playwright.config.ts` (T005).
- **Phase 4 (US2)**: Depends on Phase 3 only to the extent that the test file T009 creates must exist; T011 appends to it.
- **Phase 5 (US3)**: Depends on Phase 3 (file exists) and Phase 2 (T005, config to inspect).
- **Phase 6 (Validation)**: Depends on Phases 3, 4, and 5 all being complete.

### User Story Dependencies

- **US1 (P1)**: Independent at the policy level — can ship alone as the MVP (just the 1:1 mapping rule, demonstrated).
- **US2 (P2)**: Ride on top of US1 (the reference test file already exists). At the policy level the `/tests` location is independently meaningful.
- **US3 (P2)**: Same — parametrized `baseURL` is independently meaningful, but the meta-test to prove it lives in the same file as US1 and US2 tests.

### File-level note

All three user-story phases (Phase 3/4/5) edit the same file: `tests/002-playwright-story-tests.ts`. That is intentional for this feature — one test file per feature is the policy, and this feature's file is the reference. T009 creates the file; T010, T011, T012 are sequential edits to it. They MUST NOT be marked `[P]`.

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel with each other; T001 edits `package.json` and should land first since T004 relies on the `npm install` it enables.
- **Phase 2**: T005, T006, T007, T008 all edit different files and can run in parallel.
- **Phase 6**: T013 and T014 are independent verification activities and can run in parallel.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# All four foundational tasks touch different files and can run in parallel
# once Phase 1 is committed:
Task T005: "Create playwright.config.ts at the repository root per contracts/playwright-config.md"
Task T006: "Add @playwright/test justification to .docs/Pacotes Nodes.md"
Task T007: "Amend .specify/memory/constitution.md — remove No test suite line, bump 1.0.0 → 1.1.0"
Task T008: "Update CLAUDE.md — remove No test suite line, add Testing section and convention reference"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: install Playwright, wire scripts, create `/tests`.
2. Phase 2: config + documentation + constitution amendment.
3. Phase 3 (US1): ship the reference test file with the one meta-test proving the 1:1 mapping.
4. **STOP and VALIDATE**: `npm test` green → the MVP demonstrates the policy is real, not aspirational.
5. The MVP is a legitimate PR: it establishes infrastructure and demonstrates the core rule. US2 and US3 meta-tests can land in a follow-up if needed — but in practice they are cheap additions and should ship in the same PR.

### Incremental Delivery

1. Phase 1 + 2 → foundation ready (the project has a test runner and no longer claims "no test suite").
2. Phase 3 (US1) → policy enforced; first demonstration of the 1:1 rule (MVP).
3. Phase 4 (US2) → the file-location rule is machine-checked.
4. Phase 5 (US3) → the dual-preview mechanism is machine-checked.
5. Phase 6 → reviewer evidence packaged, PR ready.

### Parallel Team Strategy

With two developers:

- Dev A: Phase 1 + Phase 2 (infrastructure & documentation).
- Dev B: can begin Phase 3 drafts (skeletons in T009) as soon as Dev A's T001 lands and `@playwright/test` resolves locally.
- Phase 3–5 meta-test bodies sequence on the same file; they are quick and best completed by one developer to avoid merge conflicts in `tests/002-playwright-story-tests.ts`.
- Dev A and Dev B can then run T013 and T014 in parallel during Phase 6.

### Self-exception reminder

This feature's spec says features whose output is not a `/blocks/<slug>` page are exempt from the URL-convention portion of the policy. This feature is one such case. The meta-test approach in Phase 3–5 is the documented handling; reviewers must be told this explicitly in the PR description (T016) so they do not mistakenly search for a missing `/blocks/playwright-story-tests` page.

---

## Notes

- `[P]` tasks touch different files and have no dependency on unfinished `[P]` peers.
- `[Story]` labels appear ONLY on Phase 3/4/5 tasks; Setup, Foundational, and Validation tasks are unlabelled by design.
- Every Phase includes a Checkpoint line stating what "done" looks like for that phase — use these as commit boundaries.
- Commits should be small and scoped to a single phase or single task; avoid bundling Phase 2 documentation changes with Phase 3 test code in one commit.
- Do NOT add per-feature subdirectories under `tests/` — the flat layout is the policy.
- Do NOT hardcode any branch host in `playwright.config.ts` — the env-var override is the SC-005 guarantee.
