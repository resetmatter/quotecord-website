-- Migration: Add quoted user fields to quote_gallery
-- This allows tracking WHO was quoted (not just who created the quote)

-- Add columns for the quoted user's Discord information
ALTER TABLE quote_gallery
ADD COLUMN IF NOT EXISTS quoted_user_id TEXT,
ADD COLUMN IF NOT EXISTS quoted_user_name TEXT,
ADD COLUMN IF NOT EXISTS quoted_user_avatar TEXT;

-- Add columns for the quoter's cached Discord info (for display without lookups)
ALTER TABLE quote_gallery
ADD COLUMN IF NOT EXISTS quoter_user_name TEXT,
ADD COLUMN IF NOT EXISTS quoter_user_avatar TEXT;

-- Add index for filtering by quoted user
CREATE INDEX IF NOT EXISTS idx_quote_gallery_quoted_user_id ON quote_gallery(quoted_user_id);

-- Add comments for clarity
COMMENT ON COLUMN quote_gallery.discord_id IS 'Discord ID of the user who CREATED the quote (the quoter)';
COMMENT ON COLUMN quote_gallery.quoted_user_id IS 'Discord ID of the user who IS BEING QUOTED';
COMMENT ON COLUMN quote_gallery.quoted_user_name IS 'Cached Discord username of the quoted user';
COMMENT ON COLUMN quote_gallery.quoted_user_avatar IS 'Cached Discord avatar URL of the quoted user';
COMMENT ON COLUMN quote_gallery.quoter_user_name IS 'Cached Discord username of the quoter';
COMMENT ON COLUMN quote_gallery.quoter_user_avatar IS 'Cached Discord avatar URL of the quoter';
