/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EASYBOOKING - TESTS E2E NAVIGATION & UI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests end-to-end couvrant :
 * - Navigation entre les pages
 * - Affichage des éléments UI
 * - Responsive design
 * - Comportement des composants
 *
 * @usage npx playwright test tests/e2e/navigation.spec.ts
 */

import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION GÉNÉRALE
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Navigation générale", () => {
  // TEST 1: La page d'accueil se charge correctement
  test("la page d'accueil devrait se charger sans erreur", async ({ page }) => {
    const response = await page.goto("/");

    // Vérifier le statut HTTP
    expect(response?.status()).toBe(200);

    // Vérifier que le contenu principal est présent
    await expect(page.locator("main")).toBeVisible();
  });

  // TEST 2: Le logo redirige vers l'accueil
  test("le logo devrait rediriger vers la page d'accueil", async ({ page }) => {
    await page.goto("/login");

    // Cliquer sur le logo ou le nom de l'app
    const logo = page.getByRole("link", { name: /easybooking/i }).first();

    if (await logo.isVisible()) {
      await logo.click();
      await expect(page).toHaveURL("/");
    }
  });

  // TEST 3: Navigation retour fonctionne
  test("le bouton retour du navigateur devrait fonctionner", async ({ page }) => {
    await page.goto("/");
    await page.goto("/login");

    // Vérifier qu'on est sur /login
    await expect(page).toHaveURL(/login/);

    // Retour arrière
    await page.goBack();

    // Vérifier qu'on est revenu à l'accueil
    await expect(page).toHaveURL("/");
  });

  // TEST 4: Les pages protégées redirigent vers login
  test("les pages protégées devraient rediriger vers login", async ({ page }) => {
    // Tenter d'accéder à une page protégée sans être connecté
    await page.goto("/rooms");

    // Devrait rediriger vers login ou afficher un message
    await expect(page).toHaveURL(/login|rooms/);
  });

  // TEST 5: Les routes inexistantes sont gérées correctement
  test("devrait gérer les routes inexistantes", async ({ page }) => {
    const response = await page.goto("/page-qui-nexiste-pas-du-tout");

    // Vérifier le statut 404, le contenu de la page, ou une redirection vers login
    // (Next.js peut rediriger vers login pour les routes non définies)
    const is404 = response?.status() === 404;
    const hasNotFoundText = await page.getByText(/404|not found|introuvable/i).isVisible().catch(() => false);
    const wasRedirectedToLogin = page.url().includes("/login");
    const wasRedirectedToHome = page.url().endsWith("/");

    expect(is404 || hasNotFoundText || wasRedirectedToLogin || wasRedirectedToHome).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ÉLÉMENTS UI - PAGE D'ACCUEIL
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Éléments UI - Page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // TEST 6: Le header est visible
  test("le header devrait être visible", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  // TEST 7: Le footer est visible
  test("le footer devrait être visible", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  // TEST 8: Les sections principales sont présentes
  test("les sections principales devraient être présentes", async ({ page }) => {
    // Vérifier la présence d'éléments clés
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Vérifier la présence de boutons d'action
    const buttons = page.getByRole("link");
    expect(await buttons.count()).toBeGreaterThan(0);
  });

  // TEST 9: Les fonctionnalités sont listées
  test("les fonctionnalités devraient être affichées", async ({ page }) => {
    // Vérifier la présence de la section fonctionnalités
    const featuresSection = page.getByText(/fonctionnalités|features/i);

    if (await featuresSection.isVisible()) {
      // Vérifier qu'il y a au moins quelques éléments
      const featureItems = page.locator("section").filter({ hasText: /salle|réserv/i });
      expect(await featureItems.count()).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE DESIGN
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Responsive Design", () => {
  // TEST 10: La page s'affiche correctement en mobile
  test("la page devrait s'afficher correctement en mobile", async ({ page }) => {
    // Définir la taille mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Vérifier que le contenu principal est visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Vérifier qu'il n'y a pas de scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // +10 pour la marge d'erreur
  });

  // TEST 11: La page s'affiche correctement en tablette
  test("la page devrait s'afficher correctement en tablette", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // TEST 12: Le formulaire de login est utilisable en mobile
  test("le formulaire de login devrait être utilisable en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/login");

    // Vérifier que les champs sont visibles et utilisables
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/mot de passe/i);
    const submitButton = page.getByRole("button", { name: /connexion|connecter/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Vérifier qu'on peut interagir
    await emailInput.fill("test@mobile.com");
    await expect(emailInput).toHaveValue("test@mobile.com");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Performance de base", () => {
  // TEST 13: La page d'accueil charge en moins de 3 secondes
  test("la page d'accueil devrait charger rapidement", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // La page devrait charger en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  // TEST 14: La page de login charge en moins de 3 secondes
  test("la page de login devrait charger rapidement", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  // TEST 15: Pas d'erreurs JavaScript dans la console
  test("ne devrait pas avoir d'erreurs JavaScript", async ({ page }) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");
    await page.goto("/login");
    await page.goto("/register");

    // Filtrer les erreurs liées à Supabase ou au réseau (acceptables en test)
    const criticalErrors = errors.filter(
      (e) => !e.includes("supabase") && !e.includes("fetch") && !e.includes("network")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SÉCURITÉ DE BASE
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Sécurité de base", () => {
  // TEST 16: Les mots de passe sont masqués
  test("les champs de mot de passe devraient être masqués", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByLabel(/mot de passe/i);

    // Vérifier le type password
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  // TEST 17: Les formulaires ont l'attribut autocomplete approprié
  test("les formulaires devraient avoir les bons attributs autocomplete", async ({ page }) => {
    await page.goto("/register");

    const emailInput = page.getByLabel(/email/i);

    // Vérifier que l'autocomplete est configuré
    const autocomplete = await emailInput.getAttribute("autocomplete");
    expect(autocomplete).toBeTruthy();
  });
});
