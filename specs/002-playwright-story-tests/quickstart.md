# Quickstart — Playwright Tests Per User Story

How to use the testing convention introduced by this feature. Intended audience: developers creating a new feature, reviewers approving a PR, and anyone manually re-running tests.

## One-time setup (done by this feature, not repeated per feature)

After this feature merges:

1. `@playwright/test` is installed in `devDependencies`.
2. `playwright.config.ts` exists at the project root.
3. `tests/` exists at the project root.
4. `package.json` has `"test": "playwright test"` and `"test:develop": "BASE_URL=https://develop--facilita-eds-ue--vilt-r-d.aem.page playwright test"`.
5. `CLAUDE.md` documents the convention for future agent sessions.
6. `.docs/Pacotes Nodes.md` justifies the `@playwright/test` dependency.
7. Playwright browsers are installed locally via `npx playwright install chromium` (run once per machine).

## Authoring tests for a new feature

When you run `/speckit.specify` to create a new feature, the resulting directory is `specs/<NNN-short-name>/`. For every User Story the spec declares, add one test.

1. Identify the feature's spec directory name (e.g., `003-mega-menu`).
2. Create `tests/003-mega-menu.ts`.
3. Import Playwright's test runner:

   ```ts
   import { test, expect } from '@playwright/test';
   ```

4. For each User Story in the paired `spec.md`, add one test whose name references the story:

   ```ts
   test('US1: opens the menu on hover', async ({ page }) => {
     await page.goto('/blocks/mega-menu');
     // assert every Acceptance Scenario of User Story 1
   });

   test('US2: closes the menu on outside click', async ({ page }) => {
     await page.goto('/blocks/mega-menu');
     // assert every Acceptance Scenario of User Story 2
   });
   ```

5. Each test MUST assert every Acceptance Scenario listed under its story (per the clarified policy — comprehensive coverage, not a representative check).

## Running tests locally

**Against the `develop` preview (default)**:

```bash
npm test
```

**Against a feature-branch preview (pre-merge acceptance gate)**:

```bash
BASE_URL=https://<your-branch>--facilita-eds-ue--vilt-r-d.aem.page npm test
```

**Running only one feature's tests**:

```bash
npm test -- tests/003-mega-menu.ts
```

**Explicit develop regression gate (named script)**:

```bash
npm run test:develop
```

**First-time browser install** (once per machine):

```bash
npx playwright install chromium
```

## Pre-merge workflow

1. Push the feature branch. Wait for AEM EDS to publish the branch preview at `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page`.
2. Run `BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page npm test -- tests/<NNN-short-name>.ts` and confirm all story tests pass.
3. Include the passing-run evidence in the PR (reporter output path, screenshot of the HTML report, or paste of the `list` reporter lines).
4. Open the PR against `develop`. The reviewer will run through the Reviewer Checklist (see `contracts/reviewer-checklist.md`).

## Post-merge workflow

After merge to `develop`:

1. Re-run `npm run test:develop` (or `npm test` — same default) against the `develop` preview.
2. A failure is a regression, not a new-feature defect. File a regression issue referencing the merged PR and either fix forward or revert.

## Adding or renaming a user story

If a story is added, removed, renamed, or split AFTER tests have been written:

1. Update `tests/<NNN-short-name>.ts` to keep exactly one test per story.
2. Re-run the branch-preview gate.
3. Do NOT merge until the 1:1 mapping holds again.

## Reviewer checklist (short form)

Before approving a PR on `develop`, confirm:

- `tests/<full-spec-directory-name>.ts` exists.
- Test count equals User Story count in the paired `spec.md`.
- Each test's name clearly references its User Story.
- The PR author has demonstrated a passing run against the feature-branch preview.

Full form: `specs/002-playwright-story-tests/contracts/reviewer-checklist.md`.

## Troubleshooting

- **`net::ERR_NAME_NOT_RESOLVED` or 404 on the branch preview**: AEM EDS hasn't published the preview yet. Wait 30–60s after push and retry. Verify `<branch>` matches the live git branch name exactly (case-sensitive).
- **All tests time out**: `BASE_URL` may point at the wrong host. Confirm the env var; default is the `develop` preview.
- **TypeScript errors before Playwright runs**: Playwright's bundled compiler is used by default. If a project-specific `tsconfig.json` is needed later, scope it to `tests/` only — do not add a root tsconfig (the app is vanilla JS).
- **Rate-limit or flaky preview**: test runs use `workers: 1` against live previews by default. If you see contention, confirm no concurrent run is hitting the same host.
