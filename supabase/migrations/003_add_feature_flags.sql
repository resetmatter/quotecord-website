-- Migration: Add feature_flags table for testing/override purposes
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- FEATURE FLAGS TABLE
-- ============================================

-- Feature flags table - Override subscription/feature status for testing
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Target user (by Discord ID for easy lookup)
  discord_id TEXT UNIQUE NOT NULL,

  -- Premium override - when true, user is treated as premium regardless of subscription
  premium_override BOOLEAN DEFAULT FALSE,

  -- Individual feature overrides (null = use default based on subscription)
  -- These can enable features for free users OR disable for premium users
  override_animated_gifs BOOLEAN,
  override_preview BOOLEAN,
  override_multi_message BOOLEAN,
  override_avatar_choice BOOLEAN,
  override_presets BOOLEAN,
  override_no_watermark BOOLEAN,

  -- Storage quota override (null = use default, otherwise specific limit)
  override_max_gallery_size INTEGER,

  -- Metadata
  reason TEXT, -- Why this flag was added (e.g., "Testing new feature", "Beta tester")
  created_by TEXT, -- Who added this flag
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Only service role can manage feature flags (admin only)
CREATE POLICY "Service role can manage feature flags" ON feature_flags
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast Discord ID lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_discord_id ON feature_flags(discord_id);

-- Index for finding active/non-expired flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_expires_at ON feature_flags(expires_at);

-- ============================================
-- UPDATED FUNCTIONS WITH FEATURE FLAG SUPPORT
-- ============================================

-- Drop and recreate is_premium_user to check feature flags first
CREATE OR REPLACE FUNCTION is_premium_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
BEGIN
  -- Check for feature flag override first
  SELECT premium_override, expires_at INTO flag_record
  FROM feature_flags
  WHERE discord_id = discord_user_id
  AND (expires_at IS NULL OR expires_at > NOW());

  -- If there's an active premium override, use it
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

-- Function to get feature flags for a user
CREATE OR REPLACE FUNCTION get_feature_flags(discord_user_id TEXT)
RETURNS TABLE (
  premium_override BOOLEAN,
  override_animated_gifs BOOLEAN,
  override_preview BOOLEAN,
  override_multi_message BOOLEAN,
  override_avatar_choice BOOLEAN,
  override_presets BOOLEAN,
  override_no_watermark BOOLEAN,
  override_max_gallery_size INTEGER,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ff.premium_override,
    ff.override_animated_gifs,
    ff.override_preview,
    ff.override_multi_message,
    ff.override_avatar_choice,
    ff.override_presets,
    ff.override_no_watermark,
    ff.override_max_gallery_size,
    ff.reason,
    ff.expires_at
  FROM feature_flags ff
  WHERE ff.discord_id = discord_user_id
  AND (ff.expires_at IS NULL OR ff.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated check_storage_quota to respect feature flag overrides
CREATE OR REPLACE FUNCTION check_storage_quota(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_premium BOOLEAN;
  quote_count INTEGER;
  max_quotes INTEGER;
  override_limit INTEGER;
BEGIN
  -- Check for override limit in feature flags
  SELECT override_max_gallery_size INTO override_limit
  FROM feature_flags
  WHERE discord_id = discord_user_id
  AND (expires_at IS NULL OR expires_at > NOW());

  -- If there's an override, use it
  IF override_limit IS NOT NULL THEN
    SELECT get_user_quote_count(discord_user_id) INTO quote_count;
    RETURN quote_count < override_limit;
  END IF;

  -- Otherwise use default logic
  SELECT is_premium_user(discord_user_id) INTO is_premium;

  -- Premium users have unlimited quota
  IF is_premium THEN
    RETURN TRUE;
  END IF;

  -- Free tier: 50 quotes max
  max_quotes := 50;
  SELECT get_user_quote_count(discord_user_id) INTO quote_count;

  RETURN quote_count < max_quotes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
