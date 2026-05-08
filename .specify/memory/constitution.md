<!-- Sync Impact Report
Version change: 1.3.0 → 1.4.0
Modified principles: Principle VII (Attachment Full-Context Pre-Analysis)
  — added. Replaces the deleted `visual-refs` after_tasks hook and
  `speckit-visual-prepend-task` skill. Source of truth for attachment
  refs shifts from the `**Input**` line regex to the
  `<!-- cacophony:meta ... -->` JSON block in spec.md. Scope expands
  beyond PNG/SVG to all non-image attachments (TXT/CSS/HTML/JSON/MD).
  Enforcement model shifts from synthetic Phase 0 task injection to
  a NON-NEGOTIABLE pre-implementation gate honored by /speckit-implement.
  Adds a post-implementation parity check: authored content at
  `/blocks/<feature-slug>` is verified against attachment text/links/paths
  via `aem-content` MCP (`get-aem-page-content`,
  `get-aem-page-content-definition`, `get-aem-page-metadata`), with
  mismatches patched via `patch-aem-page-content` + re-publish. The
  check is the final step of Principle VI Phase V.
Added sections: Principle VII.
Removed sections: N/A (legacy artifacts deleted outside the constitution).
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible
  - .specify/templates/spec-template.md — ✅ compatible
  - .specify/templates/tasks-template.md — ✅ compatible (no Phase 0
    scaffolding to remove — Phase 0 was hook-injected)
  - .specify/templates/checklist-template.md — ✅ compatible
  - .specify/templates/agent-file-template.md — ✅ compatible
Follow-up TODOs: none

Prior history:
  0.0.0 → 1.0.0 (2026-04-13): Initial ratification.
  1.0.0 → 1.1.0 (2026-04-20): Replaced "No test suite" with the
    Playwright E2E policy from feature 002-playwright-story-tests.
  1.1.0 → 1.2.0 (2026-05-07): Added Principle VI (TDD-Local Loop for
    Blocks) and `npm run test:local` workflow.
  1.2.0 → 1.3.0 (2026-05-08): Added schema push gate to Principle VI.
-->

# Facilita EDS Constitution

## Core Principles

### I. Block Self-Containment (NON-NEGOTIABLE)

Every block MUST be self-contained within its `blocks/{name}/` directory.
Blocks MUST NOT nest other blocks inside them. When repeatable or
grouped content is needed, use **items** via field-name prefixing in the
block model (e.g., `item1_title`, `item1_image`, `item2_title`,
`item2_image`). This follows AEM EDS conventions where shared prefixes
group fields into a single `<div>` in the rendered HTML.

- A block consists of up to three files: `{name}.js`, `{name}.css`,
  `_{name}.json`.
- The `decorate(block)` function receives only its own DOM element and
  MUST NOT query or mutate elements outside its boundary.
- Block definitions, models, and filters live in `_{name}.json` partials
  and are merged by the pre-commit hook into root-level JSON files.

### II. Zero Dependencies

No new npm packages MUST be added unless absolutely necessary. If a
dependency is required, its justification MUST be documented in
`.docs/Pacotes Nodes.md` before merging. Prefer vanilla JS solutions and
the utilities already provided by `scripts/aem.js`.

- The project relies on `@adobe/aem-cli` for local development and
  standard Adobe EDS framework utilities — nothing more.
- Third-party libraries (Swiper, etc.) already present in `scripts/main.js`
  are legacy; new features MUST NOT introduce additional ones.

### III. Performance-First Loading (E-L-D)

All code MUST respect the three-phase loading lifecycle orchestrated by
`scripts/scripts.js`:

1. **Eager**: First section + critical CSS only. Optimized for LCP.
   No heavy JS or network calls in this phase.
2. **Lazy**: Remaining sections and `lazy-styles.css`. Non-critical
   block decoration happens here.
3. **Delayed** (3s): Analytics (GTM), icon sprites, and other
   non-UX-impacting code. Loaded via `scripts/delayed.js`.

New blocks MUST NOT load resources in a phase earlier than necessary.
If a block is below the fold, its assets belong in the Lazy or Delayed
phase.

### IV. CSS Scoping

Block styles MUST be scoped exclusively to the block's own DOM. Blocks
MUST NOT define styles that reach outside their boundary or override
global layout. Before defining new CSS custom properties, check
`styles/styles.css` for existing variables and reuse them.

- Indentation: 4 spaces for CSS.
- No `!important` unless overriding third-party styles with no
  alternative.
- Media queries SHOULD live inside the block's own `.css` file.

### V. Universal Editor Compliance

All blocks MUST provide a valid `_{name}.json` partial containing
`definitions`, `models`, and `filters` arrays. The root-level
`component-definition.json`, `component-models.json`, and
`component-filters.json` are auto-generated — they MUST NOT be edited
manually.

- Field naming conventions MUST follow AEM EDS patterns:
  `image` + `imageAlt` for pictures, `cta` + `ctaText` for links,
  shared prefixes for grouping.
- Block definitions MUST set `plugins.xwalk.page.resourceType` to
  `core/franklin/components/block/v1/block`.
- Filters MUST be updated to register new blocks in the appropriate
  containers (typically in `/models/_section.json`).

### VI. TDD-Local Loop for Blocks

Every feature that adds or modifies a block under `blocks/` MUST be
developed against a real authored AEM page using the local `aem up`
proxy. The Playwright spec is written FIRST (red), the target page is
authored programmatically via the `aem-content` MCP server, and the
loop iterates locally at `http://localhost:3000`.

**Required loop**:

1. **Red**: Write the Playwright spec at
   `tests/<full-spec-dir-name>.ts` covering one user story. Tests
   navigate to `/blocks/<feature-slug>`.
2. **Push schema**: If the feature adds or modifies a block's
   `_<name>.json` partial, run `npm run build:json`, then **commit and
   push** the partial alongside the merged root files
   (`component-definition.json`, `component-models.json`,
   `component-filters.json`) to the feature branch BEFORE any MCP
   authoring step. EDS preview and Universal Editor resolve block
   identity from the pushed branch HEAD; without the push, the block
   is unknown and MCP authoring cannot reference it.
3. **Author**: Create the target page via
   `mcp__aem-content__create-aem-page` at `/blocks/<feature-slug>`.
   Populate the block's component fields with the values the test
   expects via `mcp__aem-content__patch-aem-page-content`.
4. **Publish**: Promote the page with
   `mcp__aem-content__publish-aem-content` so the preview tier serves
   it.
5. **Serve**: Run `aem up` (background) so `localhost:3000` proxies
   the published content while serving the **local** block JS/CSS
   under iteration.
6. **Iterate**: Run `npm run test:local` (= `BASE_URL=http://localhost:3000 playwright test`).
   Edit `blocks/<feature-slug>/<feature-slug>.{js,css}` until the
   spec is green.

**Worked example** — task shape that `/speckit-tasks` MUST emit for
any feature that adds or modifies a block. Two phases sit between the
test-authoring tasks and the block-implementation tasks:

```markdown
## Phase F: Schema Registration (push gate)

**Purpose**: Make EDS aware of the block before any MCP authoring
runs. REQUIRED whenever the feature adds or modifies
`_<name>.json`. SKIP only if the feature touches no block schema.

- [ ] TF01 Author/update `blocks/<feature-slug>/_<feature-slug>.json`
- [ ] TF02 Run `npm run build:json` (or rely on pre-commit hook) so
      `component-definition.json`, `component-models.json`, and
      `component-filters.json` are regenerated
- [ ] TF03 Commit the partial + merged root files
- [ ] TF04 `git push -u origin <feature-branch>` so the preview tier
      and Universal Editor see the new block

**Checkpoint**: Branch HEAD on remote contains the merged
`component-*.json` referencing the new/modified block.

---

## Phase G: AEM Author Setup (MCP-driven)

**Purpose**: Stand up a real authored page at `/blocks/<feature-slug>`
so Playwright has a target to hit. Runs once per feature; idempotent
re-runs OK.

- [ ] TG01 Create page at `/blocks/<feature-slug>` via
      `mcp__aem-content__create-aem-page`
- [ ] TG02 Patch component fields with test-expected values via
      `mcp__aem-content__patch-aem-page-content`
- [ ] TG03 Publish page via `mcp__aem-content__publish-aem-content`

**Checkpoint**: Page is published and serves authored markup at
`/blocks/<feature-slug>` on the preview tier.

---

## Phase V: Local TDD Loop (red → green)

**Purpose**: Implement the block until the spec passes against
`localhost:3000`. Repeat steps V02–V03 until green.

- [ ] TV01 Start `aem up` in the background (one-shot per session)
- [ ] TV02 Run `npm run test:local -- tests/<full-spec-dir-name>.ts`
      and observe failures
- [ ] TV03 Edit `blocks/<feature-slug>/<feature-slug>.js` and
      `blocks/<feature-slug>/<feature-slug>.css` to address failures
- [ ] TV04 Final green run on `localhost:3000`

**Checkpoint**: Spec green locally.
```

**Notes & nuances**:

- EDS preview (`*.aem.page`) and Universal Editor resolve a block's
  identity from the merged `component-*.json` at the pushed branch
  HEAD. MCP `create-aem-page` / `patch-aem-page-content` cannot
  reference an unknown block, so Phase F (push gate) is mandatory for
  any feature that adds or modifies `_<name>.json`. Features that
  only touch block JS/CSS skip Phase F.
- If MCP credentials are unavailable on a contributor's machine, the
  fallback is manual authoring in Universal Editor at the same path,
  followed by manual publish — the loop is otherwise unchanged.

### VII. Attachment Full-Context Pre-Analysis (NON-NEGOTIABLE)

Whenever a feature's `<featuredir>/spec.md` contains a
`<!-- cacophony:meta ... -->` block, every attachment listed in that
block MUST be fetched and loaded into the implementing model's context
**in full** BEFORE any task that creates or modifies the feature's
runtime artifacts (`blocks/<feature-slug>/<feature-slug>.{js,css}` for
block features; the equivalent target files for other feature types).

**Source of truth**:

- The JSON payload inside `<!-- cacophony:meta ... -->` is authoritative
  for the attachment list. The `**Input**` line of `spec.md` is NOT
  scanned for attachment refs.
- Each `attachments[].url` MUST be fetched via the
  `cacophony-fetch-attachment` skill (the only credentialed path —
  direct `WebFetch`/`curl` returns 401/403).

**Pre-analysis contract**:

- **Whole-file load**: every attachment MUST be loaded with a single
  `Read` call covering the entire file. Chunked or paginated reads
  (`offset`, `limit`, partial range, streaming) are FORBIDDEN. PNG/JPG
  render visually; SVG, TXT, CSS, HTML, JSON, MD load as text in full.
- **Default supported types** — pre-analysis applies to ALL attachments
  in the meta block, regardless of extension:
  - **Images** (PNG/SVG/JPG/etc.) — visual references for the block's
    layout, spacing, color, typography.
  - **Non-images** (TXT/CSS/HTML/JSON/MD/etc.) — authoritative reference
    for the block's markup contract, styles, copy, or data shape. The
    contents take precedence over inferred behavior.
- **Caching**: within a single `/speckit-implement` invocation, an
  already-fetched `/tmp/<name>` MAY be reused — but the Read MUST still
  cover the whole file each session.

**Hard gate**:

- If the cacophony middleware is unreachable (connection refused on
  `localhost:8080`), or any attachment returns non-200, implementation
  tasks for the block's JS/CSS MUST NOT begin. The implementer MUST
  resolve the fetch failure (start cacophony, fix the URL, etc.) before
  proceeding. This gate has no fail-soft branch — partial visual
  context is treated as no visual context.
- The model MUST report the failed attachment names verbatim and stop,
  rather than silently degrading.

**No tasks-file injection**:

- This principle is enforced by the implementing model reading the
  constitution and the cacophony:meta block directly during
  `/speckit-implement`. There is no synthetic Phase 0 block in
  `tasks.md`. The legacy `visual-refs` extension and its `after_tasks`
  hook are removed.
- `/speckit-tasks` MUST NOT add attachment-handling tasks; the
  constitutional gate covers it. Authors MAY still mention specific
  attachments inside regular feature tasks for narrative clarity, but
  the gate is independent of those mentions.

**Post-implementation parity check (CMS-authored content)**:

Because Facilita EDS is an AEM-authored site, attachments routinely
carry strings, links, and paths that end up as authored content (block
fields, page metadata, navigation hrefs) — NOT as hardcoded values in
JS/CSS. After the block JS/CSS is green locally, the implementer MUST
verify that the authored payload at `/blocks/<feature-slug>` matches
the attachment contents.

- Pull authored state via the `aem-content` MCP:
  - `mcp__aem-content__get-aem-page-content` — block fields and
    section structure.
  - `mcp__aem-content__get-aem-page-content-definition` — schema-level
    view of the authored values.
  - `mcp__aem-content__get-aem-page-metadata` — page-level metadata
    (title, description, OG tags, etc.).
- For every textual / link / path token present in an attachment
  (copy strings, anchor `href`s, image `src`/`alt`, CTA labels, ARIA
  labels, page titles, etc.), confirm a byte-for-byte match against
  the authored value. Whitespace and casing matter unless the
  attachment explicitly notes otherwise.
- On mismatch, prefer fixing the AUTHORED side via
  `mcp__aem-content__patch-aem-page-content` (the attachment is the
  source of truth for content). Then re-publish via
  `mcp__aem-content__publish-aem-content` and re-run
  `npm run test:local`.
- Mismatches that reveal a bug in the block JS/CSS (e.g., the block
  rewrites a path the author set correctly) MUST be fixed in code,
  not by mutating the authored value.
- This check is the final step of the Principle VI Phase V loop —
  the spec is not "green" until both Playwright and the parity check
  pass.

**Out of scope**:

- Trackers other than `tracker == "plane"` are unsupported today;
  features using a different tracker MUST update the
  `cacophony-fetch-attachment` skill before the gate can run.
- Features whose `spec.md` has no `<!-- cacophony:meta ... -->` block
  bypass this principle entirely (no-op).

## EDS Technical Constraints

- **No block nesting**: AEM EDS does not support blocks inside blocks.
  Use item groups (field-name prefixing) or section-level composition.
- **Flat HTML contract**: The block's authored content is delivered as a
  flat `<div>` table structure. The `decorate()` function transforms
  this into the desired markup at runtime.
- **Import extensions**: All JS imports MUST include the `.js` file
  extension (enforced by ESLint).
- **Line endings**: Unix-style `\n` (enforced by ESLint).
- **Indentation**: 2 spaces for JS/JSON, 4 spaces for CSS.
- **Language**: Code in English, comments in Portuguese.
- **Environments**: Preview at `*.aem.page`, Live at `*.aem.live`.
  Branch-based URL pattern:
  `https://<branch>--facilita-eds-ue--vilt-r-d.aem.<page|live>`.

## Development Workflow & Tooling

- **Branching**: Work on feature branches, PR into `main`.
- **Linting**: Run `npm run lint` before committing. Auto-fix with
  `npm run lint:fix`.
- **JSON merging**: `npm run build:json` merges `_*.json` partials into
  root-level config files. Runs automatically via Husky pre-commit hook
  when `_*.json` files are staged.
- **Local dev**: `aem up` serves at `http://localhost:3000`.
- **E2E tests**: Playwright tests live under `/tests` per the policy
  established by feature `002-playwright-story-tests`. Every new feature
  contributes one `tests/<full-spec-dir-name>.ts` file containing one
  comprehensive test per user story in its paired `spec.md`, targeting
  the AEM EDS branch preview (pre-merge acceptance gate) and the
  `develop` preview (post-merge regression gate). Enforcement is via
  reviewer checklist; see `specs/002-playwright-story-tests/` for the
  spec, contracts, and quickstart.
- **Local TDD loop**: `npm run test:local` runs the Playwright suite
  against `http://localhost:3000` (requires `aem up` running and a
  published target page at `/blocks/<feature-slug>`). Used for the
  red→green inner loop during block development; see Principle VI.

## Governance

This constitution supersedes all ad-hoc conventions for the Facilita EDS
project. All PRs and code reviews MUST verify compliance with the
principles above.

- **Amendments**: Any change to this constitution MUST be documented with
  a version bump, rationale, and migration plan for affected code.
- **Versioning**: MAJOR.MINOR.PATCH semantic versioning.
  - MAJOR: Principle removal or backward-incompatible redefinition.
  - MINOR: New principle or materially expanded guidance.
  - PATCH: Clarification, wording, or typo fixes.
- **Compliance review**: Before merging any PR that introduces a new
  block, the reviewer MUST verify Principles I, IV, and V are satisfied.
- **Runtime guidance**: See `CLAUDE.md` at the project root for
  development commands and architecture details.

**Version**: 1.4.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-05-08
