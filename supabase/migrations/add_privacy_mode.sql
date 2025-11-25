-- Migration: Add privacy_mode column to quote_gallery table
-- Run this SQL in your Supabase SQL Editor to add the privacy_mode field

-- Add privacy_mode column if it doesn't exist
ALTER TABLE quote_gallery
ADD COLUMN IF NOT EXISTS privacy_mode TEXT DEFAULT 'public';

-- Create index for efficient filtering by privacy mode
CREATE INDEX IF NOT EXISTS idx_quote_gallery_privacy_mode ON quote_gallery(privacy_mode);

-- Update any existing null values to 'public' (the default)
UPDATE quote_gallery SET privacy_mode = 'public' WHERE privacy_mode IS NULL;
