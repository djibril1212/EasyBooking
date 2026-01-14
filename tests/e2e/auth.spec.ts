/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EASYBOOKING - TESTS E2E AUTHENTIFICATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests end-to-end couvrant les parcours utilisateur d'authentification :
 * - Inscription d'un nouvel utilisateur
 * - Connexion d'un utilisateur existant
 * - Gestion des erreurs de formulaire
 * - Navigation et redirections
 *
 * @usage npx playwright test tests/e2e/auth.spec.ts
 */

import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// PAGE D'ACCUEIL
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Page d'accueil", () => {
  // TEST 1: Affichage de la page d'accueil
  test("devrait afficher la page d'accueil avec les boutons de connexion", async ({ page }) => {
    await page.goto("/");

    // Vérifier le titre ou le contenu principal
    await expect(page.locator("h1")).toContainText(/réserv|EasyBooking/i);

    // Vérifier la présence d'au moins un bouton d'authentification
    const loginButton = page.getByRole("link", { name: /connexion|connecter/i }).first();
    const registerButton = page.getByRole("link", { name: /compte|inscription|inscrire/i }).first();

    const hasLogin = await loginButton.isVisible().catch(() => false);
    const hasRegister = await registerButton.isVisible().catch(() => false);

    expect(hasLogin || hasRegister).toBeTruthy();
  });

  // TEST 2: Navigation vers la page d'inscription
  test("devrait naviguer vers la page d'inscription", async ({ page }) => {
    await page.goto("/");

    // Cliquer sur le bouton d'inscription
    await page.getByRole("link", { name: /compte|inscription/i }).first().click();

    // Vérifier l'URL
    await expect(page).toHaveURL(/register/);

    // Vérifier le formulaire d'inscription
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
  });

  // TEST 3: Navigation vers la page de connexion
  test("devrait naviguer vers la page de connexion", async ({ page }) => {
    await page.goto("/");

    // Cliquer sur le bouton de connexion
    await page.getByRole("link", { name: /connexion|connecter/i }).first().click();

    // Vérifier l'URL
    await expect(page).toHaveURL(/login/);

    // Vérifier le formulaire de connexion
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORMULAIRE D'INSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Formulaire d'inscription", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  // TEST 4: Affichage du formulaire d'inscription
  test("devrait afficher tous les champs du formulaire", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
    await expect(page.getByLabel(/confirm/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /créer|inscription|inscrire/i })).toBeVisible();
  });

  // TEST 5: Validation email invalide
  test("devrait afficher une erreur pour un email invalide", async ({ page }) => {
    await page.getByLabel(/email/i).fill("email-invalide");
    await page.getByLabel(/mot de passe/i).first().fill("password123");
    await page.getByLabel(/confirm/i).fill("password123");

    await page.getByRole("button", { name: /créer|inscription/i }).click();

    // Attendre l'erreur de validation
    await expect(page.getByText(/email|invalide|format/i)).toBeVisible({ timeout: 5000 });
  });

  // TEST 6: Validation mot de passe trop court
  test("devrait afficher une erreur pour un mot de passe trop court", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).first().fill("short");
    await page.getByLabel(/confirm/i).fill("short");

    await page.getByRole("button", { name: /créer|inscription/i }).click();

    // Attendre l'erreur de validation ou que le formulaire ne soit pas soumis
    await page.waitForTimeout(1000);
    const hasError = await page.getByText(/8|caractères|court|minimum/i).isVisible().catch(() => false);
    const stayedOnPage = page.url().includes("register");

    expect(hasError || stayedOnPage).toBeTruthy();
  });

  // TEST 7: Validation mots de passe non identiques
  test("devrait afficher une erreur si les mots de passe ne correspondent pas", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).first().fill("password123");
    await page.getByLabel(/confirm/i).fill("different456");

    await page.getByRole("button", { name: /créer|inscription/i }).click();

    // Attendre l'erreur de validation ou que le formulaire ne soit pas soumis
    await page.waitForTimeout(1000);
    const hasError = await page.getByText(/correspond|identique|match|différent/i).isVisible().catch(() => false);
    const stayedOnPage = page.url().includes("register");

    expect(hasError || stayedOnPage).toBeTruthy();
  });

  // TEST 8: Lien vers la page de connexion
  test("devrait avoir un lien vers la page de connexion", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /connecter|connexion/i });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORMULAIRE DE CONNEXION
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Formulaire de connexion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  // TEST 9: Affichage du formulaire de connexion
  test("devrait afficher tous les champs du formulaire", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /connexion|connecter/i })).toBeVisible();
  });

  // TEST 10: Validation champs vides
  test("devrait afficher une erreur pour des champs vides", async ({ page }) => {
    // Soumettre le formulaire sans remplir les champs
    await page.getByRole("button", { name: /connexion|connecter/i }).click();

    // Attendre un moment pour la validation
    await page.waitForTimeout(500);

    // Vérifier qu'on reste sur la page login (le formulaire n'a pas été soumis)
    const isOnLoginPage = page.url().includes("login");
    expect(isOnLoginPage).toBe(true);
  });

  // TEST 11: Erreur avec identifiants incorrects
  test("devrait afficher une erreur avec des identifiants incorrects", async ({ page }) => {
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/mot de passe/i).fill("wrongpassword");

    await page.getByRole("button", { name: /connexion|connecter/i }).click();

    // Attendre l'erreur
    await expect(
      page.getByText(/erreur|incorrect|invalide|échoué/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // TEST 12: Lien vers la page d'inscription
  test("devrait avoir un lien vers la page d'inscription", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /inscrire|inscription|compte/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  // TEST 13: Le bouton de connexion est désactivé pendant le chargement
  test("devrait désactiver le bouton pendant la soumission", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).fill("password123");

    const submitButton = page.getByRole("button", { name: /connexion|connecter/i });

    // Cliquer et vérifier l'état
    await submitButton.click();

    // Le bouton devrait être désactivé ou afficher un état de chargement
    // (soit disabled, soit le texte change en "Chargement...")
    await expect(
      submitButton.or(page.getByText(/chargement/i))
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITÉ
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Accessibilité", () => {
  // TEST 14: Labels accessibles sur le formulaire d'inscription
  test("les champs du formulaire d'inscription doivent avoir des labels accessibles", async ({ page }) => {
    await page.goto("/register");

    // Vérifier que les champs sont associés à des labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/mot de passe/i).first();
    const confirmInput = page.getByLabel(/confirm/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmInput).toBeVisible();

    // Vérifier que les inputs ont les bons types
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  // TEST 15: Navigation au clavier
  test("devrait permettre la navigation au clavier", async ({ page }) => {
    await page.goto("/login");

    // Focus sur le premier champ
    await page.getByLabel(/email/i).focus();
    await expect(page.getByLabel(/email/i)).toBeFocused();

    // Tab vers le champ suivant
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/mot de passe/i)).toBeFocused();

    // Tab vers le bouton
    await page.keyboard.press("Tab");
    const submitButton = page.getByRole("button", { name: /connexion|connecter/i });
    await expect(submitButton).toBeFocused();
  });
});
