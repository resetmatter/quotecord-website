-- Migration: Add admin users table and global feature flags
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- ADMIN USERS TABLE
-- ============================================

-- Admin users table - Store Discord IDs of users who can access admin features
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin'
  name TEXT, -- Display name for logging purposes
  created_by TEXT, -- Who added this admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin users
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast Discord ID lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_discord_id ON admin_users(discord_id);

-- ============================================
-- GLOBAL FEATURE FLAGS TABLE
-- ============================================

-- Global feature flags - Apply to ALL users (can be overridden by individual flags)
CREATE TABLE IF NOT EXISTS global_feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Global premium status override (null = use individual subscription, true/false = force for all)
  global_premium_override BOOLEAN,

  -- Individual feature overrides for ALL users (null = use individual settings)
  global_animated_gifs BOOLEAN,
  global_preview BOOLEAN,
  global_multi_message BOOLEAN,
  global_avatar_choice BOOLEAN,
  global_presets BOOLEAN,
  global_no_watermark BOOLEAN,

  -- Global storage quota override (null = use individual, otherwise this limit for all)
  global_max_gallery_size INTEGER,

  -- Metadata
  reason TEXT, -- Why these global settings are active
  updated_by TEXT, -- Who last updated

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = 'a0000000-0000-0000-0000-000000000001'::UUID)
);

-- Enable RLS
ALTER TABLE global_feature_flags ENABLE ROW LEVEL SECURITY;

-- Only service role can manage global feature flags
CREATE POLICY "Service role can manage global feature flags" ON global_feature_flags
  FOR ALL USING (auth.role() = 'service_role');

-- Insert the single row that will always exist
INSERT INTO global_feature_flags (id, reason, updated_by)
VALUES ('a0000000-0000-0000-0000-000000000001'::UUID, 'Default global settings', 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if a user is an admin by Discord ID
CREATE OR REPLACE FUNCTION is_admin_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE discord_id = discord_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global feature flags
CREATE OR REPLACE FUNCTION get_global_feature_flags()
RETURNS TABLE (
  global_premium_override BOOLEAN,
  global_animated_gifs BOOLEAN,
  global_preview BOOLEAN,
  global_multi_message BOOLEAN,
  global_avatar_choice BOOLEAN,
  global_presets BOOLEAN,
  global_no_watermark BOOLEAN,
  global_max_gallery_size INTEGER,
  reason TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gf.global_premium_override,
    gf.global_animated_gifs,
    gf.global_preview,
    gf.global_multi_message,
    gf.global_avatar_choice,
    gf.global_presets,
    gf.global_no_watermark,
    gf.global_max_gallery_size,
    gf.reason,
    gf.updated_by,
    gf.updated_at
  FROM global_feature_flags gf
  WHERE gf.id = 'a0000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE EXISTING FUNCTIONS
-- ============================================

-- Updated is_premium_user to check global flags first, then individual flags, then subscription
CREATE OR REPLACE FUNCTION is_premium_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  global_flags RECORD;
  flag_record RECORD;
BEGIN
  -- Check global feature flags first
  SELECT global_premium_override INTO global_flags
  FROM global_feature_flags
  WHERE id = 'a0000000-0000-0000-0000-000000000001'::UUID;

  -- If global premium override is set, use it
  IF global_flags.global_premium_override IS NOT NULL THEN
    RETURN global_flags.global_premium_override;
  END IF;

  -- Check for individual feature flag override
  SELECT premium_override, expires_at INTO flag_record
  FROM feature_flags
  WHERE discord_id = discord_user_id
  AND (expires_at IS NULL OR expires_at > NOW());

  -- If there's an active individual premium override, use it
  IF FOUND AND flag_record.premium_override IS NOT NULL THEN
    RETURN flag_record.premium_override;
  END IF;

  -- Otherwise, check actual subscription
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE discord_id = discord_user_id
    AND status = 'active'
    AND tier = 'premium'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated check_storage_quota to respect global flags
CREATE OR REPLACE FUNCTION check_storage_quota(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_premium BOOLEAN;
  quote_count INTEGER;
  max_quotes INTEGER;
  override_limit INTEGER;
  global_limit INTEGER;
BEGIN
  -- Check for global override first
  SELECT global_max_gallery_size INTO global_limit
  FROM global_feature_flags
  WHERE id = 'a0000000-0000-0000-0000-000000000001'::UUID;

  IF global_limit IS NOT NULL THEN
    SELECT get_user_quote_count(discord_user_id) INTO quote_count;
    RETURN quote_count < global_limit;
  END IF;

  -- Check for individual override limit in feature flags
  SELECT override_max_gallery_size INTO override_limit
  FROM feature_flags
  WHERE discord_id = discord_user_id
  AND (expires_at IS NULL OR expires_at > NOW());

  -- If there's an individual override, use it
  IF override_limit IS NOT NULL THEN
    SELECT get_user_quote_count(discord_user_id) INTO quote_count;
    RETURN quote_count < override_limit;
  END IF;

  -- Otherwise use default logic based on premium status
  SELECT is_premium_user(discord_user_id) INTO is_premium;

  IF is_premium THEN
    max_quotes := 1000;
  ELSE
    max_quotes := 50;
  END IF;

  SELECT get_user_quote_count(discord_user_id) INTO quote_count;

  RETURN quote_count < max_quotes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
