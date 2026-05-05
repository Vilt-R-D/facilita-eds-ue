<!-- Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: Development Workflow & Tooling — replaced "No test suite"
  rule with "E2E tests" policy referencing feature 002-playwright-story-tests.
Added sections: N/A
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible
  - .specify/templates/spec-template.md — ✅ compatible
  - .specify/templates/tasks-template.md — ✅ compatible
  - .specify/templates/checklist-template.md — ✅ compatible
  - .specify/templates/agent-file-template.md — ✅ compatible
Follow-up TODOs: none

Prior history:
  0.0.0 → 1.0.0 (2026-04-13): Initial ratification.
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

**Version**: 1.1.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-20
