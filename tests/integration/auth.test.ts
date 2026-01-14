/**
 * Tests d'intégration - API Auth
 *
 * Ces tests vérifient le bon fonctionnement de l'authentification.
 * Fonctionnalités testées:
 * - Validation des schémas d'inscription
 * - Validation des schémas de connexion
 * - Gestion des erreurs d'authentification
 */

import { registerSchema, loginSchema } from "@/lib/validations/auth";

describe("Validation Authentification", () => {
  // ============================================
  // TESTS INSCRIPTION - registerSchema
  // ============================================
  describe("Schema d'inscription (registerSchema)", () => {
    // TEST 1: Inscription valide
    it("devrait accepter des données d'inscription valides", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // TEST 2: Email invalide
    it("devrait rejeter un email invalide", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    // TEST 3: Mot de passe trop court
    it("devrait rejeter un mot de passe de moins de 8 caractères", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
      }
    });

    // TEST 4: Mots de passe non identiques
    it("devrait rejeter si les mots de passe ne correspondent pas", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "DifferentPassword!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // TEST 5: Email vide
    it("devrait rejeter un email vide", () => {
      const invalidData = {
        email: "",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // TEST 6: Champs manquants
    it("devrait rejeter si des champs sont manquants", () => {
      const invalidData = {
        email: "test@example.com",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // TESTS CONNEXION - loginSchema
  // ============================================
  describe("Schema de connexion (loginSchema)", () => {
    // TEST 7: Connexion valide
    it("devrait accepter des données de connexion valides", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123!",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // TEST 8: Email invalide à la connexion
    it("devrait rejeter un email invalide à la connexion", () => {
      const invalidData = {
        email: "not-an-email",
        password: "Password123!",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // TEST 9: Mot de passe vide
    it("devrait rejeter un mot de passe vide", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // TEST 10: Tous les champs vides
    it("devrait rejeter si tous les champs sont vides", () => {
      const invalidData = {
        email: "",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // TESTS FORMATS EMAIL
  // ============================================
  describe("Validation des formats d'email", () => {
    const validEmails = [
      "user@example.com",
      "user.name@example.com",
      "user+tag@example.org",
      "user@subdomain.example.com",
    ];

    const invalidEmails = [
      "plaintext",
      "@missinguser.com",
      "user@.com",
      "user@com",
      "user name@example.com",
    ];

    validEmails.forEach((email) => {
      it(`devrait accepter l'email valide: ${email}`, () => {
        const data = { email, password: "Password123!" };
        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    invalidEmails.forEach((email) => {
      it(`devrait rejeter l'email invalide: ${email}`, () => {
        const data = { email, password: "Password123!" };
        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});

// ============================================
// TESTS SÉCURITÉ MOT DE PASSE
// ============================================
describe("Sécurité du mot de passe", () => {
  it("devrait accepter un mot de passe avec caractères spéciaux", () => {
    const data = {
      email: "test@example.com",
      password: "P@ssw0rd!#$",
      confirmPassword: "P@ssw0rd!#$",
    };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("devrait accepter un mot de passe de 8 caractères exactement", () => {
    const data = {
      email: "test@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un mot de passe de 7 caractères", () => {
    const data = {
      email: "test@example.com",
      password: "1234567",
      confirmPassword: "1234567",
    };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
