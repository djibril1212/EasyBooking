import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright pour EasyBooking
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Dossier des tests E2E
  testDir: "./tests/e2e",

  // Timeout par test
  timeout: 30 * 1000,

  // Timeout pour les expect
  expect: {
    timeout: 5000,
  },

  // Exécution en parallèle
  fullyParallel: true,

  // Échouer le build si test.only est présent en CI
  forbidOnly: !!process.env.CI,

  // Nombre de retries
  retries: process.env.CI ? 2 : 0,

  // Nombre de workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],

  // Configuration partagée pour tous les projets
  use: {
    // URL de base de l'application
    baseURL: "http://localhost:3000",

    // Collecter les traces en cas d'échec
    trace: "on-first-retry",

    // Screenshots en cas d'échec
    screenshot: "only-on-failure",

    // Vidéo en cas d'échec
    video: "on-first-retry",
  },

  // Projets (navigateurs)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Démarrer le serveur de dev avant les tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
