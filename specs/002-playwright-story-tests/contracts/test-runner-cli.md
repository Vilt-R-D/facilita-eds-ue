# Contract: Test Runner CLI

Defines the command-line surface developers, reviewers, and CI use to invoke the test suite. This is the public "API" of the testing policy.

## `package.json` scripts

The `scripts` object in `package.json` MUST include:

- `"test": "playwright test"` — runs the full suite against whatever `BASE_URL` resolves to (default: `develop` preview).
- `"test:develop": "BASE_URL=https://develop--facilita-eds-ue--vilt-r-d.aem.page playwright test"` — explicit post-merge regression gate.

MAY include (optional):

- `"test:install": "playwright install chromium"` — one-shot browser install for new contributors.
- `"test:debug": "playwright test --debug"` — developer convenience.

MUST NOT redefine `"test"` to anything other than Playwright invocation without updating this contract.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BASE_URL` | No | `https://develop--facilita-eds-ue--vilt-r-d.aem.page` | Target preview host. Developers set this to their feature-branch preview for the pre-merge gate. |
| `CI` | No | unset | When truthy, Playwright switches to `github` reporter and applies 2 retries. Set automatically by most CI systems. |
| `BASE_AUTH_TOKEN` | No | unset | Reserved for future authenticated previews (see research §5). Currently unused. |

Additional Playwright-native environment variables (`DEBUG`, `PWTEST_*`, etc.) are supported per the library's documentation.

## Invocation patterns (canonical)

### Run full suite against default host

```bash
npm test
```

### Run full suite against a feature-branch preview (pre-merge gate)

```bash
BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page npm test
```

### Run one feature's tests

```bash
npm test -- tests/<NNN-short-name>.ts
```

### Run one specific test within a file

```bash
npm test -- tests/<NNN-short-name>.ts -g "<test name or fragment>"
```

### Explicit develop regression gate

```bash
npm run test:develop
```

### Debug a single test interactively

```bash
npm test -- tests/<NNN-short-name>.ts --debug
```

## Exit codes

- `0` — all tests passed.
- `1` — at least one test failed (reviewer/CI MUST treat as blocking for the pre-merge gate).

## Artifacts

On test run completion Playwright writes under the project root:

- `test-results/` — per-test artifacts (traces, screenshots, videos on failure).
- `playwright-report/` — HTML reporter output (when the HTML reporter is active).

Both directories MUST be listed in `.gitignore` (added by this feature).

## Stability guarantees

- `npm test` remains a valid entry point for the full suite across all future spec iterations.
- `BASE_URL` remains the name of the base-URL override environment variable.
- The `tests/<NNN-short-name>.ts` argument form for running a single feature's tests is stable.

Any change to the above names is a breaking change to this contract and requires a spec update.
