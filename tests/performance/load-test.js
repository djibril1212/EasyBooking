import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION DES TESTS DE PERFORMANCE - EasyBooking
// ═══════════════════════════════════════════════════════════════════════════

// Métriques personnalisées
const errorRate = new Rate("errors");
const pageLoadTime = new Trend("page_load_time");
const apiResponseTime = new Trend("api_response_time");
const successfulRequests = new Counter("successful_requests");
const failedRequests = new Counter("failed_requests");

// Configuration des seuils de performance
export const options = {
  // Scénarios de charge
  stages: [
    { duration: "30s", target: 10 }, // Montée progressive à 10 utilisateurs
    { duration: "1m", target: 10 },  // Maintien à 10 utilisateurs
    { duration: "30s", target: 20 }, // Montée à 20 utilisateurs
    { duration: "1m", target: 20 },  // Maintien à 20 utilisateurs
    { duration: "30s", target: 0 },  // Descente progressive
  ],

  // Seuils de performance (critères de réussite)
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% des requêtes < 2s
    http_req_failed: ["rate<0.1"],     // Moins de 10% d'erreurs
    errors: ["rate<0.1"],              // Taux d'erreur global < 10%
    page_load_time: ["p(95)<3000"],    // 95% des pages < 3s
    api_response_time: ["p(95)<1500"], // 95% des API < 1.5s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function checkResponse(response, name) {
  const success = check(response, {
    [`${name} - status 200`]: (r) => r.status === 200,
    [`${name} - response time < 2s`]: (r) => r.timings.duration < 2000,
  });

  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
    errorRate.add(1);
  }

  return success;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE PERFORMANCE - 15 CAS DE TEST
// ═══════════════════════════════════════════════════════════════════════════

export default function () {
  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: Chargement de la page d'accueil
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 1: Page d'accueil", function () {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/`);
    const loadTime = Date.now() - start;

    pageLoadTime.add(loadTime);
    checkResponse(response, "Page d'accueil");

    check(response, {
      "contient le titre EasyBooking": (r) =>
        r.body.includes("EasyBooking") || r.body.includes("réserv"),
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Chargement de la page de connexion
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 2: Page de connexion", function () {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/login`);
    const loadTime = Date.now() - start;

    pageLoadTime.add(loadTime);
    checkResponse(response, "Page de connexion");

    check(response, {
      "contient le formulaire de connexion": (r) =>
        r.body.includes("email") || r.body.includes("mot de passe"),
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Chargement de la page d'inscription
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 3: Page d'inscription", function () {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/register`);
    const loadTime = Date.now() - start;

    pageLoadTime.add(loadTime);
    checkResponse(response, "Page d'inscription");

    check(response, {
      "contient le formulaire d'inscription": (r) =>
        r.body.includes("inscription") || r.body.includes("créer"),
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: Performance de l'API des salles
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 4: API Liste des salles", function () {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/rooms`);
    const responseTime = Date.now() - start;

    apiResponseTime.add(responseTime);

    const success = check(response, {
      "API rooms - status 200 ou 401": (r) =>
        r.status === 200 || r.status === 401,
      "API rooms - response time < 1.5s": (r) => r.timings.duration < 1500,
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Performance de l'API des réservations
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 5: API Liste des réservations", function () {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/bookings`);
    const responseTime = Date.now() - start;

    apiResponseTime.add(responseTime);

    const success = check(response, {
      "API bookings - status 200 ou 401": (r) =>
        r.status === 200 || r.status === 401,
      "API bookings - response time < 1.5s": (r) => r.timings.duration < 1500,
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 6: Test de charge - Requêtes multiples simultanées
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 6: Charge multiple pages", function () {
    const responses = http.batch([
      ["GET", `${BASE_URL}/`],
      ["GET", `${BASE_URL}/login`],
      ["GET", `${BASE_URL}/register`],
    ]);

    responses.forEach((response, index) => {
      const pages = ["accueil", "login", "register"];
      check(response, {
        [`Batch ${pages[index]} - status OK`]: (r) => r.status === 200,
      });
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 7: Test de latence - Headers de réponse
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 7: Vérification des headers", function () {
    const response = http.get(`${BASE_URL}/`);

    check(response, {
      "Content-Type présent": (r) => r.headers["Content-Type"] !== undefined,
      "Temps de réponse serveur acceptable": (r) => r.timings.waiting < 1000,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 8: Test de robustesse - Page 404
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 8: Gestion des erreurs 404", function () {
    const response = http.get(`${BASE_URL}/page-inexistante-xyz`);

    check(response, {
      "404 ou redirection gérée": (r) =>
        r.status === 404 || r.status === 200 || r.status === 302,
      "Réponse rapide même en erreur": (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 9: Test de stress - Connexion API
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 9: Stress API connexion", function () {
    const payload = JSON.stringify({
      email: "test@example.com",
      password: "password123",
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);

    check(response, {
      "API login répond": (r) => r.status !== 0,
      "Temps de réponse acceptable": (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 10: Test de stress - Inscription API
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 10: Stress API inscription", function () {
    const uniqueEmail = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}@example.com`;

    const payload = JSON.stringify({
      email: uniqueEmail,
      password: "TestPassword123!",
      name: "Test User",
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = http.post(
      `${BASE_URL}/api/auth/register`,
      payload,
      params
    );

    check(response, {
      "API register répond": (r) => r.status !== 0,
      "Temps de réponse acceptable": (r) => r.timings.duration < 3000,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 11: Test de performance - Assets statiques
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 11: Chargement assets statiques", function () {
    const response = http.get(`${BASE_URL}/logo.svg`);

    check(response, {
      "Logo accessible": (r) => r.status === 200,
      "Logo chargé rapidement": (r) => r.timings.duration < 500,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 12: Test de concurrence - Sessions multiples
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 12: Concurrence multi-pages", function () {
    const pages = ["/", "/login", "/register"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];

    const response = http.get(`${BASE_URL}${randomPage}`);

    check(response, {
      "Page aléatoire accessible": (r) => r.status === 200,
      "Temps de réponse stable": (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 13: Test de bande passante - Taille des réponses
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 13: Analyse taille des réponses", function () {
    const response = http.get(`${BASE_URL}/`);

    check(response, {
      "Taille de réponse raisonnable (< 5MB)": (r) =>
        r.body.length < 5 * 1024 * 1024,
      "Réponse non vide": (r) => r.body.length > 0,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 14: Test de stabilité - Requêtes répétées
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 14: Stabilité requêtes répétées", function () {
    let allSuccess = true;

    for (let i = 0; i < 3; i++) {
      const response = http.get(`${BASE_URL}/`);
      if (response.status !== 200) {
        allSuccess = false;
      }
      sleep(0.2);
    }

    check(null, {
      "3 requêtes consécutives réussies": () => allSuccess,
    });
  });

  sleep(1);

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 15: Test de résilience - Timeout handling
  // ─────────────────────────────────────────────────────────────────────────
  group("TEST 15: Gestion des timeouts", function () {
    const response = http.get(`${BASE_URL}/`, {
      timeout: "10s",
    });

    check(response, {
      "Réponse dans le délai imparti": (r) => r.status !== 0,
      "Pas de timeout": (r) => r.timings.duration < 10000,
    });
  });

  sleep(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// RAPPORT DE FIN DE TEST
// ═══════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  const summary = {
    "tests/performance/summary.json": JSON.stringify(data, null, 2),
  };

  // Affichage console du résumé
  console.log("\n════════════════════════════════════════════════════════════");
  console.log("           RÉSUMÉ DES TESTS DE PERFORMANCE - EasyBooking");
  console.log("════════════════════════════════════════════════════════════\n");

  return summary;
}
