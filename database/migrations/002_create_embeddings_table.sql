-- Create embeddings table for storing vector embeddings
-- This table can store embeddings for various content types (resumes, events, etc.)

CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'resume', 'event', 'mission', 'job_description', etc.
  content_id uuid NOT NULL, -- Foreign key to the original content (resume_id, event_id, etc.)
  user_id uuid REFERENCES users(id) ON DELETE CASCADE, -- Optional: user who owns this content
  text_content text NOT NULL, -- The original text that was embedded
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional metadata (filename, language, etc.)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one embedding per content_type + content_id combination
  UNIQUE(content_type, content_id)
);

-- Create index for vector similarity search using HNSW (Hierarchical Navigable Small World)
-- This index allows fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create index for content type lookups
CREATE INDEX IF NOT EXISTS embeddings_content_type_idx ON embeddings(content_type);

-- Create index for content ID lookups
CREATE INDEX IF NOT EXISTS embeddings_content_id_idx ON embeddings(content_id);

-- Create index for user ID lookups
CREATE INDEX IF NOT EXISTS embeddings_user_id_idx ON embeddings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_embeddings_updated_at
  BEFORE UPDATE ON embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_embeddings_updated_at();

-- Function to search for similar embeddings
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_content_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_type text,
  content_id uuid,
  user_id uuid,
  text_content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.id,
    embeddings.content_type,
    embeddings.content_id,
    embeddings.user_id,
    embeddings.text_content,
    1 - (embeddings.embedding <=> query_embedding) AS similarity,
    embeddings.metadata
  FROM embeddings
  WHERE 
    (filter_content_type IS NULL OR embeddings.content_type = filter_content_type)
    AND 1 - (embeddings.embedding <=> query_embedding) >= match_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment for documentation
COMMENT ON TABLE embeddings IS 'Stores vector embeddings for semantic search across various content types';
COMMENT ON FUNCTION match_embeddings IS 'Performs cosine similarity search on embeddings with optional content type filter';

