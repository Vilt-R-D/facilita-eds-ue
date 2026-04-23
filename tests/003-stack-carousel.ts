import { test, expect } from '@playwright/test';

// Testes E2E da feature 003-stack-carousel.
// Convenção: um test(...) por User Story descrita em spec.md, cobrindo
// todos os Acceptance Scenarios da história. Alvos:
//   pre-merge  -> BASE_URL=https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page
//   pós-merge  -> BASE_URL=https://develop--facilita-eds-ue--vilt-r-d.aem.page (default)

const BLOCK_PATH = '/blocks/stack-carousel';

test('US1: advance the stack by clicking the front card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BLOCK_PATH);

  const block = page.locator('.stack-carousel.block');
  await expect(block).toBeVisible();

  const front = block.locator('.stack-card[data-layer="front"]');
  const activeDot = block.locator('.stack-dot[aria-current="true"]');

  // Garantia inicial: exatamente um front, exatamente um dot ativo.
  await expect(front).toHaveCount(1);
  await expect(activeDot).toHaveCount(1);

  const cardCount = await block.locator('.stack-card').count();
  expect(cardCount).toBeGreaterThanOrEqual(3);

  // Captura a ordem inicial pelo índice do card de frente.
  const initialFrontIndex = await front.first().getAttribute('data-index');
  const initialFrontText = (await front.first().innerText()).trim();
  expect(initialFrontText.length).toBeGreaterThan(0);

  // Scenario 1.1: ao clicar, a fase transiente advancing-out é aplicada ao card clicado.
  const outgoing = front.first();
  await outgoing.click();

  // A fase é transiente — aguarda aparecer e depois desaparecer.
  await expect(block.locator('.stack-card[data-phase="advancing-out"]')).toHaveCount(1);

  // Scenario 1.1 (cont.): após o ciclo, o card clicado sai do front e o segundo card assume.
  await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });

  const newFrontIndex = await block.locator('.stack-card[data-layer="front"]').getAttribute('data-index');
  expect(newFrontIndex).not.toBe(initialFrontIndex);

  // Scenario 1.2: o dot com aria-current="true" acompanha o novo front.
  const newActiveDotIndex = await block
    .locator('.stack-dot[aria-current="true"]')
    .getAttribute('data-target-index');
  expect(newActiveDotIndex).toBe(newFrontIndex);

  // Scenario 1.3: após N cliques (N = total de cards), volta ao card inicial.
  const clicksRemaining = cardCount - 1;
  for (let i = 0; i < clicksRemaining; i += 1) {
    await block.locator('.stack-card[data-layer="front"]').click();
    // Aguarda a animação encerrar antes do próximo clique.
    await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });
  }

  const frontAfterCycle = await block
    .locator('.stack-card[data-layer="front"]')
    .getAttribute('data-index');
  expect(frontAfterCycle).toBe(initialFrontIndex);

  const activeDotAfterCycle = await block
    .locator('.stack-dot[aria-current="true"]')
    .getAttribute('data-target-index');
  expect(activeDotAfterCycle).toBe(initialFrontIndex);

  // Shortest-path via dot: salta direto para o card mais distante em uma única animação.
  const farIndex = Math.floor(cardCount / 2);
  const farTarget = String(farIndex);
  const initialIdx = parseInt(initialFrontIndex ?? '0', 10);
  if (farIndex !== initialIdx) {
    await block.locator(`.stack-dot[data-target-index="${farTarget}"]`).click();
    await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });
    const landedIndex = await block
      .locator('.stack-card[data-layer="front"]')
      .getAttribute('data-index');
    expect(landedIndex).toBe(farTarget);
  }

  // No-op: clicar no dot já ativo não muda estado.
  const currentFrontIndex = await block
    .locator('.stack-card[data-layer="front"]')
    .getAttribute('data-index');
  const activeDot2 = block.locator('.stack-dot[aria-current="true"]');
  await activeDot2.click();
  // Nenhuma fase aparece após clicar no dot ativo.
  await page.waitForTimeout(200);
  await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0);
  const stillFront = await block
    .locator('.stack-card[data-layer="front"]')
    .getAttribute('data-index');
  expect(stillFront).toBe(currentFrontIndex);
});

test('US2: perceive the pile as a stack at a glance', async ({ page }) => {
  // Desktop: ≥1280px.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BLOCK_PATH);

  const block = page.locator('.stack-carousel.block');
  await expect(block).toBeVisible();

  // Scenario 2.1: exatamente um front + um back-1 + um back-2 visíveis.
  await expect(block.locator('.stack-card[data-layer="front"]')).toHaveCount(1);
  await expect(block.locator('.stack-card[data-layer="back-1"]')).toHaveCount(1);
  await expect(block.locator('.stack-card[data-layer="back-2"]')).toHaveCount(1);

  await expect(block.locator('.stack-card[data-layer="front"]')).toBeVisible();
  await expect(block.locator('.stack-card[data-layer="back-1"]')).toBeVisible();
  await expect(block.locator('.stack-card[data-layer="back-2"]')).toBeVisible();

  // Scenario 2.2: front card tem cursor: pointer computado.
  const frontCursor = await block
    .locator('.stack-card[data-layer="front"]')
    .evaluate((el) => window.getComputedStyle(el).cursor);
  expect(frontCursor).toBe('pointer');

  // Invariantes de acessibilidade: não-fronts são inertes.
  const nonFrontTabindexes = await block
    .locator('.stack-card:not([data-layer="front"])')
    .evaluateAll((els) => els.map((el) => el.getAttribute('tabindex')));
  expect(nonFrontTabindexes.every((t) => t === '-1')).toBe(true);

  const nonFrontAriaHidden = await block
    .locator('.stack-card:not([data-layer="front"])')
    .evaluateAll((els) => els.map((el) => el.getAttribute('aria-hidden')));
  expect(nonFrontAriaHidden.every((a) => a === 'true')).toBe(true);

  // No máximo 3 layers visualmente pintadas (front + back-1 + back-2).
  const paintedCount = await block
    .locator('.stack-card[data-layer="front"], .stack-card[data-layer="back-1"], .stack-card[data-layer="back-2"]')
    .count();
  expect(paintedCount).toBeLessThanOrEqual(3);

  // Scenario 2.3: mobile 375px — copy acima do pile, sem overflow horizontal.
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BLOCK_PATH);

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noOverflow).toBe(true);

  // Copy renderizado acima do pile: bounding box do copy tem top menor que o do pile.
  const copyTop = await page.locator('.stack-carousel-copy').first().evaluate((el) => el.getBoundingClientRect().top);
  const pileTop = await page.locator('.stack-carousel-pile').first().evaluate((el) => el.getBoundingClientRect().top);
  expect(copyTop).toBeLessThan(pileTop);
});

test('US3: authored order renders and cycles correctly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BLOCK_PATH);

  const block = page.locator('.stack-carousel.block');
  await expect(block).toBeVisible();

  const cards = block.locator('.stack-card');
  const dots = block.locator('.stack-dot');

  // Scenario 3.1: número de cards == número de dots (um por item autorado).
  const cardCount = await cards.count();
  const dotCount = await dots.count();
  expect(cardCount).toBeGreaterThanOrEqual(3);
  expect(dotCount).toBe(cardCount);

  // Scenario 3.2: ordem autorada esperada — Card A (front) / Card B (back-1) / Card C (back-2).
  const frontText = (await block.locator('.stack-card[data-layer="front"]').innerText()).trim();
  const back1Text = (await block.locator('.stack-card[data-layer="back-1"]').innerText()).trim();
  const back2Text = (await block.locator('.stack-card[data-layer="back-2"]').innerText()).trim();

  expect(frontText).toContain('Card A');
  expect(back1Text).toContain('Card B');
  expect(back2Text).toContain('Card C');

  // Scenario 3.3: ao avançar, o ciclo segue a ordem autorada (A → B → C → A).
  await block.locator('.stack-card[data-layer="front"]').click();
  await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });
  const afterClick1 = (await block.locator('.stack-card[data-layer="front"]').innerText()).trim();
  expect(afterClick1).toContain('Card B');

  await block.locator('.stack-card[data-layer="front"]').click();
  await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });
  const afterClick2 = (await block.locator('.stack-card[data-layer="front"]').innerText()).trim();
  expect(afterClick2).toContain('Card C');

  await block.locator('.stack-card[data-layer="front"]').click();
  await expect(block.locator('.stack-card[data-phase]')).toHaveCount(0, { timeout: 2000 });
  const afterClick3 = (await block.locator('.stack-card[data-layer="front"]').innerText()).trim();
  expect(afterClick3).toContain('Card A');
});
