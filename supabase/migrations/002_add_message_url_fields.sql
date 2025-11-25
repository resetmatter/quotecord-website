-- Migration: Add message URL fields to quote_gallery
-- This allows storing links to the original Discord messages

-- Add single message URL column
ALTER TABLE quote_gallery
ADD COLUMN IF NOT EXISTS message_url TEXT;

-- Add array of message URLs for multi-message quotes (stored as JSONB)
ALTER TABLE quote_gallery
ADD COLUMN IF NOT EXISTS message_urls JSONB DEFAULT '[]'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN quote_gallery.message_url IS 'URL to the original Discord message (clicking opens Discord and jumps to that message)';
COMMENT ON COLUMN quote_gallery.message_urls IS 'Array of message URLs for multi-message quotes';
