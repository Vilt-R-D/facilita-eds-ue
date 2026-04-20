# Contract: Reviewer Checklist

This policy is enforced manually (per Clarification Q4: "Manual reviewer checklist only — no automated CI gate is required"). This file is the authoritative contract for what a PR reviewer must confirm before approving a merge to `develop`.

## When this contract applies

Any PR whose target branch is `develop` AND that adds or modifies a feature under `specs/`. Pre-existing features (created before this policy was adopted) are out of scope per the spec's Assumptions.

## The checklist

The reviewer MUST confirm all of the following. Any unchecked item blocks approval.

### Structural checks (mechanical — can be done by inspection)

- [ ] **File exists**: The PR contains a file at `tests/<full-spec-directory-name>.ts`, where `<full-spec-directory-name>` is the exact name of the paired directory under `specs/` (numeric prefix preserved). Example: `specs/003-mega-menu/` pairs with `tests/003-mega-menu.ts`.
- [ ] **Location**: The test file is directly inside `tests/` at the project root — not nested under a subdirectory, not inside `specs/`, not elsewhere in the repo.
- [ ] **Extension**: The file uses `.ts` (not `.js`, not `.spec.ts`, not `.test.ts`).
- [ ] **Test count equals story count**: The number of `test(...)` invocations in the file equals the number of `### User Story N - ...` headings in the paired `spec.md`.
- [ ] **Story references in test names**: Each `test('<name>', ...)` call's `<name>` textually references the User Story it verifies (e.g., includes "US1", the story title, or story number in a recognisable form).

### Behavioural checks (judgment — reviewer reads the test)

- [ ] **Comprehensive coverage per story**: Each test's assertions cover every Acceptance Scenario listed under its story in `spec.md`. A test that exercises only one of multiple Acceptance Scenarios does NOT satisfy the policy.
- [ ] **Relative navigation**: Tests navigate via relative paths (e.g., `page.goto('/blocks/<slug>')`), not hardcoded absolute URLs. This is what lets the same suite run against either preview host by varying `BASE_URL`.

### Evidence checks (reviewer reads the PR)

- [ ] **Passing-run evidence**: The PR author has demonstrated these tests passing against the feature-branch preview URL. Acceptable forms:
  - Paste of Playwright's `list` reporter output showing all tests green.
  - Screenshot of the HTML reporter summary page.
  - Link to a CI run (if the author's CI is configured to execute the suite) targeting `BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page`.

### Spec mutation consistency (if applicable)

- [ ] **User Story changes reflected**: If this PR adds, removes, renames, renumbers, or splits any User Story in the paired spec, the test file has been updated to preserve the 1:1 mapping.

## What the reviewer does NOT need to check

- That tests run on every commit (no CI gate is required by this policy).
- That post-merge `develop` regression runs have executed (that's a post-merge concern covered by FR-010, not part of the approval gate).
- Browser-matrix coverage (the policy mandates only that Chromium via Playwright's default is used; additional browsers are a per-feature author decision).
- Test performance (no SLA is imposed).

## Approval outcome

- All structural and behavioural checks green + evidence present → **Approve**.
- Any check red → **Request Changes** with a comment pointing to the specific item that failed.
- If the PR explicitly opts out (e.g., the feature doesn't publish a `/blocks/<slug>` page and invokes the spec's self-exception, as this very feature does) → the author MUST call this out in the PR description and provide alternate meta-tests or justify their absence. The reviewer judges the alternate evidence.

## Escalation

If a reviewer is uncertain whether a particular test genuinely exercises its story (e.g., an assertion looks weak), they should request a peer opinion rather than block on style. The policy exists to guarantee coverage, not to impose stylistic uniformity.
