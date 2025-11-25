-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create exhibitions table
CREATE TABLE IF NOT EXISTS public.exhibitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  theme TEXT,
  poster_url TEXT,
  status TEXT DEFAULT 'draft',
  is_public BOOLEAN DEFAULT FALSE,
  keywords TEXT[],
  exhibition_date DATE,
  exhibition_end_date DATE,
  venue TEXT,
  location TEXT,
  artist_name TEXT,
  opening_hours TEXT,
  admission_fee TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  aspect_ratio FLOAT,
  position INTEGER,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exhibition_content table
CREATE TABLE IF NOT EXISTS public.exhibition_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'introduction', 'preface', 'artist_bio', 'press_release', etc.
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exhibition_id, content_type)
);

-- Create virtual_exhibitions table
CREATE TABLE IF NOT EXISTS public.virtual_exhibitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create curator_samples table (for RAG)
CREATE TABLE IF NOT EXISTS public.curator_samples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL, -- 'introduction', 'preface', etc.
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posters table
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibition_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curator_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exhibitions
CREATE POLICY "Users can view their own exhibitions"
  ON public.exhibitions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exhibitions"
  ON public.exhibitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exhibitions"
  ON public.exhibitions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exhibitions"
  ON public.exhibitions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for artworks
CREATE POLICY "Users can view artworks of their exhibitions"
  ON public.artworks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = artworks.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert artworks to their exhibitions"
  ON public.artworks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = artworks.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update artworks of their exhibitions"
  ON public.artworks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = artworks.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete artworks of their exhibitions"
  ON public.artworks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = artworks.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

-- RLS Policies for exhibition_content
CREATE POLICY "Users can view content of their exhibitions"
  ON public.exhibition_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = exhibition_content.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content to their exhibitions"
  ON public.exhibition_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = exhibition_content.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update content of their exhibitions"
  ON public.exhibition_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = exhibition_content.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content of their exhibitions"
  ON public.exhibition_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = exhibition_content.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

-- RLS Policies for virtual_exhibitions
CREATE POLICY "Users can view their own virtual exhibitions"
  ON public.virtual_exhibitions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own virtual exhibitions"
  ON public.virtual_exhibitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual exhibitions"
  ON public.virtual_exhibitions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own virtual exhibitions"
  ON public.virtual_exhibitions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for curator_samples (public read, admin write)
CREATE POLICY "Anyone can view curator samples"
  ON public.curator_samples FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for posters
CREATE POLICY "Users can view posters of their exhibitions"
  ON public.posters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = posters.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert posters to their exhibitions"
  ON public.posters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = posters.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update posters of their exhibitions"
  ON public.posters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = posters.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete posters of their exhibitions"
  ON public.posters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitions
      WHERE exhibitions.id = posters.exhibition_id
      AND exhibitions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exhibitions_user_id ON public.exhibitions(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_id ON public.artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_content_exhibition_id ON public.exhibition_content(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_virtual_exhibitions_user_id ON public.virtual_exhibitions(user_id);
CREATE INDEX IF NOT EXISTS idx_posters_exhibition_id ON public.posters(exhibition_id);
