import { test, expect } from '@playwright/test';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

// Meta-testes para a feature 003-speckit-visual-hooks. Os testes invocam o
// script bash diretamente via child_process e validam mutações em tasks.md
// derivadas da linha **Input** do spec.md. Sem fixture `page` — não há browser.
// Mesma exceção de meta-teste documentada para a feature 002.

const REPO_ROOT = resolve(__dirname, '..');
const PREPEND = resolve(
  REPO_ROOT,
  '.specify',
  'extensions',
  'visual-refs',
  'scripts',
  'bash',
  'prepend-task.sh',
);

const PERF_BUDGET_MS = 5000;

function runBash(scriptPath: string, args: string[]): { result: SpawnSyncReturns<string>; durationMs: number } {
  const started = Date.now();
  const result = spawnSync('bash', [scriptPath, ...args], { encoding: 'utf8' });
  const durationMs = Date.now() - started;
  return { result, durationMs };
}

function makeTmpDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeFixture(path: string, content: string): void {
  writeFileSync(path, content, { encoding: 'utf8' });
}

function specWithInput(input: string): string {
  return [
    '# Feature Specification: Test Fixture',
    '',
    '**Feature Branch**: `feat/test-fixture`',
    '**Created**: 2026-05-05',
    '**Status**: Draft',
    `**Input**: User description: "${input}"`,
    '',
    '## User Scenarios & Testing *(mandatory)*',
    '',
    '(body)',
    '',
  ].join('\n');
}

test('after_tasks - prepends idempotent visual-context task to tasks.md from spec.md **Input** line', () => {
  const dir = makeTmpDir('visual-refs-prepend-');
  let totalDuration = 0;
  try {
    const specMd = join(dir, 'spec.md');
    const tasksMd = join(dir, 'tasks.md');

    // (a) Populated case: Input line carries a Windows path + http URL + duplicate
    writeFixture(
      specMd,
      specWithInput(
        'design at C:\\designs\\hero.png and again C:\\designs\\hero.png; icon at <https://cdn.example.com/icons/icon.svg>',
      ),
    );
    const originalTasks = [
      '# Tasks: Prepend Fixture',
      '',
      '## Setup',
      '',
      '- [ ] **T001** Some task',
      '',
    ].join('\n');
    writeFixture(tasksMd, originalTasks);
    const originalBytes = readFileSync(tasksMd);

    const r1 = runBash(PREPEND, [dir]);
    totalDuration += r1.durationMs;
    expect(r1.result.status).toBe(0);
    const out1 = readFileSync(tasksMd, 'utf8');
    expect(out1.startsWith('<!-- visual-context-task:start -->\n')).toBe(true);
    expect(out1).toContain('- [ ] **T000** Load visual references from `spec.md`');
    expect(out1).toContain('  - hero.png: C:\\designs\\hero.png');
    expect(out1).toContain('  - icon.svg: https://cdn.example.com/icons/icon.svg');
    expect(out1).toContain('<!-- visual-context-task:end -->\n\n# Tasks: Prepend Fixture');
    // Dedup: hero.png line appears exactly once
    const heroBullets = out1.match(/^  - hero\.png: C:\\designs\\hero\.png$/gm) ?? [];
    expect(heroBullets.length).toBe(1);

    // (b) Idempotency: re-run yields byte-identical output
    const afterRun1 = readFileSync(tasksMd);
    const r2 = runBash(PREPEND, [dir]);
    totalDuration += r2.durationMs;
    expect(r2.result.status).toBe(0);
    const afterRun2 = readFileSync(tasksMd);
    expect(afterRun2.equals(afterRun1)).toBe(true);

    // (c) Restoration: rewrite spec.md with no PNG/SVG refs in Input → block removed,
    //     tasks.md byte-identical to original
    writeFixture(specMd, specWithInput('add a privacy toggle to the cookie modal.'));
    const r3 = runBash(PREPEND, [dir]);
    totalDuration += r3.durationMs;
    expect(r3.result.status).toBe(0);
    const afterClear = readFileSync(tasksMd);
    expect(afterClear.equals(originalBytes)).toBe(true);

    // (d) Wrap-char fixture: parens, angle brackets, double-quote, single-quote, trailing punct
    writeFixture(
      specMd,
      specWithInput(
        'design (see hero.png), the second is "icon.svg", url <https://cdn.example.com/a.png>; ref \'final.svg\'.',
      ),
    );
    writeFixture(tasksMd, originalTasks);
    const r4 = runBash(PREPEND, [dir]);
    totalDuration += r4.durationMs;
    expect(r4.result.status).toBe(0);
    const out4 = readFileSync(tasksMd, 'utf8');
    expect(out4).toContain('  - hero.png: hero.png');
    expect(out4).toContain('  - icon.svg: icon.svg');
    expect(out4).toContain('  - a.png: https://cdn.example.com/a.png');
    expect(out4).toContain('  - final.svg: final.svg');

    // (e) Failure-mode: malformed Input line (missing closing quote) → exit non-zero,
    //     tasks.md preserved byte-identical, warning emitted to stderr.
    const malformedSpec = [
      '# Feature Specification: Bad',
      '',
      '**Feature Branch**: `feat/bad`',
      '**Created**: 2026-05-05',
      '**Status**: Draft',
      '**Input**: User description: "missing closing quote here',
      '',
      '## User Scenarios & Testing *(mandatory)*',
      '',
    ].join('\n');
    writeFixture(specMd, malformedSpec);
    writeFixture(tasksMd, originalTasks);
    const malformedBefore = readFileSync(tasksMd);
    const r5 = runBash(PREPEND, [dir]);
    totalDuration += r5.durationMs;
    expect(r5.result.status).not.toBe(0);
    expect(r5.result.stderr).toMatch(
      /\[specify\] Warning: visual-refs after_tasks failed: .+; tasks\.md preserved/,
    );
    const malformedAfter = readFileSync(tasksMd);
    expect(malformedAfter.equals(malformedBefore)).toBe(true);

    // SC-004: total wall-clock for all five invocations stays under 5s
    expect(totalDuration).toBeLessThan(PERF_BUDGET_MS);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
