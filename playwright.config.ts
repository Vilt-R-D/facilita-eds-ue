import { defineConfig, devices } from '@playwright/test';

// Configuração compartilhada do Playwright para todos os testes do projeto.
// Convenção documentada em specs/002-playwright-story-tests/spec.md e
// specs/002-playwright-story-tests/contracts/playwright-config.md.
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.ts',

  // Tentativas somente em CI; local falha rápido.
  retries: process.env.CI ? 2 : 0,

  // Um worker por padrão para não sobrecarregar o preview do AEM EDS.
  // Substitua via CLI (--workers=N) quando os testes forem comprovadamente independentes.
  workers: 1,

  reporter: process.env.CI ? 'github' : 'html',

  use: {
    // baseURL resolvido do env. Fallback: preview do develop (porta pós-merge).
    // Pre-merge: rode com BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page
    baseURL: process.env.BASE_URL ?? 'https://develop--facilita-eds-ue--vilt-r-d.aem.page',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
