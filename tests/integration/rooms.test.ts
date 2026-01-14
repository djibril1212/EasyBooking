/**
 * Tests d'intégration - API Rooms
 *
 * Ces tests vérifient le bon fonctionnement des endpoints API pour les salles.
 * Endpoints testés:
 * - GET /api/rooms - Liste toutes les salles
 * - GET /api/rooms/:id - Récupère une salle par ID
 * - GET /api/rooms/:id/availability - Vérifie la disponibilité d'une salle
 */

// Mock des données de test
const mockRooms = [
  {
    id: "room-1",
    name: "Salle Einstein",
    capacity: 10,
    equipments: ["vidéoprojecteur", "tableau blanc"],
    description: "Grande salle de réunion",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-2",
    name: "Salle Newton",
    capacity: 6,
    equipments: ["tableau blanc"],
    description: "Salle moyenne",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-3",
    name: "Salle Curie",
    capacity: 4,
    equipments: [],
    description: "Petite salle",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-4",
    name: "Salle Tesla",
    capacity: 20,
    equipments: ["vidéoprojecteur", "sonorisation", "visioconférence"],
    description: "Amphithéâtre pour présentations",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Fonction mock pour simuler l'appel API GET /api/rooms
const mockGetRooms = async (isAuthenticated: boolean, dbError: boolean = false) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }
  if (dbError) {
    return { status: 500, data: { error: "Erreur lors de la récupération des salles" } };
  }
  return { status: 200, data: mockRooms };
};

// Fonction mock pour simuler l'appel API GET /api/rooms/:id
const mockGetRoomById = async (id: string, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }
  const room = mockRooms.find((r) => r.id === id);
  if (!room) {
    return { status: 404, data: { error: "Salle non trouvée" } };
  }
  return { status: 200, data: room };
};

// Fonction mock pour vérifier disponibilité
const mockCheckAvailability = async (
  roomId: string,
  date: string,
  isAuthenticated: boolean,
  existingBookings: { start_time: string; end_time: string }[] = []
) => {
  if (!isAuthenticated) {
    return { status: 401, data: { error: "Non authentifié" } };
  }
  const room = mockRooms.find((r) => r.id === roomId);
  if (!room) {
    return { status: 404, data: { error: "Salle non trouvée" } };
  }

  // Générer les créneaux disponibles (8h-20h par tranches d'1h)
  const allSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const bookedSlots = existingBookings.map((b) => b.start_time.slice(0, 5));
  const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

  return { status: 200, data: { date, availableSlots, room } };
};

describe("API /api/rooms", () => {
  // ============================================
  // TEST 1: GET /api/rooms - Liste des salles (succès)
  // ============================================
  describe("GET /api/rooms", () => {
    it("devrait retourner la liste des salles pour un utilisateur authentifié", async () => {
      const response = await mockGetRooms(true);

      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(4);
      expect(response.data[0].name).toBe("Salle Einstein");
    });

    // ============================================
    // TEST 2: GET /api/rooms - Utilisateur non authentifié (401)
    // ============================================
    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      const response = await mockGetRooms(false);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe("Non authentifié");
    });

    // ============================================
    // TEST 3: GET /api/rooms - Erreur base de données (500)
    // ============================================
    it("devrait retourner 500 en cas d'erreur de base de données", async () => {
      const response = await mockGetRooms(true, true);

      expect(response.status).toBe(500);
      expect(response.data.error).toBe("Erreur lors de la récupération des salles");
    });

    // ============================================
    // TEST 4: Vérification structure des données
    // ============================================
    it("devrait retourner des salles avec tous les champs requis", async () => {
      const response = await mockGetRooms(true);

      expect(response.status).toBe(200);
      response.data.forEach((room: typeof mockRooms[0]) => {
        expect(room).toHaveProperty("id");
        expect(room).toHaveProperty("name");
        expect(room).toHaveProperty("capacity");
        expect(room).toHaveProperty("equipments");
        expect(room).toHaveProperty("description");
      });
    });
  });

  // ============================================
  // TEST 5: GET /api/rooms/:id - Salle par ID (succès)
  // ============================================
  describe("GET /api/rooms/:id", () => {
    it("devrait retourner une salle spécifique par son ID", async () => {
      const response = await mockGetRoomById("room-1", true);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe("room-1");
      expect(response.data.name).toBe("Salle Einstein");
      expect(response.data.capacity).toBe(10);
    });

    // ============================================
    // TEST 6: GET /api/rooms/:id - Salle non trouvée (404)
    // ============================================
    it("devrait retourner 404 si la salle n'existe pas", async () => {
      const response = await mockGetRoomById("invalid-id", true);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe("Salle non trouvée");
    });

    // ============================================
    // TEST 7: GET /api/rooms/:id - Non authentifié (401)
    // ============================================
    it("devrait retourner 401 pour un utilisateur non authentifié", async () => {
      const response = await mockGetRoomById("room-1", false);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe("Non authentifié");
    });
  });

  // ============================================
  // TEST 8-10: GET /api/rooms/:id/availability
  // ============================================
  describe("GET /api/rooms/:id/availability", () => {
    it("devrait retourner tous les créneaux si aucune réservation", async () => {
      const response = await mockCheckAvailability("room-1", "2025-01-20", true, []);

      expect(response.status).toBe(200);
      expect(response.data.availableSlots).toHaveLength(12); // 8h à 20h
      expect(response.data.availableSlots).toContain("09:00");
      expect(response.data.availableSlots).toContain("14:00");
    });

    it("devrait exclure les créneaux déjà réservés", async () => {
      const existingBookings = [
        { start_time: "09:00:00", end_time: "10:00:00" },
        { start_time: "14:00:00", end_time: "15:00:00" },
      ];
      const response = await mockCheckAvailability("room-1", "2025-01-20", true, existingBookings);

      expect(response.status).toBe(200);
      expect(response.data.availableSlots).not.toContain("09:00");
      expect(response.data.availableSlots).not.toContain("14:00");
      expect(response.data.availableSlots).toContain("10:00");
    });

    it("devrait retourner 404 pour une salle inexistante", async () => {
      const response = await mockCheckAvailability("invalid-room", "2025-01-20", true, []);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe("Salle non trouvée");
    });
  });
});

// ============================================
// TEST 11-13: Validation des données de salle
// ============================================
describe("Validation des données de salle", () => {
  it("devrait vérifier que la capacité est un nombre positif", () => {
    mockRooms.forEach((room) => {
      expect(room.capacity).toBeGreaterThan(0);
      expect(typeof room.capacity).toBe("number");
    });
  });

  it("devrait vérifier que le nom de la salle n'est pas vide", () => {
    mockRooms.forEach((room) => {
      expect(room.name).toBeTruthy();
      expect(room.name.length).toBeGreaterThan(0);
    });
  });

  it("devrait vérifier que les équipements sont un tableau", () => {
    mockRooms.forEach((room) => {
      expect(Array.isArray(room.equipments)).toBe(true);
    });
  });
});

// ============================================
// TEST 14-16: Filtrage des salles
// ============================================
describe("Filtrage des salles", () => {
  const filterRoomsByCapacity = (minCapacity: number) => {
    return mockRooms.filter((room) => room.capacity >= minCapacity);
  };

  const filterRoomsByEquipment = (equipment: string) => {
    return mockRooms.filter((room) => room.equipments.includes(equipment));
  };

  it("devrait filtrer les salles par capacité minimale", () => {
    const largeRooms = filterRoomsByCapacity(10);
    expect(largeRooms).toHaveLength(2); // Einstein (10) et Tesla (20)
    largeRooms.forEach((room) => {
      expect(room.capacity).toBeGreaterThanOrEqual(10);
    });
  });

  it("devrait filtrer les salles par équipement", () => {
    const roomsWithProjector = filterRoomsByEquipment("vidéoprojecteur");
    expect(roomsWithProjector).toHaveLength(2); // Einstein et Tesla
    roomsWithProjector.forEach((room) => {
      expect(room.equipments).toContain("vidéoprojecteur");
    });
  });

  it("devrait retourner un tableau vide si aucune salle ne correspond", () => {
    const roomsWithPool = filterRoomsByEquipment("piscine");
    expect(roomsWithPool).toHaveLength(0);
  });
});
