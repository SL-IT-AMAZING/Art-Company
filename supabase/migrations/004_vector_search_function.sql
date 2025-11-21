-- Create function for vector similarity search
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

COMMENT ON FUNCTION match_curator_samples IS 'Find similar curator samples using vector cosine similarity';
