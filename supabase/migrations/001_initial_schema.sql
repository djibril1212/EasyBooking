-- Migration initiale EasyBooking
-- À exécuter dans l'éditeur SQL de Supabase

-- Table rooms (salles)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipments TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table bookings (réservations)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Enable RLS (Row Level Security)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies pour rooms (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Les utilisateurs authentifiés peuvent voir les salles"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour bookings
CREATE POLICY "Les utilisateurs peuvent voir leurs propres réservations"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres réservations"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres réservations"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Données de test (seed)
INSERT INTO rooms (name, capacity, equipments, description) VALUES
  ('Salle Einstein', 10, ARRAY['vidéoprojecteur', 'tableau blanc', 'visioconférence'], 'Grande salle de réunion équipée'),
  ('Salle Newton', 6, ARRAY['tableau blanc', 'écran TV'], 'Salle moyenne pour petites équipes'),
  ('Salle Curie', 4, ARRAY['tableau blanc'], 'Petite salle pour entretiens'),
  ('Salle Tesla', 20, ARRAY['vidéoprojecteur', 'sonorisation', 'visioconférence'], 'Amphithéâtre pour présentations')
ON CONFLICT DO NOTHING;
