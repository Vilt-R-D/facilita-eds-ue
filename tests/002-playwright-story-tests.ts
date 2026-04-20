import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';

// Meta-testes para a feature 002-playwright-story-tests.
// A feature não publica uma página /blocks/<slug> (auto-exceção documentada em
// specs/002-playwright-story-tests/spec.md > Assumptions), então os testes
// abaixo verificam a política em si: conformidade do scaffolding, não navegação
// de navegador. Nenhum fixture `page` é usado para não exigir Chromium instalado.

const REPO_ROOT = resolve(__dirname, '..');
const SPEC_FILE = resolve(REPO_ROOT, 'specs', '002-playwright-story-tests', 'spec.md');
const TESTS_DIR = resolve(REPO_ROOT, 'tests');
const CONFIG_FILE = resolve(REPO_ROOT, 'playwright.config.ts');
const SELF_FILE = __filename;

test('US1: 1:1 story-to-test mapping is machine-checkable', async () => {
  const specText = readFileSync(SPEC_FILE, 'utf8');
  const storyMatches = specText.match(/^### User Story \d+/gm) ?? [];
  const storyCount = storyMatches.length;

  const selfText = readFileSync(SELF_FILE, 'utf8');
  // Conta chamadas top-level de test(...) neste arquivo.
  const testMatches = selfText.match(/^test\(/gm) ?? [];
  const testCount = testMatches.length;

  expect(storyCount).toBeGreaterThan(0);
  expect(testCount).toBe(storyCount);
});

test('US2: tests/ directory convention is respected', async () => {
  // /tests existe na raiz do repositório.
  expect(existsSync(TESTS_DIR)).toBe(true);

  // Este arquivo está diretamente dentro de /tests (sem subpastas).
  expect(dirname(SELF_FILE)).toBe(TESTS_DIR);

  // Nome segue <nome-completo-da-pasta-do-spec>.ts (preservando prefixo numérico, FR-004).
  expect(basename(SELF_FILE)).toBe('002-playwright-story-tests.ts');
});

test('US3: playwright.config.ts resolves baseURL from BASE_URL', async () => {
  const configText = readFileSync(CONFIG_FILE, 'utf8');

  // O config lê o env var BASE_URL.
  expect(configText).toContain('process.env.BASE_URL');

  // O fallback aponta para o preview do develop (host pós-merge).
  expect(configText).toContain('https://develop--facilita-eds-ue--vilt-r-d.aem.page');

  // O padrão de fallback (?? ou ||) garante que BASE_URL sobrescreve o default.
  expect(configText).toMatch(/process\.env\.BASE_URL\s*(\?\?|\|\|)/);
});
