# PRD - EasyBooking

## 1. Présentation du Projet

### 1.1 Contexte
EasyBooking est une application web de réservation de salles développée dans le cadre d'un TP scolaire sur les tests logiciels. L'objectif est de créer une application fonctionnelle et de mettre en place une stratégie de tests complète.

### 1.2 Objectif
Permettre aux utilisateurs de réserver des salles de réunion via une interface web simple et intuitive.

### 1.3 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router) |
| Backend/API | Next.js API Routes |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Styling | Tailwind CSS |
| Tests Unitaires | Jest + React Testing Library |
| Tests E2E | Playwright |
| Tests API | Supertest |
| Tests Performance | k6 |

---

## 2. Fonctionnalités

### 2.1 F1 - Inscription (Créer un compte)

**Description:** Un visiteur peut créer un compte utilisateur.

**Critères d'acceptation:**
- [ ] Formulaire avec : email, mot de passe, confirmation mot de passe
- [ ] Validation email (format valide, unicité)
- [ ] Validation mot de passe (min 8 caractères)
- [ ] Message de confirmation après inscription
- [ ] Redirection vers la page de connexion

**Règles métier:**
- Email unique dans le système
- Mot de passe hashé en base de données

---

### 2.2 F2 - Connexion

**Description:** Un utilisateur inscrit peut se connecter à son compte.

**Critères d'acceptation:**
- [ ] Formulaire avec : email, mot de passe
- [ ] Message d'erreur si identifiants incorrects
- [ ] Redirection vers le dashboard après connexion réussie
- [ ] Session persistante (cookie/token)

**Règles métier:**
- Maximum 5 tentatives de connexion échouées par heure
- Session expire après 24h d'inactivité

---

### 2.3 F3 - Consulter les salles disponibles

**Description:** Un utilisateur connecté peut voir la liste des salles.

**Critères d'acceptation:**
- [ ] Liste des salles avec : nom, capacité, équipements
- [ ] Filtre par capacité
- [ ] Filtre par date/créneau pour voir disponibilité
- [ ] Indicateur visuel de disponibilité (vert/rouge)

**Données d'une salle:**
```
- id: UUID
- nom: string
- capacité: number
- équipements: string[] (vidéoprojecteur, tableau blanc, visio...)
- description: string
- image_url: string (optionnel)
```

---

### 2.4 F4 - Réserver une salle

**Description:** Un utilisateur peut réserver une salle disponible.

**Critères d'acceptation:**
- [ ] Sélection de la date
- [ ] Sélection du créneau horaire (par tranches de 1h, 8h-20h)
- [ ] Vérification de disponibilité en temps réel
- [ ] Confirmation de réservation
- [ ] Email de confirmation (optionnel)

**Règles métier:**
- Pas de chevauchement de réservations
- Réservation possible uniquement pour des dates futures
- Maximum 3 réservations actives par utilisateur
- Annulation possible jusqu'à 2h avant le créneau

---

### 2.5 F5 - Consulter ses réservations

**Description:** Un utilisateur peut voir l'historique de ses réservations.

**Critères d'acceptation:**
- [ ] Liste des réservations avec : salle, date, créneau, statut
- [ ] Tri par date (plus récente en premier)
- [ ] Distinction réservations passées/futures
- [ ] Possibilité d'annuler une réservation future

**Statuts possibles:**
- `upcoming` : à venir
- `completed` : passée
- `cancelled` : annulée

---

## 3. Architecture

### 3.1 Structure du Projet

```
EasyBooking/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Routes authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Routes protégées
│   │   │   ├── rooms/
│   │   │   ├── bookings/
│   │   │   └── page.tsx
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── rooms/
│   │   │   └── bookings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants UI réutilisables
│   │   ├── forms/            # Formulaires
│   │   └── layout/           # Header, Footer, etc.
│   ├── lib/                  # Utilitaires
│   │   ├── supabase/         # Client Supabase
│   │   ├── validations/      # Schémas Zod
│   │   └── utils.ts
│   ├── hooks/                # Custom hooks
│   └── types/                # Types TypeScript
├── tests/
│   ├── unit/                 # Tests unitaires
│   ├── integration/          # Tests d'intégration
│   ├── e2e/                  # Tests end-to-end
│   └── performance/          # Tests de performance
├── docs/
│   ├── plan-de-test.md
│   ├── fiches-de-test.md
│   └── rapport-qualite.md
└── supabase/
    └── migrations/           # Scripts SQL
```

### 3.2 Schéma Base de Données

```sql
-- Table users (gérée par Supabase Auth)
-- Supabase crée automatiquement auth.users

-- Table profiles (infos supplémentaires utilisateur)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table rooms (salles)
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipments TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table bookings (réservations)
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  room_id UUID REFERENCES rooms(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte pour éviter les chevauchements
  CONSTRAINT no_overlap EXCLUDE USING gist (
    room_id WITH =,
    date WITH =,
    tsrange(
      (date + start_time)::timestamp,
      (date + end_time)::timestamp
    ) WITH &&
  ) WHERE (status = 'upcoming')
);
```

### 3.3 API Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| POST | `/api/auth/logout` | Déconnexion | Oui |
| GET | `/api/rooms` | Liste des salles | Oui |
| GET | `/api/rooms/:id` | Détail d'une salle | Oui |
| GET | `/api/rooms/:id/availability` | Disponibilité | Oui |
| POST | `/api/bookings` | Créer réservation | Oui |
| GET | `/api/bookings` | Mes réservations | Oui |
| DELETE | `/api/bookings/:id` | Annuler réservation | Oui |

---

## 4. Stratégie de Tests

### 4.1 Types de Tests

#### Tests Unitaires (Jest + RTL)
- Composants React isolés
- Fonctions utilitaires
- Validations de formulaires
- Hooks personnalisés

#### Tests d'Intégration (Jest + Supertest)
- API Routes
- Interactions avec Supabase (mock)
- Flux d'authentification

#### Tests E2E (Playwright)
- Parcours utilisateur complets
- Inscription → Connexion → Réservation
- Gestion des erreurs UI

#### Tests de Performance (k6)
- Charge sur l'API
- Temps de réponse
- Comportement sous stress

### 4.2 Couverture Cible

| Type | Couverture Cible |
|------|------------------|
| Unitaires | > 80% |
| Intégration | Routes API critiques |
| E2E | 5 scénarios principaux |
| Performance | 100 utilisateurs simultanés |

---

## 5. Livrables du TP

### 5.1 Documents à Produire

1. **Plan de Test** (`docs/plan-de-test.md`)
   - Stratégie de test
   - Périmètre
   - Environnements
   - Critères d'entrée/sortie

2. **Fiches de Test** (`docs/fiches-de-test.md`)
   - Cas de test détaillés
   - Résultats d'exécution
   - Captures d'écran

3. **Code des Tests** (répertoire `tests/`)
   - Tests unitaires
   - Tests d'intégration
   - Tests E2E
   - Tests de performance

4. **Rapport Qualité** (`docs/rapport-qualite.md`)
   - Synthèse des résultats
   - Métriques de couverture
   - Anomalies détectées
   - Recommandations

---

## 6. Données de Test

### 6.1 Salles (Seed Data)

```json
[
  {
    "name": "Salle Einstein",
    "capacity": 10,
    "equipments": ["vidéoprojecteur", "tableau blanc", "visioconférence"],
    "description": "Grande salle de réunion équipée"
  },
  {
    "name": "Salle Newton",
    "capacity": 6,
    "equipments": ["tableau blanc", "écran TV"],
    "description": "Salle moyenne pour petites équipes"
  },
  {
    "name": "Salle Curie",
    "capacity": 4,
    "equipments": ["tableau blanc"],
    "description": "Petite salle pour entretiens"
  },
  {
    "name": "Salle Tesla",
    "capacity": 20,
    "equipments": ["vidéoprojecteur", "sonorisation", "visioconférence"],
    "description": "Amphithéâtre pour présentations"
  }
]
```

### 6.2 Utilisateurs de Test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| test@example.com | Test1234! | Utilisateur standard |
| admin@example.com | Admin1234! | Admin (optionnel) |

---

## 7. Critères de Succès

- [ ] Application fonctionnelle avec les 5 fonctionnalités
- [ ] Plan de test documenté
- [ ] Minimum 20 cas de test écrits
- [ ] Tests automatisés exécutables
- [ ] Rapport de qualité avec métriques
- [ ] Code versionné sur Git

---

## 8. Prochaines Étapes

1. **Setup du projet Next.js**
2. **Configuration Supabase**
3. **Développement des fonctionnalités**
4. **Écriture des tests en parallèle**
5. **Documentation**
6. **Préparation présentation orale**
