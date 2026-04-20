# Research — Playwright Tests Per User Story

Resolves every unknown raised in `plan.md` Technical Context. Each item records: Decision, Rationale, Alternatives considered.

## 1. Playwright version & package

**Decision**: Install `@playwright/test` at the latest stable major (1.x) as a devDependency. Pin the exact minor range via `^1.x.y` in `package.json`.

**Rationale**: `@playwright/test` bundles the runner, assertion library, fixtures, and TypeScript support — one dependency covers everything the spec needs. Latest stable gets browser engine updates for free. Pinning to a caret range on the current minor allows non-breaking browser/runner updates without surprise majors.

**Alternatives considered**:
- `playwright` (raw SDK): would require a separate test runner. Extra complexity for no gain — the spec is exactly what `@playwright/test` is built for.
- Puppeteer + a runner (Jest/Mocha): multi-package install, weaker TypeScript ergonomics, less aligned with modern E2E practice. Puppeteer is lighter but costs us fixtures and parallel-project support.
- Cypress: pays for a test UI the policy does not require; historically awkward with authentication; heavier install.

## 2. TypeScript configuration

**Decision**: Use Playwright's built-in TypeScript support. Do NOT add a separate `tsconfig.json` unless a subsequent feature needs one. If one becomes necessary, create `tests/tsconfig.json` targeting `ES2022`, `module: "commonjs"`, `strict: true`, `esModuleInterop: true`, `types: ["node"]`.

**Rationale**: Playwright compiles `.ts` files on the fly; the default settings match what the spec requires. Adding a tsconfig now is YAGNI and would mean another file to maintain. When a test eventually needs non-default strictness or custom paths, a scoped `tests/tsconfig.json` is the minimum surface that keeps TypeScript out of the app's JS tree.

**Alternatives considered**:
- Root-level `tsconfig.json`: would imply the whole project is TypeScript. It isn't — application code is vanilla JS. Keeping tsconfig (when needed) under `tests/` preserves that boundary.
- `ts-node` + explicit compile step: superseded by Playwright's own compiler.

## 3. Base URL parametrization (branch preview vs develop preview)

**Decision**: `playwright.config.ts` reads `process.env.BASE_URL` and falls back to `https://develop--facilita-eds-ue--vilt-r-d.aem.page` if unset. Tests use relative paths via `page.goto('/blocks/<feature-slug>')` so switching previews requires only a different `BASE_URL` env var.

**Rationale**: The same test suite must target two hosts (pre-merge feature-branch preview and post-merge `develop` preview) per FR-005 and SC-005. Env-driven `baseURL` is the idiomatic Playwright pattern and keeps zero hardcoded hosts inside individual tests. Defaulting to `develop` matches the post-merge regression gate — the more common manual-run case.

**Alternatives considered**:
- Multiple `projects` in Playwright config (one per host): the spec says "the same test file" serves both gates; two projects would duplicate configuration and risk drift. Tests would also need to be told which project they're running in — extra conditionals without payoff.
- Hardcoded URL in each test: contradicts SC-005 ("without changing test logic"). Rejected.
- Read branch from `git rev-parse --abbrev-ref HEAD`: couples tests to git state. Brittle in detached-HEAD CI contexts and harder to override for ad-hoc runs. Env var is explicit and testable.

## 4. Feature-slug resolution

**Decision**: The feature-slug in the URL defaults to the spec directory's short-name portion (the part after the `NNN-` prefix). Per-feature tests MAY override by constructing the slug explicitly in the test code if their page is authored under a different AEM path.

**Rationale**: The spec's Assumptions already state this default (slug = spec short-name) and its Edge Cases acknowledge features may choose otherwise. Making this a test-level responsibility keeps config simple: `playwright.config.ts` doesn't need to know anything about feature slugs.

**Alternatives considered**:
- Config-level slug registry: centralises knowledge but forces an edit to shared config for every new feature — violates the "each feature is self-contained" reviewer check (FR-009).
- Convention-enforced at runtime by parsing `specs/*/spec.md`: over-engineering. Test file is canonical.

## 5. Preview host authentication

**Decision**: Assume `*.aem.page` previews are publicly reachable without authentication. If a future environment change requires auth, extend `playwright.config.ts` via `use.extraHTTPHeaders` sourced from `BASE_AUTH_TOKEN` env var. Do not build this in now.

**Rationale**: AEM EDS `.aem.page` hosts are the standard public preview target and are expected to be reachable from CI and developer machines. No evidence in the project suggests otherwise. Building auth now would mean solving a problem that may never exist; wiring it in later is a one-config-line change.

**Alternatives considered**:
- Pre-emptively add Basic-auth or token support: YAGNI; adds secret-management burden (CI env, local .env files) that no requirement calls for.
- Require a proxy: N/A — no indication the preview is behind one.

## 6. Reporter configuration

**Decision**: `playwright.config.ts` uses `reporter: process.env.CI ? 'github' : 'html'`. `html` gives rich local output with screenshots/traces; `github` produces CI-friendly annotations without changing anything else.

**Rationale**: Aligns with Playwright's standard pattern and gives reviewers (per FR-011) and developers (per US1/US2) clear local output without extra configuration. The policy does not require a specific reporter, so the most ergonomic pair of defaults is chosen.

**Alternatives considered**:
- `list` only: loses screenshots and traces, hurting post-failure diagnosis.
- `junit`: useful if an external CI aggregator needs XML; no such requirement exists yet.

## 7. Browser coverage

**Decision**: Chromium only, for now. Single project in `playwright.config.ts` using `devices['Desktop Chrome']`.

**Rationale**: AEM EDS serves standard HTML/CSS/JS. The spec's acceptance scenarios do not mention cross-browser verification. Adding Firefox/WebKit triples test time with no policy benefit. Expanding browser coverage is a later, per-feature decision.

**Alternatives considered**:
- Chromium + Firefox + WebKit: 3x test duration for coverage the spec does not ask for.
- Mobile emulation: relevant only once a feature explicitly tests mobile rendering; not the policy's job to mandate.

## 8. Retry & flakiness policy

**Decision**: Retries = 2 on CI (`process.env.CI ? 2 : 0`). No retries locally. `workers: 1` for runs targeting a live preview (to avoid hammering the AEM host) but allow override via `--workers=N` on the command line.

**Rationale**: The policy's test target is a live HTTP service — transient network hiccups are expected. Two CI retries is the Playwright documented default for reducing false failures. Running single-worker against a shared preview reduces contention and is easy to relax if tests are proven independent.

**Alternatives considered**:
- No retries: every flake blocks merge manually. Costly reviewer time.
- Unlimited workers: could trigger AEM rate limiting or hide race conditions between tests.

## 9. How this feature itself is tested (self-exception)

**Decision**: This feature has no `/blocks/<slug>` page, so per its own Assumptions it is exempt from the URL-convention portion of the policy. Its "test" file (`tests/002-playwright-story-tests.ts`) contains meta-assertions executed by Playwright's test runner that verify the scaffolding is in place:
- US1: a canary check that `specs/002-playwright-story-tests/spec.md` exists and its User Story count matches the test count in `tests/002-playwright-story-tests.ts`.
- US2: a filesystem assertion that `tests/` exists at the project root and this file is inside it.
- US3: a config assertion that the `playwright.config.ts` resolves `baseURL` from `BASE_URL` and its default matches the `develop` preview host pattern.

**Rationale**: The feature delivers a policy, not a page; forcing a browser E2E here would require inventing a fake `/blocks/playwright-story-tests` page solely to give the test something to navigate to. The self-exception is the honest framing and keeps the reference file short and useful as a template.

**Alternatives considered**:
- Skip the test file entirely for this feature: violates FR-001 (every feature MUST have a test file). Meta-tests satisfy FR-001 while staying within the Assumptions' self-exception for the URL convention.
- Create a placeholder `/blocks/playwright-story-tests` page for symmetry: wasted effort; the page would have no content to test.

## 10. npm scripts and developer ergonomics

**Decision**: Add two scripts to `package.json`:
- `"test": "playwright test"`
- `"test:develop": "BASE_URL=https://develop--facilita-eds-ue--vilt-r-d.aem.page playwright test"` (explicit post-merge regression gate run)

Developers targeting a feature branch pre-merge run `BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page npm test`.

**Rationale**: `npm test` is the least-surprising default and falls back to the develop preview (matching `BASE_URL`'s default in config) for quick sanity checks. A named script for the develop regression gate documents the intent in one place.

**Alternatives considered**:
- `npm run e2e` vs `npm test`: the project currently has no `test` script at all (per constitution "No test suite"), so `test` is the most discoverable name and matches common Node conventions.
- One script per branch: combinatorial; branch is inherently runtime, not config.
