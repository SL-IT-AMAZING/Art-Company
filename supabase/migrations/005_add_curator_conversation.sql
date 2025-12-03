-- Add curator_conversation field to exhibitions table
ALTER TABLE exhibitions
ADD COLUMN IF NOT EXISTS curator_conversation JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN exhibitions.curator_conversation IS 'Stores the conversation history between user and AI curator';
