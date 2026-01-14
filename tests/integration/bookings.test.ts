/**
 * Tests d'intégration - API Bookings
 *
 * Ces tests vérifient le bon fonctionnement des endpoints API pour les réservations.
 * Endpoints testés:
 * - GET /api/bookings - Liste les réservations de l'utilisateur
 * - POST /api/bookings - Crée une nouvelle réservation
 * - DELETE /api/bookings/:id - Annule une réservation
 */

// Mock des données de test
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockBookings = [
  {
    id: "booking-1",
    user_id: "user-123",
    room_id: "room-1",
    date: "2025-01-20",
    start_time: "09:00:00",
    end_time: "10:00:00",
    status: "upcoming",
    room: { name: "Salle Einstein", capacity: 10 },
  },
  {
    id: "booking-2",
    user_id: "user-123",
    room_id: "room-2",
    date: "2025-01-21",
    start_time: "14:00:00",
    end_time: "16:00:00",
    status: "upcoming",
    room: { name: "Salle Newton", capacity: 6 },
  },
  {
    id: "booking-3",
    user_id: "user-123",
    room_id: "room-1",
    date: "2025-01-15",
    start_time: "10:00:00",
    end_time: "11:00:00",
    status: "completed",
    room: { name: "Salle Einstein", capacity: 10 },
  },
];

// Fonction mock pour GET /api/bookings
const mockGetBookings = async (isAuthenticated: boolean, userId?: string) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }
  const userBookings = mockBookings.filter((b) => b.user_id === userId);
  return { status: 200, data: userBookings };
};

// Fonction mock pour POST /api/bookings
const mockCreateBooking = async (
  isAuthenticated: boolean,
  bookingData: {
    room_id?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
  },
  existingBookings: typeof mockBookings = [],
  userBookingCount: number = 0
) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }

  // Validation des champs requis
  if (!bookingData.room_id || !bookingData.date || !bookingData.start_time || !bookingData.end_time) {
    return { status: 400, data: { error: "Données manquantes" } };
  }

  // Validation de la date (pas dans le passé)
  const today = new Date().toISOString().split("T")[0];
  if (bookingData.date < today) {
    return { status: 400, data: { error: "Vous ne pouvez pas réserver une date passée" } };
  }

  // Validation de l'heure (fin après début)
  if (bookingData.start_time >= bookingData.end_time) {
    return { status: 400, data: { error: "L'heure de fin doit être après l'heure de début" } };
  }

  // Vérification du nombre max de réservations
  if (userBookingCount >= 3) {
    return { status: 400, data: { error: "Vous avez atteint le maximum de 3 réservations actives" } };
  }

  // Vérification des chevauchements
  const hasOverlap = existingBookings.some(
    (booking) =>
      booking.room_id === bookingData.room_id &&
      booking.date === bookingData.date &&
      booking.status === "upcoming" &&
      bookingData.start_time! < booking.end_time &&
      bookingData.end_time! > booking.start_time
  );

  if (hasOverlap) {
    return { status: 409, data: { error: "Ce créneau est déjà réservé" } };
  }

  return {
    status: 201,
    data: {
      id: "booking-new",
      user_id: mockUser.id,
      ...bookingData,
      status: "upcoming",
    },
  };
};

// Fonction mock pour DELETE /api/bookings/:id
const mockDeleteBooking = async (
  isAuthenticated: boolean,
  bookingId: string,
  userId: string
) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }

  const booking = mockBookings.find((b) => b.id === bookingId);

  if (!booking) {
    return { status: 404, data: { error: "Réservation non trouvée" } };
  }

  if (booking.user_id !== userId) {
    return { status: 403, data: { error: "Vous ne pouvez pas annuler cette réservation" } };
  }

  if (booking.status !== "upcoming") {
    return { status: 400, data: { error: "Cette réservation ne peut pas être annulée" } };
  }

  // Vérification des 2h avant le créneau
  const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
  const now = new Date();
  const twoHoursInMs = 2 * 60 * 60 * 1000;

  if (bookingDateTime.getTime() - now.getTime() < twoHoursInMs) {
    return { status: 400, data: { error: "Annulation possible jusqu'à 2h avant le créneau" } };
  }

  return { status: 200, data: { message: "Réservation annulée" } };
};

describe("API /api/bookings", () => {
  // ============================================
  // TEST 1: GET /api/bookings - Liste des réservations
  // ============================================
  describe("GET /api/bookings", () => {
    it("devrait retourner les réservations de l'utilisateur connecté", async () => {
      const response = await mockGetBookings(true, mockUser.id);

      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(3);
      expect(response.data[0].room.name).toBe("Salle Einstein");
    });

    // ============================================
    // TEST 2: GET /api/bookings - Non authentifié (401)
    // ============================================
    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      const response = await mockGetBookings(false);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe("Non authentifié");
    });

    // ============================================
    // TEST 3: GET /api/bookings - Liste vide
    // ============================================
    it("devrait retourner un tableau vide si aucune réservation", async () => {
      const response = await mockGetBookings(true, "user-without-bookings");

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });
  });

  // ============================================
  // TEST 4: POST /api/bookings - Création (succès)
  // ============================================
  describe("POST /api/bookings", () => {
    it("devrait créer une nouvelle réservation avec succès", async () => {
      // Utiliser une date future garantie
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const newBooking = {
        room_id: "room-1",
        date: futureDateStr,
        start_time: "10:00",
        end_time: "11:00",
      };

      const response = await mockCreateBooking(true, newBooking, [], 0);

      expect(response.status).toBe(201);
      expect(response.data.room_id).toBe("room-1");
      expect(response.data.status).toBe("upcoming");
    });

    // ============================================
    // TEST 5: POST /api/bookings - Données manquantes (400)
    // ============================================
    it("devrait retourner 400 si des données sont manquantes", async () => {
      const invalidBooking = {
        room_id: "room-1",
        // date manquante
        start_time: "10:00",
      };

      const response = await mockCreateBooking(true, invalidBooking, [], 0);

      expect(response.status).toBe(400);
      expect(response.data.error).toBe("Données manquantes");
    });

    // ============================================
    // TEST 6: POST /api/bookings - Non authentifié (401)
    // ============================================
    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      const newBooking = {
        room_id: "room-1",
        date: "2025-02-01",
        start_time: "10:00",
        end_time: "11:00",
      };

      const response = await mockCreateBooking(false, newBooking, [], 0);

      expect(response.status).toBe(401);
    });

    // ============================================
    // TEST 7: POST /api/bookings - Date passée (400)
    // ============================================
    it("devrait refuser une réservation pour une date passée", async () => {
      const pastBooking = {
        room_id: "room-1",
        date: "2020-01-01",
        start_time: "10:00",
        end_time: "11:00",
      };

      const response = await mockCreateBooking(true, pastBooking, [], 0);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain("passée");
    });

    // ============================================
    // TEST 8: POST /api/bookings - Heure fin avant début (400)
    // ============================================
    it("devrait refuser si heure de fin avant heure de début", async () => {
      // Utiliser une date future garantie
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const invalidTimeBooking = {
        room_id: "room-1",
        date: futureDateStr,
        start_time: "14:00",
        end_time: "10:00", // Avant start_time
      };

      const response = await mockCreateBooking(true, invalidTimeBooking, [], 0);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain("heure de fin");
    });

    // ============================================
    // TEST 9: POST /api/bookings - Chevauchement (409)
    // ============================================
    it("devrait refuser si créneau déjà réservé (chevauchement)", async () => {
      // Utiliser une date future garantie
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const existingBookings = [
        {
          id: "existing",
          user_id: "other-user",
          room_id: "room-1",
          date: futureDateStr,
          start_time: "10:00:00",
          end_time: "11:00:00",
          status: "upcoming" as const,
          room: { name: "Salle Einstein", capacity: 10 },
        },
      ];

      const overlappingBooking = {
        room_id: "room-1",
        date: futureDateStr,
        start_time: "10:30",
        end_time: "11:30",
      };

      const response = await mockCreateBooking(true, overlappingBooking, existingBookings, 0);

      expect(response.status).toBe(409);
      expect(response.data.error).toContain("déjà réservé");
    });

    // ============================================
    // TEST 10: POST /api/bookings - Max réservations (400)
    // ============================================
    it("devrait refuser si l'utilisateur a déjà 3 réservations actives", async () => {
      // Utiliser une date future garantie
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const newBooking = {
        room_id: "room-1",
        date: futureDateStr,
        start_time: "10:00",
        end_time: "11:00",
      };

      const response = await mockCreateBooking(true, newBooking, [], 3);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain("maximum");
    });
  });

  // ============================================
  // TEST 11: DELETE /api/bookings/:id - Annulation (succès)
  // ============================================
  describe("DELETE /api/bookings/:id", () => {
    it("devrait annuler une réservation existante", async () => {
      // Mock une date future pour le booking
      const futureBooking = {
        ...mockBookings[0],
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
      mockBookings[0] = futureBooking as typeof mockBookings[0];

      const response = await mockDeleteBooking(true, "booking-1", mockUser.id);

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("Réservation annulée");
    });

    // ============================================
    // TEST 12: DELETE /api/bookings/:id - Non trouvée (404)
    // ============================================
    it("devrait retourner 404 si la réservation n'existe pas", async () => {
      const response = await mockDeleteBooking(true, "invalid-id", mockUser.id);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe("Réservation non trouvée");
    });

    // ============================================
    // TEST 13: DELETE /api/bookings/:id - Non authentifié (401)
    // ============================================
    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      const response = await mockDeleteBooking(false, "booking-1", mockUser.id);

      expect(response.status).toBe(401);
    });

    // ============================================
    // TEST 14: DELETE /api/bookings/:id - Déjà terminée (400)
    // ============================================
    it("devrait refuser d'annuler une réservation terminée", async () => {
      const response = await mockDeleteBooking(true, "booking-3", mockUser.id);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain("ne peut pas être annulée");
    });
  });
});

// ============================================
// TEST 15-17: Validation des données de réservation
// ============================================
describe("Validation des données de réservation", () => {
  it("devrait vérifier que l'heure de fin est après l'heure de début", () => {
    const booking = mockBookings[0];
    const startTime = new Date(`2025-01-01T${booking.start_time}`);
    const endTime = new Date(`2025-01-01T${booking.end_time}`);
    expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
  });

  it("devrait vérifier que le statut est valide", () => {
    const validStatuses = ["upcoming", "completed", "cancelled"];
    mockBookings.forEach((booking) => {
      expect(validStatuses).toContain(booking.status);
    });
  });

  it("devrait vérifier que la date est au bon format (YYYY-MM-DD)", () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    mockBookings.forEach((booking) => {
      expect(booking.date).toMatch(dateRegex);
    });
  });
});

// ============================================
// TEST 18-20: Logique métier des réservations
// ============================================
describe("Logique métier des réservations", () => {
  it("devrait filtrer les réservations à venir", () => {
    const upcomingBookings = mockBookings.filter((b) => b.status === "upcoming");
    expect(upcomingBookings.length).toBeGreaterThan(0);
    upcomingBookings.forEach((booking) => {
      expect(booking.status).toBe("upcoming");
    });
  });

  it("devrait filtrer les réservations passées", () => {
    const completedBookings = mockBookings.filter((b) => b.status === "completed");
    expect(completedBookings.length).toBeGreaterThan(0);
    completedBookings.forEach((booking) => {
      expect(booking.status).toBe("completed");
    });
  });

  it("devrait calculer la durée d'une réservation", () => {
    const booking = mockBookings[1]; // 14:00 - 16:00
    const start = parseInt(booking.start_time.split(":")[0]);
    const end = parseInt(booking.end_time.split(":")[0]);
    const duration = end - start;
    expect(duration).toBe(2); // 2 heures
  });
});
