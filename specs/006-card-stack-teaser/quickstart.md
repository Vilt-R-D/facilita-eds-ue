# Quickstart — Card Stack Teaser (TDD-Local Loop)

This is the runbook the implementing model follows during `/speckit-implement`. It mirrors Constitution Principle VI (TDD-Local Loop) and Principle VII (Attachment Pre-Analysis).

## Prerequisites

- Working tree on branch `006-card-stack-teaser`.
- `aem` CLI installed globally: `npm i -g @adobe/aem-cli`.
- `npx playwright install chromium` ran at least once on this machine (the spec uses `page` fixtures).
- Cacophony middleware reachable on `localhost:8080` (only required when `/speckit-implement` runs the Principle VII fetch gate).

## Phase R — Red (write the test first)

1. Author `tests/006-card-stack-teaser.ts` with one `test(...)` per user story in `spec.md`:
   - US1 — desktop layout with title/text/CTA + card stack visible.
   - US2 — click-to-advance + dot-to-advance both move forward by one; cycle on last; only-one-card disables animation.
   - US3 — mobile vertical sequence; no dots.
   - US4 — per-card themes render correctly (black / dark-green / light-green / white default).
   - US5 — CTA hover/focus visual change.
2. Tests target `${process.env.BASE_URL}/blocks/card-stack-teaser`.

## Phase F — Schema push gate (Principle VI Phase F)

The block adds new `_<name>.json`, so this phase is mandatory.

```powershell
# 1. Author blocks/card-stack-teaser/_card-stack-teaser.json (see contracts/block-contract.md §1).
# 2. Merge JSON partials (also runs on pre-commit via Husky).
npm run build:json
# 3. Stage the partial + the three regenerated root files.
git add blocks/card-stack-teaser/_card-stack-teaser.json component-definition.json component-models.json component-filters.json
# 4. Commit and push BEFORE any MCP authoring step.
git commit -m "feat(card-stack-teaser): register block schema"
git push -u origin 006-card-stack-teaser
```

Memory: `feedback_aem_schema_push_before_authoring.md` records why this push must happen before MCP create/patch.

## Phase G — AEM author setup (MCP-driven)

After the push, author the target page:

1. `mcp__aem-content__create-aem-page` at path `/blocks/card-stack-teaser`.
2. `mcp__aem-content__patch-aem-page-content` to populate the block fields with values that match the test expectations:
   - `title` (richtext), `text` (richtext), `cta` (link), `ctaText` (text).
   - 3+ card items with distinct `cardTheme` values to exercise US4.
3. `mcp__aem-content__publish-aem-content` to promote the page.

If MCP credentials are not available, fall back to manual authoring in Universal Editor at the same path and publish manually.

## Phase A — Attachment fetch gate (Principle VII)

Before editing `card-stack-teaser.js` / `card-stack-teaser.css`:

```text
cacophony-fetch-attachment css-desktop.txt
cacophony-fetch-attachment css-mobile.txt
```

Then `Read` each file once, whole-file, no `offset` / `limit`. If either fetch fails, STOP and report the attachment names verbatim — do not edit JS/CSS.

## Phase V — Local TDD loop

```powershell
# Start the proxy (background; one-shot per session).
aem up

# Iterate.
npm run test:local -- tests/006-card-stack-teaser.ts
# Edit blocks/card-stack-teaser/card-stack-teaser.js and card-stack-teaser.css until green.
```

When the spec is green locally, run the **Principle VII parity check**:

1. `mcp__aem-content__get-aem-page-content` at `/blocks/card-stack-teaser`.
2. Compare every textual / link / path token in the attachment against the authored value (byte-for-byte unless the attachment notes otherwise).
3. On mismatch, prefer fixing the authored side via `mcp__aem-content__patch-aem-page-content` + `publish-aem-content`, then re-run `npm run test:local`.
4. Mismatches that reveal a bug in the block JS/CSS (e.g., the block rewrites a value the author set correctly) MUST be fixed in code, not by mutating the authored value.

## Phase G2 — Acceptance (pre-merge)

Run the spec against the feature-branch preview before opening the PR:

```powershell
$env:BASE_URL = "https://006-card-stack-teaser--facilita-eds-ue--vilt-r-d.aem.page"
npm test -- tests/006-card-stack-teaser.ts
```

Then open the PR into `main` per the project's branching convention.

## Definition of Done

- `tests/006-card-stack-teaser.ts` green against `localhost:3000` AND against the feature-branch preview.
- All five user stories exercised.
- Principle VII parity check passes (authored content matches attachments).
- `_card-stack-teaser.json` partial committed; merged `component-*.json` files committed and pushed.
- No new npm dependency; no new CSS variable in `styles/styles.css`; no edits to root JSON files by hand.
- ESLint / Stylelint clean: `npm run lint`.
