-- Migration: Add ads table for dynamic ad management
-- The bot will fetch the active ad from this table

-- ============================================
-- ADS TABLE
-- ============================================

-- Ads table - Store ad configurations for the bot to display
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Ad content
  text TEXT NOT NULL, -- Full ad text for classic/profile templates (max ~100 chars recommended)
  short_text TEXT NOT NULL, -- Short ad text for discord/embed templates (max ~50 chars recommended)

  -- Ad metadata
  name TEXT, -- Internal name for admin reference (e.g., "FlirtFactory Promo")
  description TEXT, -- Optional description/caption that advertisers can display under the quote
  url TEXT, -- Optional URL for the ad destination

  -- Status
  enabled BOOLEAN DEFAULT TRUE, -- Global on/off switch for this ad
  is_active BOOLEAN DEFAULT FALSE, -- Which ad is currently being served (only one should be active)

  -- Future fields for targeting/scheduling
  priority INTEGER DEFAULT 0, -- Higher priority ads shown first when multiple are active
  start_date TIMESTAMP WITH TIME ZONE, -- When this ad should start showing
  end_date TIMESTAMP WITH TIME ZONE, -- When this ad should stop showing
  target_guilds TEXT[], -- Optional: only show to specific guilds

  -- Tracking
  impressions INTEGER DEFAULT 0, -- Number of times this ad has been shown

  -- Metadata
  created_by TEXT, -- Who created this ad
  updated_by TEXT, -- Who last updated this ad

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Only service role can manage ads (admin only)
CREATE POLICY "Service role can manage ads" ON ads
  FOR ALL USING (auth.role() = 'service_role');

-- Index for finding active ads quickly
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ads_enabled ON ads(enabled);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);

-- Function to get the current active ad
CREATE OR REPLACE FUNCTION get_active_ad()
RETURNS TABLE (
  id UUID,
  text TEXT,
  short_text TEXT,
  name TEXT,
  description TEXT,
  url TEXT,
  enabled BOOLEAN,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.text,
    a.short_text,
    a.name,
    a.description,
    a.url,
    a.enabled,
    a.priority
  FROM ads a
  WHERE a.enabled = TRUE
    AND a.is_active = TRUE
    AND (a.start_date IS NULL OR a.start_date <= NOW())
    AND (a.end_date IS NULL OR a.end_date > NOW())
  ORDER BY a.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads SET impressions = impressions + 1 WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a default ad (matching current bot config)
INSERT INTO ads (text, short_text, name, enabled, is_active, created_by)
VALUES (
  'Sponsored • Join Us at discord.gg/flirtfactory',
  'Sponsored • Try DisQuote',
  'Default Ad',
  TRUE,
  TRUE,
  'system'
) ON CONFLICT DO NOTHING;
