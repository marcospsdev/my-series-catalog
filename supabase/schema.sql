-- ================================================
-- MY SERIES CATALOG — Schema Supabase
-- Execute no SQL Editor do painel do Supabase
-- ================================================

-- ────────────────────────────────────────────────
-- SERIES
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS series (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  cover_url  TEXT,
  favorite   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all series" ON series FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE series;

-- ────────────────────────────────────────────────
-- GROUPS (Facções / Clãs / Tripulações)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serie_id   UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  image_url  TEXT,
  alignment  TEXT NOT NULL CHECK (alignment IN ('hero', 'villain', 'neutral')) DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read groups"  ON groups FOR SELECT USING (true);
CREATE POLICY "Auth insert groups"  ON groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update groups"  ON groups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete groups"  ON groups FOR DELETE USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE groups;

-- ────────────────────────────────────────────────
-- CHARACTERS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS characters (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serie_id         UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  age              INT,
  gender           TEXT,
  description      TEXT,
  images           TEXT[] NOT NULL DEFAULT '{}',
  alignment        TEXT NOT NULL CHECK (alignment IN ('hero', 'villain', 'neutral')) DEFAULT 'neutral',
  status           TEXT NOT NULL CHECK (status IN ('alive', 'dead', 'unknown')) DEFAULT 'alive',
  first_appearance TEXT,
  nickname         TEXT,
  role             TEXT,
  favorite         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read characters"  ON characters FOR SELECT USING (true);
CREATE POLICY "Auth insert characters"  ON characters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update characters"  ON characters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete characters"  ON characters FOR DELETE USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE characters;

-- ────────────────────────────────────────────────
-- CHARACTER_GROUPS (Tabela Pivô N:N)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS character_groups (
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (character_id, group_id)
);

ALTER TABLE character_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read character_groups"  ON character_groups FOR SELECT USING (true);
CREATE POLICY "Auth insert character_groups"  ON character_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth delete character_groups"  ON character_groups FOR DELETE USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────
-- STORAGE BUCKETS
-- Execute via painel: Storage > New bucket
-- Ou via SQL abaixo (requer extensão storage):
-- ────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('characters', 'characters', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('groups', 'groups', true);

-- Policies de storage (após criar os buckets):
-- CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
-- CREATE POLICY "Auth upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
-- (Repita para 'characters' e 'groups')

-- ────────────────────────────────────────────────
-- ÍNDICES para performance
-- ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_groups_serie_id     ON groups(serie_id);
CREATE INDEX IF NOT EXISTS idx_characters_serie_id ON characters(serie_id);
CREATE INDEX IF NOT EXISTS idx_characters_favorite ON characters(favorite) WHERE favorite = true;
CREATE INDEX IF NOT EXISTS idx_series_favorite     ON series(favorite) WHERE favorite = true;
