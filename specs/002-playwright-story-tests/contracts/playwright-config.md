# Contract: `playwright.config.ts`

Defines the stable shape of the shared Playwright configuration introduced by this feature. Any change to the fields below is a spec-level change (it affects every feature's tests) and MUST go through a spec update.

## Location

`/playwright.config.ts` at the repository root.

## Required configuration

The config file MUST export (default export) a call to `defineConfig({ ... })` from `@playwright/test` with at minimum these fields:

### `testDir`

- **Value**: `'tests'`
- **Rationale**: Binds the runner to the top-level `/tests` directory mandated by FR-003.

### `testMatch`

- **Value**: `'*.ts'` (or the `['*.ts']` array form).
- **Rationale**: Every `.ts` file at `tests/*.ts` is a feature test file. Zero configuration per new feature (supports US2).

### `use.baseURL`

- **Value**: `process.env.BASE_URL ?? 'https://develop--facilita-eds-ue--vilt-r-d.aem.page'`
- **Rationale**: FR-005 and SC-005 require the same suite to run against feature-branch and `develop` previews by varying only the `<branch>` segment. Env-driven base URL is the mechanism; defaulting to develop matches the most common manual-run case. The same env-driven baseURL also enables Constitution Principle VI's local TDD loop via `BASE_URL=http://localhost:3000` (`npm run test:local`); see "Permitted" below.

### `projects`

- **Value**: exactly one project using `{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }`.
- **Rationale**: Research §7. Single-browser coverage is sufficient for the policy; additional browsers are per-feature opt-in, not a policy default.

### `retries`

- **Value**: `process.env.CI ? 2 : 0`
- **Rationale**: Research §8. Reduces noise from transient AEM preview hiccups under CI without masking real failures during local development.

### `workers`

- **Value**: `1` (can be overridden on the command line with `--workers=N`).
- **Rationale**: Tests target a shared live preview; concurrent workers risk rate limiting and race conditions between tests that mutate the same page. Override is available when tests are proven independent.

### `reporter`

- **Value**: `process.env.CI ? 'github' : 'html'`
- **Rationale**: `github` produces inline CI annotations; `html` gives local developers screenshots and traces. Matches Playwright's documented pair of defaults.

## Optional configuration (permitted, not required)

- `timeout` per test, `expect.timeout`: tune globally as the suite grows. Initial value = Playwright defaults.
- `use.trace: 'retain-on-failure'`: recommended for CI diagnosis but not mandatory.
- `use.video: 'retain-on-failure'`: recommended for UI-heavy features.
- `use.extraHTTPHeaders`: ONLY if preview auth becomes required (see research §5). Source from an env var such as `BASE_AUTH_TOKEN`; never hardcode secrets.

## Forbidden

- Hardcoding `baseURL` to a specific branch (violates SC-005).
- Per-feature subdirectories under `tests/` (violates FR-003 and the flat-layout structure decision).
- A `webServer` block that spins up a local dev server from inside `playwright.config.ts` (the runner MUST NOT manage `aem up` itself; running `aem up` in CI is out of scope for this policy).
- Secrets committed to the file.

## Permitted: local TDD loop via `BASE_URL`

Pointing the same suite at `http://localhost:3000` by exporting `BASE_URL=http://localhost:3000` (e.g. `npm run test:local`) is **explicitly allowed** for the inner red→green TDD loop defined by Constitution Principle VI. This is a runtime env override — it does NOT add a `webServer` block and does NOT change the config file. Contributors are responsible for starting `aem up` and authoring/publishing the target page (typically via the `aem-content` MCP) before running the local suite.

## Change process

Any change to the fields in "Required configuration" is a policy change. It MUST:

1. Update this contract file.
2. Run through `/speckit.clarify` if the change introduces ambiguity for existing features.
3. Include a migration note in `CLAUDE.md` if the change affects how developers run tests.
