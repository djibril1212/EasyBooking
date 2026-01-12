# EasyBooking

Application de réservation de salles développée avec Next.js et Supabase dans le cadre d'un TP Tests Logiciels.

## 📋 Description

EasyBooking est une application web moderne permettant la gestion et la réservation de salles. Elle offre une interface utilisateur intuitive pour consulter les disponibilités et effectuer des réservations en ligne.

## 🚀 Technologies utilisées

- **Next.js 14** - Framework React pour le développement web
- **TypeScript** - Pour un code type-safe
- **Supabase** - Backend-as-a-Service (authentification et base de données)
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Composants UI accessibles
- **Lucide React** - Bibliothèque d'icônes

## 📦 Installation

1. Cloner le repository :
```bash
git clone https://github.com/djibril1212/EasyBooking.git
cd EasyBooking
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.local.example .env.local
```

Éditer le fichier `.env.local` et renseigner vos informations Supabase :
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🛠️ Commandes disponibles

```bash
# Lancer le serveur de développement
npm run dev

# Créer un build de production
npm run build

# Lancer le serveur de production
npm run start

# Vérifier le code avec ESLint
npm run lint
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## 📁 Structure du projet

```
EasyBooking/
├── src/
│   ├── app/          # Pages et routes Next.js
│   ├── components/   # Composants React réutilisables
│   ├── lib/          # Utilitaires et configurations
│   ├── types/        # Définitions TypeScript
│   └── middleware.ts # Middleware Next.js
├── supabase/         # Configuration Supabase
├── public/           # Fichiers statiques
└── ...
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

ISC
