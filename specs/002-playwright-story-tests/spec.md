# Feature Specification: Playwright Tests Per User Story

**Feature Branch**: `002-playwright-story-tests`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "toda nova feature deve ter um teste playwright pra cada user story da spec. deve ser criado uma dir /tests com um arquivo ts contendo todos os testes por story daquela feature. as páginas de teste vão seguir a convenção de urls do EDS, nesse caso, na branch 'develop' após o merge, abaixo de uma página /blocks."

## Clarifications

### Session 2026-04-20

- Q: Must each story's test cover every acceptance scenario in that story, or only a representative one? → A: Every acceptance scenario in the story (comprehensive).
- Q: When must a feature's tests be passing to be considered complete — before merge to develop, or only after? → A: Must pass pre-merge against the feature-branch preview; re-run post-merge on the develop preview as a regression check.
- Q: How is a feature's test file named? → A: `<full-spec-directory-name>.ts`, preserving the numeric prefix (e.g., `tests/002-playwright-story-tests.ts`).
- Q: How is the "no merge without tests" rule enforced? → A: Manual reviewer checklist only — the PR reviewer confirms test-file presence, 1:1 story-to-test mapping, and that tests passed against the feature-branch preview before approving. No automated CI gate is required by this policy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Each user story has a corresponding end-to-end test (Priority: P1)

When a developer authors a new feature spec, the associated implementation tasks MUST include a Playwright end-to-end test that directly exercises every user story defined in that spec. The test file establishes a one-to-one mapping between the stories listed in `spec.md` and the automated checks that verify them, so that "done" for a feature always means every story has a passing automated acceptance check.

**Why this priority**: Without a story-to-test mapping, features can ship with undocumented gaps in coverage. Tying tests directly to user stories is the core guarantee that delivers value on its own — even with nothing else in place, this MVP ensures every new feature has verifiable behavior end-to-end.

**Independent Test**: For any new feature, audit the feature directory and its test file: every user story in `spec.md` should have exactly one named test in the feature's test file, and running the test file should execute one test per story. Can be tested on a single feature without depending on any other mechanism.

**Acceptance Scenarios**:

1. **Given** a feature spec with three user stories, **When** the feature's test file is opened, **Then** it contains exactly three tests, each named to reference the user story it verifies.
2. **Given** a feature spec where a new user story is added after initial implementation, **When** the feature is considered ready for merge, **Then** the test file has been updated to include a test for the new story.
3. **Given** a feature is submitted for review without tests for every story, **When** the reviewer inspects coverage, **Then** the feature is flagged as incomplete until the missing tests are added.

---

### User Story 2 - Tests live in a predictable, per-feature location (Priority: P2)

All end-to-end tests for the project live under a single top-level `/tests` directory. Each feature contributes exactly one TypeScript test file to that directory, named after the feature, and that file contains all of the feature's story-level tests. Anyone looking for a feature's tests can find them in one location without hunting across directories.

**Why this priority**: A predictable layout is what makes the policy enforceable at review time. Without it, the rule in Story 1 is hard to verify; with it, the reviewer check becomes trivial ("does `/tests/<feature>.ts` exist and cover every story?").

**Independent Test**: Inspect any completed feature — its test file must exist under `/tests` at the project root, named after the feature, with a `.ts` extension, and no other test files for that feature elsewhere in the repo.

**Acceptance Scenarios**:

1. **Given** a feature named in its spec directory, **When** a contributor looks for its tests, **Then** they find a single `.ts` file under `/tests` whose name corresponds to the feature.
2. **Given** two features shipped in sequence, **When** the `/tests` directory is listed, **Then** each feature is represented by exactly one file and the files do not overlap in responsibility.
3. **Given** a contributor who has never seen this project, **When** they are told the feature name, **Then** they can locate the tests without reading documentation beyond the convention itself.

---

### User Story 3 - Tests target the EDS branch preview (pre-merge) and develop preview (post-merge) (Priority: P2)

Playwright tests exercise the feature as it appears on the AEM Edge Delivery Services preview at a URL under the `/blocks` path. The same test file serves two checkpoints:

- **Pre-merge acceptance gate**: tests run against the feature-branch preview (`https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>`) and MUST pass before the feature is merged to `develop`.
- **Post-merge regression gate**: after merge, the same tests are re-executed against the `develop` preview (`https://develop--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>`) to catch regressions.

Because AEM EDS publishes a preview per branch, the same test logic works against either host by varying only the `<branch>` segment of the base URL.

**Why this priority**: Testing against the real preview URL validates the feature in the exact form users will see it, rather than against a local build that may diverge from how AEM renders the page. Running the gate pre-merge prevents broken features from reaching `develop`; re-running post-merge catches regressions introduced by other merges. Pairing this with Story 1 and Story 2 gives the policy its full value.

**Independent Test**: Pick any feature's test file, confirm the same test file can be pointed at the feature-branch preview and at the `develop` preview by varying only the `<branch>` segment, and confirm the test file fails when pointed at a slug that does not exist on the target preview.

**Acceptance Scenarios**:

1. **Given** a feature branch with its preview published, **When** its test file is executed against the feature-branch preview URL, **Then** Playwright navigates to `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` and the tests must pass before merge is allowed.
2. **Given** a feature has been merged to `develop`, **When** its test file is re-executed against the `develop` preview, **Then** Playwright navigates to `https://develop--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` and any failure is treated as a regression against `develop`.
3. **Given** a feature with multiple stories, **When** the tests run against either preview, **Then** each story-level test navigates to the same preview page and verifies the behavior contributed by its story.

---

### Edge Cases

- A feature spec is authored with zero user stories: the policy cannot produce tests; the spec itself is incomplete and must be corrected before the test file can be written.
- A user story is reworded or renumbered after tests have been written: the corresponding test's name and reference must be updated so the one-to-one mapping is preserved.
- A user story is split into two stories during refinement: the test file must be updated to contain one test per resulting story.
- The feature produces content at a path other than `/blocks/<slug>` (for example, a site-wide change): the convention does not apply as-is; this is called out as out of scope in the Assumptions section.
- Two features are in flight simultaneously and both depend on shared behavior: each feature still has its own test file; shared assertions may be duplicated rather than extracted, since the policy is a 1:1 mapping, not a shared-library model.
- A feature is reverted from `develop`: its test file remains in the repository, but the tests will fail against the preview until the feature is re-merged or the tests are removed together with the revert.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every feature specification MUST be accompanied by exactly one Playwright test file dedicated to that feature.
- **FR-002**: The feature's test file MUST contain one named end-to-end test for every user story listed in that feature's `spec.md`, with a clear textual reference from the test's name to the story it verifies (e.g., by story title or story identifier). Each story-level test MUST verify every acceptance scenario listed under that story (comprehensive coverage); a test that covers only a subset of its story's acceptance scenarios does not satisfy the policy.
- **FR-003**: All feature test files MUST reside under a single top-level `/tests` directory at the project root.
- **FR-004**: Each feature's test file MUST use the `.ts` extension and MUST be named exactly after the feature's full spec directory name (numeric prefix + short-name). For example, the feature at `specs/002-playwright-story-tests/` MUST have its test file at `tests/002-playwright-story-tests.ts`. This mechanical mapping makes the feature↔test correspondence unambiguous and keeps `/tests` sortable in the same order as `/specs`.
- **FR-005**: Each test in a feature's test file MUST navigate to the feature's preview page at `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` before asserting story-specific behavior, where `<branch>` resolves to the feature branch when tests run pre-merge and to `develop` when tests run post-merge.
- **FR-006**: The feature-slug used in the test URL MUST correspond to the page published under `/blocks` on the target preview (typically the same short-name as the feature directory unless the page is authored under a different slug).
- **FR-007**: A feature MUST be considered incomplete for merge if any of its user stories lacks a corresponding test, if its test file is missing or located outside `/tests`, or if the tests do not pass against the feature-branch preview. Enforcement is via the PR reviewer: the reviewer MUST confirm all three conditions before approving the PR. This policy does not require an automated CI gate; it requires a documented reviewer responsibility.
- **FR-011**: The PR reviewer MUST, before approving a merge to `develop`, verify: (a) `tests/<full-spec-directory-name>.ts` exists, (b) it contains exactly one named test per user story in the paired `spec.md`, and (c) the author has demonstrated a passing run of those tests against the feature-branch preview URL (for example, by linking run output in the PR).
- **FR-008**: When user stories are added, removed, renamed, or renumbered during spec iteration, the feature's test file MUST be updated before the feature is considered ready for merge so the one-to-one mapping holds.
- **FR-009**: The feature's test file MUST be reviewable as a self-contained artifact — a reader of the file alone MUST be able to determine which user stories it covers.
- **FR-010**: After a feature is merged to `develop`, its test file MUST be re-executed against the `develop` preview (`https://develop--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>`) as a regression gate; a failure there is treated as a regression against `develop`, not as a new-feature incompleteness.

### Key Entities *(include if feature involves data)*

- **Feature Spec**: The `spec.md` under a feature directory; owns the authoritative list of user stories for that feature.
- **User Story**: A prioritized, independently testable scenario inside a feature spec; each one is the unit a Playwright test is written against.
- **Feature Test File**: A TypeScript file at `tests/<full-spec-directory-name>.ts` (preserving the numeric prefix of the spec directory); contains one test per user story in the feature spec, with each test covering all acceptance scenarios of its story.
- **Feature Preview Page**: The page published under `/blocks/<feature-slug>` on an AEM EDS preview host. Two preview hosts are in scope for this policy: the feature-branch preview (`<branch>--facilita-eds-ue--vilt-r-d.aem.page`) as the pre-merge acceptance target, and the `develop` preview (`develop--facilita-eds-ue--vilt-r-d.aem.page`) as the post-merge regression target.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of feature specs created under this policy have a corresponding test file under `/tests` at the time the feature is merged to `develop`.
- **SC-002**: For any given feature merged under this policy, the number of tests in its test file equals the number of user stories in its spec (1:1 mapping), and each test asserts all acceptance scenarios listed under its story.
- **SC-003**: A reviewer can determine whether a feature satisfies the testing policy in under one minute, using only the feature's spec, its test file, and the author-provided passing-run evidence in the PR (no additional documentation required).
- **SC-004**: For features merged under this policy, no user story reaches `develop` without an executable acceptance test covering it.
- **SC-005**: 100% of test files reference the deployed preview URL pattern `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` and can be pointed at either the feature-branch preview (pre-merge gate) or the `develop` preview (post-merge regression gate) without changing test logic.
- **SC-006**: 0% of features reach `develop` with tests that were never observed passing against their feature-branch preview.

## Assumptions

- The `/tests` directory lives at the project root (`./tests`) — not inside each feature's spec directory — because a single top-level test tree is easier to locate, automate, and aggregate in CI than per-feature test folders scattered under `specs/`.
- Test files are authored in TypeScript, consistent with the `.ts` requirement in the user's description; the project will add whatever tooling is required to run TypeScript-based Playwright tests without mandating implementation details in this spec.
- The feature-slug in the preview URL matches the feature's spec short-name (e.g., the part of the spec directory name after the numeric prefix) unless the feature's content is explicitly authored at a different path in AEM.
- Tests run against two canonical preview hosts: the feature-branch preview (`https://<branch>--facilita-eds-ue--vilt-r-d.aem.page`) pre-merge as the acceptance gate, and the `develop` preview (`https://develop--facilita-eds-ue--vilt-r-d.aem.page`) post-merge as the regression gate. Running against `main` preview/live, local `aem up`, or other environments is out of scope for this policy (individual tests may opt to support it, but the policy does not require it).
- The policy applies to new features created after it is adopted. Retrofitting tests onto pre-existing features is out of scope for this spec.
- Features whose output is not a `/blocks/<slug>` page (e.g., site-wide infrastructure, build tooling, or shared scripts) are out of scope for the URL convention portion of this policy; such features may require a different testing approach, which is out of scope here.
- The Playwright framework itself, its configuration, and any CI integration that chooses to run the tests are implementation concerns handled in the planning phase; this spec fixes the policy (one test per story, one file per feature under `/tests`, targeting the branch-preview `/blocks/<slug>` URL pre-merge and the `develop`-preview URL post-merge) and delegates enforcement to the PR reviewer (no automated gate is required).
