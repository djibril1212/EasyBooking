/**
 * Tests Unitaires - EasyBooking
 * @description Tests des validations et utilitaires
 */

import { loginSchema, registerSchema } from "../src/lib/validations/auth";
import { bookingSchema } from "../src/lib/validations/booking";
import {
  formatTime,
  generateTimeSlots,
  isFutureDate,
  getTodayString,
} from "../src/lib/utils";

// ═══════════════════════════════════════════════════════════════════
// VALIDATIONS AUTH
// ═══════════════════════════════════════════════════════════════════

describe("loginSchema", () => {
  it("✓ accepte des identifiants valides", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("✗ rejette un email invalide", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("✓ accepte une inscription valide", () => {
    const result = registerSchema.safeParse({
      email: "new@test.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    });
    expect(result.success).toBe(true);
  });

  it("✗ rejette un mot de passe < 8 caractères", () => {
    const result = registerSchema.safeParse({
      email: "new@test.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({
      email: "new@test.com",
      password: "password123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// VALIDATIONS BOOKING
// ═══════════════════════════════════════════════════════════════════

describe("bookingSchema", () => {
  const validBooking = {
    room_id: "550e8400-e29b-41d4-a716-446655440000",
    date: "2026-02-01",
    start_time: "09:00",
    end_time: "10:00",
  };

  it("✓ accepte une réservation valide", () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it("✗ rejette un UUID invalide", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      room_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette si heure fin <= heure début", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      start_time: "10:00",
      end_time: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("✗ rejette une date vide", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      date: "",
    });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════

describe("formatTime", () => {
  it("formate 14:00:00 en 14:00", () => {
    expect(formatTime("14:00:00")).toBe("14:00");
  });

  it("formate 09:30:45 en 09:30", () => {
    expect(formatTime("09:30:45")).toBe("09:30");
  });
});

describe("generateTimeSlots", () => {
  it("génère 12 créneaux (8h-19h)", () => {
    const slots = generateTimeSlots();
    expect(slots).toHaveLength(12);
    expect(slots[0]).toBe("08:00");
    expect(slots[11]).toBe("19:00");
  });
});

describe("isFutureDate", () => {
  it("retourne true pour une date future", () => {
    expect(isFutureDate("2099-12-31")).toBe(true);
  });

  it("retourne false pour une date passée", () => {
    expect(isFutureDate("2000-01-01")).toBe(false);
  });

  it("retourne true pour aujourd'hui", () => {
    expect(isFutureDate(getTodayString())).toBe(true);
  });
});

describe("getTodayString", () => {
  it("retourne une date au format YYYY-MM-DD", () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
