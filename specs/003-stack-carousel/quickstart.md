# Quickstart — Stack Carousel Block

**Feature**: `003-stack-carousel` | **Date**: 2026-04-22

Three audiences are served by this quickstart: the **developer** implementing the block, the **author** placing it on a page in Universal Editor, and the **reviewer** approving the PR. Pick the section that matches your role.

---

## Developer quickstart

### 1. Create the block scaffold

```bash
mkdir -p blocks/stack-carousel
```

Create three files inside:

- `blocks/stack-carousel/stack-carousel.js` — exports `default async function decorate(block)` and implements the behaviour described in `contracts/dom-contract.md` (sections 1 and 2) and `research.md` (decisions D1–D9).
- `blocks/stack-carousel/stack-carousel.css` — all selectors scoped under `.stack-carousel.block`, 4-space indent, mobile-first with `@media (min-width: 1024px)` (or the project's desktop breakpoint). Includes `@media (prefers-reduced-motion: reduce)` per D7.
- `blocks/stack-carousel/_stack-carousel.json` — exactly the shape specified in `contracts/ue-schema.md`.

### 2. Register the block in the section filter

Edit `models/_section.json` and append `"stack-carousel"` to `filters[0].components`. This is the only file outside `blocks/stack-carousel/` and `tests/` that the feature modifies.

### 3. Regenerate the root component JSON files

```bash
npm run build:json
```

This merges `_*.json` partials into `component-definition.json`, `component-models.json`, and `component-filters.json`. The Husky pre-commit hook runs this automatically when any `_*.json` is staged, but running it manually first lets you verify the merge locally.

### 4. Run the site locally

```bash
aem up
```

Open `http://localhost:3000/<page-with-block>` to manually exercise the block. The page needs at least one `stack-carousel` authored with 3+ items to exercise the visual-pile + advance behaviours.

### 5. Lint before committing

```bash
npm run lint        # JS + CSS
# or
npm run lint:fix    # auto-fix what is fixable
```

ESLint enforces the `.js` extension in imports and Unix line endings; Stylelint enforces 4-space CSS indentation.

### 6. Add the Playwright tests

Create `tests/003-stack-carousel.ts` with three `test(...)` blocks — one per User Story — each asserting **every** Acceptance Scenario listed under its story. Selectors MUST use the contract in `contracts/dom-contract.md` (Section 4). Template:

```ts
import { test, expect } from '@playwright/test';

const BLOCK_PATH = '/blocks/stack-carousel';

test('US1: advance the stack by clicking the front card', async ({ page }) => {
  await page.goto(BLOCK_PATH);
  // Assert Scenarios 1.1 (two-phase motion), 1.2 (pagination sync), 1.3 (wrap-around with no flicker).
});

test('US2: perceive the pile as a stack at a glance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BLOCK_PATH);
  // Assert Scenarios 2.1 (3 layers visible), 2.2 (pointer affordance), 2.3 (mobile layout @375px).
  await page.setViewportSize({ width: 375, height: 667 });
  // …
});

test('US3: authored order renders and cycles correctly', async ({ page }) => {
  await page.goto(BLOCK_PATH);
  // Assert Scenarios 3.1 (block accepts items), 3.2 (A at front, B behind, C behind B), 3.3 (reorder updates render).
  // 3.1 / 3.3 are covered by the existence of a demo page with the expected authored order; UE drag-drop is manual.
});
```

### 7. Run the tests

One-time per machine: `npx playwright install chromium`.

**Against your feature branch preview (pre-merge acceptance gate)**:
```bash
BASE_URL=https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page npm test -- tests/003-stack-carousel.ts
```

**Against `develop` (post-merge regression gate)**:
```bash
npm test -- tests/003-stack-carousel.ts
# or: npm run test:develop
```

### 8. Create the demo page

For the preview URL `/blocks/stack-carousel` referenced by the tests to exist, an engineer / author MUST publish a demo page on the feature branch preview with a `stack-carousel` authored to contain at least 3 items labeled (for testability) `Card A`, `Card B`, `Card C`. Include all four `bgColor` options across items so CSS coverage is exercised.

---

## Author quickstart

### Placing the block on a page

1. Open the target page in Universal Editor.
2. Drag the **Section** container onto the page if one does not already exist.
3. Inside the section, drag **Stack Carousel** (it appears in the block picker once this feature is live).
4. Fill the container-level fields:
   - **Título** — the section heading shown to the left of the pile on desktop.
   - **Texto de apoio** — a supporting paragraph (optional).
   - **Texto do botão** — the CTA label (optional — leave blank to hide the CTA).
   - **Link do botão** — the CTA target (optional — leave blank to hide the CTA).
5. Add 1 to 6 **Stack Carousel Item** children inside the block. For each item set:
   - **Título do card** — required.
   - **Texto do card** — optional.
   - **Ícone do card** — optional icon reference.
   - **Cor de fundo do card** — required; pick one of Preto, Verde escuro, Verde claro, Branco.
6. Reorder items via drag-and-drop in the UE content tree — the first item becomes the front card.
7. Save & publish to preview. Open the page on the branch preview URL to validate.

### Authoring constraints (v1)

- Maximum **6** items per block. More than that is unsupported.
- At most **3** cards are painted visibly (1 front + 2 back) regardless of authored count; the rest rotate into the visible slots as the visitor advances the stack.
- The left/right arrangement (copy on the left on desktop, stack on the right) is fixed — not configurable in v1.
- On mobile, the copy renders above the stack automatically.

---

## Reviewer quickstart

Before approving the PR on `develop`, run through the following short checklist (full form: `specs/002-playwright-story-tests/contracts/reviewer-checklist.md`).

### Structural

- [ ] `blocks/stack-carousel/` contains exactly `stack-carousel.js`, `stack-carousel.css`, `_stack-carousel.json`.
- [ ] `_stack-carousel.json` matches `contracts/ue-schema.md` (two definitions, two models, one filter; field names + order exact; `bgColor` options exactly the four documented).
- [ ] Root `component-definition.json`, `component-models.json`, `component-filters.json` were regenerated by `npm run build:json` — there are no hand-edits outside the areas the new block would introduce.
- [ ] `models/_section.json` has `"stack-carousel"` appended to the section filter components list.
- [ ] No new entries in `package.json` dependencies / devDependencies (Principle II).

### Runtime

- [ ] On the feature branch preview, the block renders at `https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page/blocks/stack-carousel` with the demo content.
- [ ] At desktop width ≥ 1280 px: copy is on the left, pile on the right, at least 3 visible layers when ≥ 3 items authored.
- [ ] At mobile width 375 px: copy is above the pile, no horizontal scrollbar.
- [ ] Click the front card — it animates out to the right then settles at the back; the previously second card becomes the new front; pagination dot updates.
- [ ] Tab to the front card; press Enter — same advance behaviour; focus moves to the new front card.
- [ ] Tab to a distant pagination dot; press Enter — the target card becomes the front in a **single** animation (not chained steps).
- [ ] OS-level reduced motion enabled: the advance is near-instant, state still correct.
- [ ] Playwright — 3 tests present in `tests/003-stack-carousel.ts`, test names reference US1 / US2 / US3, PR description includes a passing-run log against the branch preview.

### Accessibility spot-check

- [ ] The front card is the only one with `tabindex="0"`; others have `tabindex="-1"` and `aria-hidden="true"` (verify in DevTools after an advance).
- [ ] Pagination dots are real `<button>` elements and the active one has `aria-current="true"`.
- [ ] Pressing Enter/Space on the front card advances; Tab order is logical.

### Performance spot-check

- [ ] DevTools Performance recording of one advance shows ≤ 600 ms total and ≥ 30 fps during the transition (SC-003).

---

## Troubleshooting

- **Block does not appear in UE's block picker**: run `npm run build:json`, verify `component-definition.json` contains the `stack-carousel` entry, refresh UE.
- **Items cannot be added inside the block**: verify `_stack-carousel.json` `filters` entry is present and re-run `build:json`.
- **Animation flickers / card ends up in wrong slot after rapid clicks**: the `isAdvancing` guard is not engaged — inspect the click handler (research D1 / D2).
- **Front card not keyboard-focusable**: missing `tabindex="0"` / `role="button"` — see `contracts/dom-contract.md` §1.
- **Playwright test says `/blocks/stack-carousel` returns 404**: the demo page has not been authored on the feature branch preview yet — see Developer step 8.
- **Preview URL not resolving at all**: AEM EDS has not yet published the branch preview; wait 30–60 s after pushing.
