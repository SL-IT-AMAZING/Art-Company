-- =====================================================
-- Art Company 전체 스키마
-- 새 Supabase 프로젝트에서 이 파일 전체를 실행하세요
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Exhibitions table (메인 전시 테이블)
CREATE TABLE exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  keywords TEXT[],
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete')),
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  view_count INT DEFAULT 0,

  -- 전시 메타데이터
  exhibition_date DATE,
  exhibition_end_date DATE,
  venue VARCHAR(500),
  location VARCHAR(500),
  artist_name VARCHAR(500),
  opening_hours VARCHAR(200),
  admission_fee VARCHAR(200),
  contact_info VARCHAR(500),

  -- AI 큐레이터 대화 저장
  curator_conversation JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibition content table (전시 콘텐츠)
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

-- Artworks table (작품)
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  image_width INT,
  image_height INT,
  aspect_ratio FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posters table (포스터)
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_id VARCHAR(50),
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual exhibition settings (가상 전시)
CREATE TABLE virtual_exhibitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  template_type VARCHAR(50) DEFAULT '2.5d_fixed',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curator samples for RAG (RAG용 큐레이터 샘플)
CREATE TABLE curator_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (
    content_type IN (
      'introduction',
      'preface',
      'artist_bio',
      'artwork_description',
      'press_release',
      'marketing_report'
    )
  ),
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX idx_exhibitions_user_id ON exhibitions(user_id);
CREATE INDEX idx_exhibitions_public_slug ON exhibitions(public_slug);
CREATE INDEX idx_exhibition_content_exhibition_id ON exhibition_content(exhibition_id);
CREATE INDEX idx_artworks_exhibition_id ON artworks(exhibition_id);
CREATE INDEX idx_posters_exhibition_id ON posters(exhibition_id);
CREATE INDEX idx_virtual_exhibitions_exhibition_id ON virtual_exhibitions(exhibition_id);

CREATE INDEX curator_samples_embedding_idx
ON curator_samples
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX curator_samples_content_type_idx
ON curator_samples(content_type);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE curator_samples ENABLE ROW LEVEL SECURITY;

-- Exhibitions policies
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

-- Exhibition content policies
CREATE POLICY "Users can manage own exhibition content" ON exhibition_content
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public exhibition content is viewable" ON exhibition_content
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- Artworks policies
CREATE POLICY "Users can manage own artworks" ON artworks
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public artworks are viewable" ON artworks
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- Posters policies
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

-- Virtual exhibitions policies
CREATE POLICY "Users can manage own virtual exhibitions" ON virtual_exhibitions
  FOR ALL USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE user_id = auth.uid())
  );

CREATE POLICY "Public virtual exhibitions are viewable" ON virtual_exhibitions
  FOR SELECT USING (
    exhibition_id IN (SELECT id FROM exhibitions WHERE is_public = true)
  );

-- Curator samples policies
CREATE POLICY "Allow authenticated read access" ON curator_samples
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access" ON curator_samples
  FOR ALL TO service_role USING (true);

-- =====================================================
-- 4. FUNCTIONS & TRIGGERS
-- =====================================================

-- Generate unique slug for public exhibitions
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

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_curator_samples(
  query_embedding vector(1536),
  match_content_type text,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  content text,
  content_type varchar(50),
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    curator_samples.id,
    curator_samples.content,
    curator_samples.content_type,
    curator_samples.metadata,
    1 - (curator_samples.embedding <=> query_embedding) AS similarity
  FROM curator_samples
  WHERE curator_samples.content_type = match_content_type
    AND 1 - (curator_samples.embedding <=> query_embedding) > match_threshold
  ORDER BY curator_samples.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- 5. SAMPLE DATA
-- =====================================================

INSERT INTO curator_samples (content, content_type, metadata) VALUES
(
  '이번 전시는 현대 사회의 복잡한 감정을 추상적인 형태와 색채로 표현한 작가의 최근 작업을 선보입니다. 작가는 일상의 순간들을 포착하여 캔버스 위에 재구성하며, 관람객들에게 자신만의 감정을 투영할 수 있는 공간을 제공합니다.',
  'introduction',
  '{"author": "김큐레이터", "year": "2024"}'::jsonb
),
(
  '작가의 작업은 개인적 경험과 보편적 감정 사이의 경계를 탐구합니다. 추상적 형태를 통해 구체적인 감정을 전달하려는 시도는 역설적이지만, 바로 그 역설 속에서 우리는 깊은 공감을 경험하게 됩니다. 이번 전시가 현대인의 복잡한 내면 풍경을 이해하는 계기가 되기를 바랍니다.',
  'preface',
  '{"author": "이큐레이터", "exhibition": "감정의 스펙트럼"}'::jsonb
),
(
  '작가는 서울대학교 미술대학을 졸업하고 뉴욕과 베를린에서 레지던시 프로그램에 참여했습니다. 그의 작업은 국내외 주요 미술관에서 전시되었으며, 현대 한국 미술을 대표하는 작가 중 한 명으로 평가받고 있습니다. 최근에는 디지털 매체와 전통 회화를 결합한 실험적 작업을 선보이고 있습니다.',
  'artist_bio',
  '{"artist": "홍길동"}'::jsonb
),
(
  '이 작품은 작가가 제주도에서 마주한 자연의 숭고함을 표현한 작업입니다. 거친 붓질과 대담한 색채 사용은 자연의 강인한 생명력을 드러내며, 동시에 그 앞에 선 인간의 작은 존재를 상기시킵니다.',
  'artwork_description',
  '{"artwork": "자연의 숭고", "medium": "캔버스에 아크릴"}'::jsonb
),
(
  '현대미술의 새로운 지평을 여는 전시가 열립니다. 이번 전시는 국내 대표 작가들의 신작을 한자리에서 만나볼 수 있는 특별한 기회입니다. 전시는 다음 달부터 3개월간 진행되며, 일반 대중을 위한 도슨트 프로그램과 작가와의 대화 시간도 마련되어 있습니다.',
  'press_release',
  '{"date": "2024-11", "venue": "서울시립미술관"}'::jsonb
),
(
  '이번 전시의 작품들은 미술 시장에서 높은 평가를 받고 있는 작가의 대표작들로 구성되어 있습니다. 특히 중견 작가로서의 안정적인 시장 가치와 지속적인 작품 세계의 발전은 투자 가치가 높습니다. 작가의 작품은 지난 5년간 평균 연 20%의 가치 상승을 보였으며, 국제 아트페어에서도 꾸준히 주목받고 있습니다.',
  'marketing_report',
  '{"investment_grade": "A", "market_trend": "상승"}'::jsonb
);

-- =====================================================
-- 6. STORAGE BUCKET (Supabase Dashboard에서 수동 생성 필요)
-- =====================================================
-- 1. Storage > New bucket > "artworks" 생성
-- 2. Public bucket으로 설정
-- 3. 또는 아래 정책 추가:
--    - SELECT: authenticated users can read
--    - INSERT: authenticated users can upload
--    - DELETE: users can delete own files
