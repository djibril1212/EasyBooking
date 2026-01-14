/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EASYBOOKING - TESTS UNITAIRES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @description Suite de tests unitaires couvrant :
 *   - Validations Auth (login, register)
 *   - Validations Booking (réservations)
 *   - Utilitaires (formatters, helpers)
 *   - Composants UI (Button, Input, Badge, Alert)
 * 
 * @usage
 *   npm test           # Lance tous les tests
 *   npm run test:watch # Mode watch
 *   npm run test:cov   # Avec couverture de code
 * 
 * @author EasyBooking Team
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Validations
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { bookingSchema } from "@/lib/validations/booking";

// Utilitaires
import {
  cn,
  formatTime,
  generateTimeSlots,
  isFutureDate,
  getTodayString,
  formatDate,
} from "@/lib/utils";

// Composants
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

// ═══════════════════════════════════════════════════════════════════════════
// 1. VALIDATIONS AUTH
// ═══════════════════════════════════════════════════════════════════════════

describe("Auth Validations", () => {
  describe("loginSchema", () => {
    it("✓ accepte des identifiants valides", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("✗ rejette un email vide", () => {
      const result = loginSchema.safeParse({ email: "", password: "test" });
      expect(result.success).toBe(false);
    });

    it("✗ rejette un email mal formaté", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("✗ rejette un mot de passe vide", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const validData = {
      email: "new@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    };

    it("✓ accepte une inscription valide", () => {
      expect(registerSchema.safeParse(validData).success).toBe(true);
    });

    it("✗ rejette un mot de passe < 8 caractères", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("✗ rejette si les mots de passe diffèrent", () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: "different123",
      });
      expect(result.success).toBe(false);
    });

    it("✗ rejette si confirmation vide", () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. VALIDATIONS BOOKING
// ═══════════════════════════════════════════════════════════════════════════

describe("Booking Validations", () => {
  const validBooking = {
    room_id: "550e8400-e29b-41d4-a716-446655440000",
    date: "2026-06-15",
    start_time: "09:00",
    end_time: "10:00",
  };

  it("✓ accepte une réservation valide", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("✗ rejette un room_id non-UUID", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      room_id: "invalid-id",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette si heure fin <= heure début", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      start_time: "14:00",
      end_time: "13:00",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette les mêmes heures début/fin", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      start_time: "10:00",
      end_time: "10:00",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette une date vide", () => {
    const result = bookingSchema.safeParse({ ...validBooking, date: "" });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. UTILITAIRES & FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════

describe("Utilitaires", () => {
  describe("cn (class merger)", () => {
    it("fusionne plusieurs classes", () => {
      expect(cn("px-2", "py-4")).toBe("px-2 py-4");
    });

    it("gère les conditions", () => {
      expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("résout les conflits Tailwind", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("formatTime", () => {
    it("formate HH:MM:SS en HH:MM", () => {
      expect(formatTime("14:30:00")).toBe("14:30");
      expect(formatTime("09:00:45")).toBe("09:00");
    });

    it("garde HH:MM intact", () => {
      expect(formatTime("08:15")).toBe("08:15");
    });
  });

  describe("formatDate", () => {
    it("formate une date en français", () => {
      const result = formatDate("2026-01-15");
      expect(result).toContain("janvier");
      expect(result).toContain("2026");
    });
  });

  describe("generateTimeSlots", () => {
    const slots = generateTimeSlots();

    it("génère 12 créneaux horaires", () => {
      expect(slots).toHaveLength(12);
    });

    it("commence à 08:00", () => {
      expect(slots[0]).toBe("08:00");
    });

    it("finit à 19:00", () => {
      expect(slots[slots.length - 1]).toBe("19:00");
    });
  });

  describe("isFutureDate", () => {
    it("retourne true pour date future", () => {
      expect(isFutureDate("2099-12-31")).toBe(true);
    });

    it("retourne false pour date passée", () => {
      expect(isFutureDate("2000-01-01")).toBe(false);
    });

    it("retourne true pour aujourd'hui", () => {
      expect(isFutureDate(getTodayString())).toBe(true);
    });
  });

  describe("getTodayString", () => {
    it("retourne format YYYY-MM-DD", () => {
      expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("correspond à la date actuelle", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(getTodayString()).toBe(today);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. COMPOSANTS UI
// ═══════════════════════════════════════════════════════════════════════════

describe("Composants UI", () => {
  describe("Button", () => {
    it("affiche le texte enfant", () => {
      render(<Button>Cliquer</Button>);
      expect(screen.getByText("Cliquer")).toBeInTheDocument();
    });

    it("est désactivé quand disabled=true", () => {
      render(<Button disabled>Test</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("affiche 'Chargement...' quand isLoading=true", () => {
      render(<Button isLoading>Envoyer</Button>);
      expect(screen.getByText("Chargement...")).toBeInTheDocument();
    });

    it("est désactivé pendant le chargement", () => {
      render(<Button isLoading>Test</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("déclenche onClick au clic", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Input", () => {
    it("affiche le label si fourni", () => {
      render(<Input label="Email" id="email" />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("affiche le message d'erreur", () => {
      render(<Input error="Champ requis" />);
      expect(screen.getByText("Champ requis")).toBeInTheDocument();
    });

    it("accepte une saisie utilisateur", () => {
      render(<Input placeholder="Entrez texte" />);
      const input = screen.getByPlaceholderText("Entrez texte");
      fireEvent.change(input, { target: { value: "test" } });
      expect(input).toHaveValue("test");
    });
  });

  describe("Badge", () => {
    it("affiche le contenu", () => {
      render(<Badge>Nouveau</Badge>);
      expect(screen.getByText("Nouveau")).toBeInTheDocument();
    });

    it("applique la variante success", () => {
      const { container } = render(<Badge variant="success">OK</Badge>);
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("applique la variante danger", () => {
      const { container } = render(<Badge variant="danger">Erreur</Badge>);
      expect(container.firstChild).toHaveClass("bg-red-100");
    });
  });

  describe("Alert", () => {
    it("affiche le message", () => {
      render(<Alert>Message important</Alert>);
      expect(screen.getByText("Message important")).toBeInTheDocument();
    });

    it("a le rôle alert pour accessibilité", () => {
      render(<Alert>Test</Alert>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("applique la variante error", () => {
      const { container } = render(<Alert variant="error">Erreur</Alert>);
      expect(container.firstChild).toHaveClass("bg-red-50");
    });

    it("applique la variante success", () => {
      const { container } = render(<Alert variant="success">Succès</Alert>);
      expect(container.firstChild).toHaveClass("bg-green-50");
    });
  });
});
