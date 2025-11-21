-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exhibitions table
CREATE TABLE exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  keywords TEXT[],
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete')),
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibition content table
CREATE TABLE exhibition_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'title_suggestions', 'introduction', 'preface',
    'artist_bio', 'press_release', 'marketing_report'
  )),
  content JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posters table
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_id VARCHAR(50),
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual exhibition settings
CREATE TABLE virtual_exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_type VARCHAR(50) DEFAULT '2.5d_fixed',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_exhibitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exhibitions table
CREATE POLICY "Users can view own exhibitions" ON exhibitions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exhibitions" ON exhibitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exhibitions" ON exhibitions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exhibitions" ON exhibitions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public exhibitions are viewable" ON exhibitions
  FOR SELECT USING (is_public = true);

-- RLS Policies for exhibition_content table
CREATE POLICY "Users can manage own exhibition content" ON exhibition_content
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public exhibition content is viewable" ON exhibition_content
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- RLS Policies for artworks table
CREATE POLICY "Users can manage own artworks" ON artworks
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public artworks are viewable" ON artworks
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- RLS Policies for posters table
CREATE POLICY "Users can view own posters" ON posters
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own posters" ON posters
  FOR INSERT WITH CHECK (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own posters" ON posters
  FOR UPDATE USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own posters" ON posters
  FOR DELETE USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public posters are viewable" ON posters
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- RLS Policies for virtual_exhibitions table
CREATE POLICY "Users can manage own virtual exhibitions" ON virtual_exhibitions
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public virtual exhibitions are viewable" ON virtual_exhibitions
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_exhibition_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND NEW.public_slug IS NULL THEN
    NEW.public_slug := LOWER(
      REGEXP_REPLACE(
        SUBSTRING(NEW.title FROM 1 FOR 50),
        '[^a-zA-Z0-9가-힣]', '-', 'g'
      ) || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_exhibition_slug
  BEFORE UPDATE ON exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION generate_exhibition_slug();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exhibitions_updated_at
  BEFORE UPDATE ON exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_exhibitions_user_id ON exhibitions(user_id);
CREATE INDEX idx_exhibitions_public_slug ON exhibitions(public_slug);
CREATE INDEX idx_exhibition_content_exhibition_id ON exhibition_content(exhibition_id);
CREATE INDEX idx_artworks_exhibition_id ON artworks(exhibition_id);
CREATE INDEX idx_posters_exhibition_id ON posters(exhibition_id);
CREATE INDEX idx_virtual_exhibitions_exhibition_id ON virtual_exhibitions(exhibition_id);
