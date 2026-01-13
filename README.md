# EasyBooking

Application web de réservation de salles de réunion développée dans le cadre d'un TP sur les tests logiciels.

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement de l'application](#lancement-de-lapplication)
- [Structure du projet](#structure-du-projet)
- [Architecture de la base de données](#architecture-de-la-base-de-données)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Thème et design](#thème-et-design)
- [Contribution](#contribution)
- [Licence](#licence)

## Présentation

EasyBooking est une application web moderne permettant la gestion et la réservation de salles de réunion. Développée avec Next.js 14 et Supabase, elle offre une interface intuitive et réactive pour faciliter la réservation de salles au sein d'une organisation.

Le projet a été conçu dans le cadre d'un travail pratique sur les tests logiciels, avec pour objectif de mettre en place une stratégie de tests complète couvrant les tests unitaires, d'intégration, end-to-end et de performance.

## Fonctionnalités

### Authentification
- Inscription utilisateur avec validation des données
- Connexion sécurisée avec gestion de session
- Déconnexion
- Protection des routes nécessitant une authentification

### Gestion des salles
- Consultation de la liste des salles disponibles
- Filtrage des salles par capacité
- Affichage des équipements disponibles par salle
- Vérification de la disponibilité en temps réel
- Consultation des détails d'une salle spécifique

### Système de réservation
- Réservation d'une salle pour une date et un créneau horaire
- Validation automatique de la disponibilité
- Prévention des chevauchements de réservations
- Limitation à 3 réservations actives par utilisateur

### Gestion des réservations
- Consultation de l'historique des réservations
- Distinction entre réservations passées, à venir et annulées
- Annulation d'une réservation jusqu'à 2 heures avant le créneau
- Tri des réservations par date

## Technologies utilisées

### Frontend
- **Next.js 14.2.35** - Framework React avec App Router
- **React 18.3.1** - Bibliothèque JavaScript pour interfaces utilisateur
- **TypeScript 5.9.3** - Superset typé de JavaScript
- **Tailwind CSS 3.4.19** - Framework CSS utilitaire
- **shadcn/ui** - Collection de composants UI réutilisables
- **Lucide React** - Bibliothèque d'icônes

### Backend et base de données
- **Next.js API Routes** - API serverless
- **Supabase** - Backend as a Service (PostgreSQL)
- **Supabase Auth** - Système d'authentification
- **Supabase SSR 0.8.0** - Support Server-Side Rendering

### Validation et utilitaires
- **Zod 4.3.5** - Validation de schémas TypeScript
- **clsx** - Utilitaire pour classes CSS conditionnelles
- **tailwind-merge** - Fusion intelligente de classes Tailwind
- **class-variance-authority** - Gestion des variantes de composants

### Tests (à implémenter)
- **Jest** - Framework de tests unitaires
- **React Testing Library** - Tests de composants React
- **Playwright** - Tests end-to-end
- **Supertest** - Tests d'API
- **k6** - Tests de performance

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine:

- **Node.js** version 18.x ou supérieure
- **npm** version 9.x ou supérieure (ou yarn/pnpm)
- **Git** pour le contrôle de version
- Un compte **Supabase** (gratuit) pour la base de données

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/djibril1212/EasyBooking.git
cd EasyBooking
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires listées dans le fichier `package.json`.

## Configuration

### 1. Configuration de Supabase

#### Créer un projet Supabase
1. Connectez-vous à [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé API (anon key)

#### Exécuter les migrations de base de données
1. Dans votre projet Supabase, accédez à l'éditeur SQL
2. Copiez et exécutez le contenu du fichier `supabase/migrations/001_initial_schema.sql`

Ce script créera les tables nécessaires:
- `profiles` - Profils utilisateurs
- `rooms` - Salles de réunion
- `bookings` - Réservations

### 2. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```bash
cp .env.example .env.local
```

Ajoutez les variables suivantes dans le fichier `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Optionnel - pour les tests
DATABASE_URL=votre_database_url_supabase
```

Remplacez les valeurs par celles de votre projet Supabase.

### 3. Données de test (optionnel)

Pour faciliter les tests, vous pouvez insérer des données de démonstration:

```sql
-- Insérer des salles de test
INSERT INTO rooms (name, capacity, equipments, description) VALUES
  ('Salle Einstein', 10, ARRAY['vidéoprojecteur', 'tableau blanc', 'visioconférence'], 'Grande salle de réunion équipée'),
  ('Salle Newton', 6, ARRAY['tableau blanc', 'écran TV'], 'Salle moyenne pour petites équipes'),
  ('Salle Curie', 4, ARRAY['tableau blanc'], 'Petite salle pour entretiens'),
  ('Salle Tesla', 20, ARRAY['vidéoprojecteur', 'sonorisation', 'visioconférence'], 'Amphithéâtre pour présentations');
```

## Lancement de l'application

### Mode développement

```bash
npm run dev
```

L'application sera accessible à l'adresse: [http://localhost:3000](http://localhost:3000)

### Mode production

```bash
# Construire l'application
npm run build

# Lancer le serveur de production
npm start
```

### Vérification du code

```bash
npm run lint
```

## Structure du projet

```
EasyBooking/
├── src/
│   ├── app/                          # Application Next.js (App Router)
│   │   ├── (auth)/                   # Routes d'authentification
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Page de connexion
│   │   │   └── register/
│   │   │       └── page.tsx         # Page d'inscription
│   │   ├── (dashboard)/              # Routes protégées (dashboard)
│   │   │   ├── layout.tsx           # Layout du dashboard
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx         # Liste des réservations
│   │   │   │   └── BookingCard.tsx  # Composant carte réservation
│   │   │   └── rooms/
│   │   │       ├── page.tsx         # Liste des salles
│   │   │       ├── RoomCard.tsx     # Composant carte salle
│   │   │       └── BookingModal.tsx # Modal de réservation
│   │   ├── api/                      # API Routes Next.js
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts     # Endpoint connexion
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts     # Endpoint déconnexion
│   │   │   │   └── register/
│   │   │   │       └── route.ts     # Endpoint inscription
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts         # CRUD réservations
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # Opérations sur réservation
│   │   │   └── rooms/
│   │   │       ├── route.ts         # Liste des salles
│   │   │       └── [id]/
│   │   │           ├── route.ts     # Détails d'une salle
│   │   │           └── availability/
│   │   │               └── route.ts # Disponibilité salle
│   │   ├── globals.css              # Styles globaux
│   │   ├── layout.tsx               # Layout principal
│   │   └── page.tsx                 # Page d'accueil
│   ├── components/                   # Composants React
│   │   ├── forms/                   # Composants formulaires
│   │   ├── layout/
│   │   │   ├── Header.tsx           # En-tête de page
│   │   │   └── Footer.tsx           # Pied de page
│   │   └── ui/                      # Composants UI shadcn
│   │       ├── Alert.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── hooks/                        # Hooks React personnalisés
│   ├── lib/                          # Bibliothèques et utilitaires
│   │   ├── supabase/
│   │   │   ├── client.ts            # Client Supabase (côté client)
│   │   │   ├── server.ts            # Client Supabase (côté serveur)
│   │   │   └── middleware.ts        # Middleware Supabase
│   │   ├── validations/
│   │   │   ├── auth.ts              # Schémas validation auth
│   │   │   └── booking.ts           # Schémas validation réservations
│   │   └── utils.ts                 # Fonctions utilitaires
│   └── types/
│       └── index.ts                 # Types TypeScript globaux
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Migration initiale BDD
├── tests/                            # Tests (à implémenter)
│   ├── unit/                        # Tests unitaires
│   ├── integration/                 # Tests d'intégration
│   ├── e2e/                         # Tests end-to-end
│   └── performance/                 # Tests de performance
├── docs/                             # Documentation
│   ├── PRD.md                       # Product Requirements Document
│   ├── INTEGRATION_LOGO.md          # Guide intégration logo
│   └── THEME_BLUE_UPDATE.md         # Documentation thème
├── public/                           # Fichiers statiques
├── .env.local                       # Variables d'environnement (non versionné)
├── next.config.mjs                  # Configuration Next.js
├── tailwind.config.js               # Configuration Tailwind CSS
├── tsconfig.json                    # Configuration TypeScript
└── package.json                     # Dépendances du projet
```

## Architecture de la base de données

### Schéma des tables

#### Table `profiles`
Stocke les informations supplémentaires des utilisateurs.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `rooms`
Contient les informations sur les salles disponibles.

```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipments TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Champs:
- `id` - Identifiant unique de la salle
- `name` - Nom de la salle
- `capacity` - Capacité maximale (nombre de personnes)
- `equipments` - Liste des équipements disponibles
- `description` - Description de la salle
- `image_url` - URL de l'image de la salle (optionnel)
- `created_at` - Date de création de l'enregistrement

#### Table `bookings`
Gère les réservations de salles.

```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  room_id UUID REFERENCES rooms(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_overlap EXCLUDE USING gist (
    room_id WITH =,
    date WITH =,
    tsrange((date + start_time)::timestamp, (date + end_time)::timestamp) WITH &&
  ) WHERE (status = 'upcoming')
);
```

Champs:
- `id` - Identifiant unique de la réservation
- `user_id` - Référence vers l'utilisateur
- `room_id` - Référence vers la salle
- `date` - Date de la réservation
- `start_time` - Heure de début
- `end_time` - Heure de fin
- `status` - Statut de la réservation (upcoming, completed, cancelled)
- `created_at` - Date de création de la réservation

Contraintes:
- `no_overlap` - Empêche les chevauchements de réservations pour une même salle

### Relations entre tables
- Un utilisateur (`auth.users`) peut avoir plusieurs réservations (`bookings`)
- Une salle (`rooms`) peut avoir plusieurs réservations (`bookings`)
- Une réservation appartient à un seul utilisateur et une seule salle

## API Endpoints

### Authentification

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Réponse succès (201):**
```json
{
  "message": "Utilisateur créé avec succès"
}
```

#### POST `/api/auth/login`
Connexion d'un utilisateur existant.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse succès (200):**
```json
{
  "message": "Connexion réussie"
}
```

#### POST `/api/auth/logout`
Déconnexion de l'utilisateur actuel.

**Réponse succès (200):**
```json
{
  "message": "Déconnexion réussie"
}
```

### Salles

#### GET `/api/rooms`
Récupère la liste de toutes les salles.

**Query params (optionnel):**
- `capacity` - Filtrer par capacité minimale

**Réponse succès (200):**
```json
[
  {
    "id": "uuid",
    "name": "Salle Einstein",
    "capacity": 10,
    "equipments": ["vidéoprojecteur", "tableau blanc"],
    "description": "Grande salle de réunion",
    "image_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/api/rooms/[id]`
Récupère les détails d'une salle spécifique.

**Réponse succès (200):**
```json
{
  "id": "uuid",
  "name": "Salle Einstein",
  "capacity": 10,
  "equipments": ["vidéoprojecteur", "tableau blanc"],
  "description": "Grande salle de réunion",
  "image_url": null,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/rooms/[id]/availability`
Vérifie la disponibilité d'une salle pour une date donnée.

**Query params:**
- `date` - Date au format YYYY-MM-DD

**Réponse succès (200):**
```json
{
  "available": true,
  "bookedSlots": [
    {
      "start_time": "09:00:00",
      "end_time": "10:00:00"
    }
  ]
}
```

### Réservations

#### GET `/api/bookings`
Récupère les réservations de l'utilisateur connecté.

**Réponse succès (200):**
```json
[
  {
    "id": "uuid",
    "room": {
      "id": "uuid",
      "name": "Salle Einstein",
      "capacity": 10
    },
    "date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "upcoming",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST `/api/bookings`
Crée une nouvelle réservation.

**Body:**
```json
{
  "room_id": "uuid",
  "date": "2024-01-15",
  "start_time": "09:00:00",
  "end_time": "10:00:00"
}
```

**Réponse succès (201):**
```json
{
  "message": "Réservation créée avec succès",
  "booking": {
    "id": "uuid",
    "room_id": "uuid",
    "date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "upcoming"
  }
}
```

#### DELETE `/api/bookings/[id]`
Annule une réservation existante.

**Réponse succès (200):**
```json
{
  "message": "Réservation annulée avec succès"
}
```

### Codes d'erreur

- **400** - Requête invalide (validation échouée)
- **401** - Non authentifié
- **403** - Non autorisé
- **404** - Ressource non trouvée
- **409** - Conflit (ex: salle déjà réservée)
- **500** - Erreur serveur

## Tests

### Structure des tests

Le projet intègre une stratégie de tests complète organisée en quatre catégories:

#### Tests unitaires
Localisation: `tests/unit/`

Couvrent:
- Composants React individuels
- Fonctions utilitaires
- Hooks personnalisés
- Schémas de validation Zod

Framework: Jest + React Testing Library

```bash
npm run test:unit
```

#### Tests d'intégration
Localisation: `tests/integration/`

Couvrent:
- API Routes Next.js
- Interactions avec la base de données
- Flux d'authentification complets

Framework: Jest + Supertest

```bash
npm run test:integration
```

#### Tests end-to-end
Localisation: `tests/e2e/`

Couvrent:
- Parcours utilisateur complets
- Scénarios de réservation
- Gestion des erreurs dans l'interface

Framework: Playwright

```bash
npm run test:e2e
```

#### Tests de performance
Localisation: `tests/performance/`

Couvrent:
- Charge sur les API
- Temps de réponse
- Comportement sous stress

Framework: k6

```bash
npm run test:perf
```

### Objectifs de couverture

| Type de test | Objectif de couverture |
|--------------|------------------------|
| Unitaires | Plus de 80% |
| Intégration | Routes API critiques |
| E2E | 5 scénarios principaux |
| Performance | 100 utilisateurs simultanés |

### Exécuter tous les tests

```bash
npm run test
```

