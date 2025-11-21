-- Create curator_samples table for RAG
CREATE TABLE IF NOT EXISTS curator_samples (
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
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS curator_samples_embedding_idx
ON curator_samples
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for content type filtering
CREATE INDEX IF NOT EXISTS curator_samples_content_type_idx
ON curator_samples(content_type);

-- Enable Row Level Security
ALTER TABLE curator_samples ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read
CREATE POLICY "Allow authenticated read access"
ON curator_samples FOR SELECT
TO authenticated
USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Allow service role full access"
ON curator_samples FOR ALL
TO service_role
USING (true);

-- Insert sample curator data
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

COMMENT ON TABLE curator_samples IS 'RAG system curator samples with embeddings';
COMMENT ON COLUMN curator_samples.embedding IS 'OpenAI text-embedding-3-small (1536 dimensions)';
