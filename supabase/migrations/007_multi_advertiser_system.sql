-- Migration: Multi-advertiser system with vanity URLs and click tracking
-- Allows multiple ads to run concurrently with weighted distribution

-- ============================================
-- UPDATE ADS TABLE
-- ============================================

-- Add new columns for multi-advertiser support
ALTER TABLE ads ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE; -- Vanity URL handle (e.g., "logitech" for quotecord.com/@logitech)
ALTER TABLE ads ADD COLUMN IF NOT EXISTS destination_url TEXT; -- Where the handle redirects to
ALTER TABLE ads ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0; -- Number of times the handle URL was visited
ALTER TABLE ads ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1; -- Weight for random selection (higher = more impressions)

-- Advertiser info
ALTER TABLE ads ADD COLUMN IF NOT EXISTS advertiser_name TEXT; -- Company/brand name
ALTER TABLE ads ADD COLUMN IF NOT EXISTS advertiser_email TEXT; -- Contact email
ALTER TABLE ads ADD COLUMN IF NOT EXISTS advertiser_notes TEXT; -- Internal notes about the advertiser

-- Drop is_active since we now support multiple active ads
-- We'll use 'enabled' to determine if an ad is in rotation
ALTER TABLE ads DROP COLUMN IF EXISTS is_active;

-- Index for handle lookups (for redirect route)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ads_handle ON ads(handle) WHERE handle IS NOT NULL;

-- ============================================
-- AD CLICKS TABLE (detailed click tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,

  -- Click metadata
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT, -- Where the click came from
  user_agent TEXT, -- Browser/device info
  ip_hash TEXT, -- Hashed IP for unique visitor tracking (privacy-safe)

  -- Optional: geographic data (if you add geo lookup later)
  country TEXT,
  region TEXT
);

-- Enable RLS
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;

-- Only service role can manage clicks
CREATE POLICY "Service role can manage ad clicks" ON ad_clicks
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at DESC);

-- ============================================
-- UPDATED FUNCTIONS
-- ============================================

-- Function to get a random ad from all enabled ads (weighted)
-- Returns one ad randomly selected based on weight
CREATE OR REPLACE FUNCTION get_random_ad()
RETURNS TABLE (
  id UUID,
  text TEXT,
  short_text TEXT,
  name TEXT,
  description TEXT,
  handle TEXT,
  destination_url TEXT,
  weight INTEGER
) AS $$
DECLARE
  total_weight INTEGER;
  random_val INTEGER;
  running_weight INTEGER := 0;
  selected_id UUID;
BEGIN
  -- Get total weight of all enabled ads within their date range
  SELECT COALESCE(SUM(a.weight), 0) INTO total_weight
  FROM ads a
  WHERE a.enabled = TRUE
    AND (a.start_date IS NULL OR a.start_date <= NOW())
    AND (a.end_date IS NULL OR a.end_date > NOW());

  -- If no ads available, return empty
  IF total_weight = 0 THEN
    RETURN;
  END IF;

  -- Pick a random number between 1 and total_weight
  random_val := floor(random() * total_weight) + 1;

  -- Find the ad that corresponds to this random value
  FOR selected_id IN
    SELECT a.id
    FROM ads a
    WHERE a.enabled = TRUE
      AND (a.start_date IS NULL OR a.start_date <= NOW())
      AND (a.end_date IS NULL OR a.end_date > NOW())
    ORDER BY a.id
  LOOP
    SELECT running_weight + a.weight INTO running_weight
    FROM ads a WHERE a.id = selected_id;

    IF running_weight >= random_val THEN
      RETURN QUERY
      SELECT
        a.id,
        a.text,
        a.short_text,
        a.name,
        a.description,
        a.handle,
        a.destination_url,
        a.weight
      FROM ads a
      WHERE a.id = selected_id;
      RETURN;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ad by handle (for redirect route)
CREATE OR REPLACE FUNCTION get_ad_by_handle(ad_handle TEXT)
RETURNS TABLE (
  id UUID,
  destination_url TEXT,
  name TEXT,
  enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.destination_url,
    a.name,
    a.enabled
  FROM ads a
  WHERE a.handle = ad_handle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a click and increment counter
CREATE OR REPLACE FUNCTION record_ad_click(
  ad_id UUID,
  click_referrer TEXT DEFAULT NULL,
  click_user_agent TEXT DEFAULT NULL,
  click_ip_hash TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Increment the click counter on the ad
  UPDATE ads SET clicks = clicks + 1 WHERE id = ad_id;

  -- Record detailed click info
  INSERT INTO ad_clicks (ad_id, referrer, user_agent, ip_hash)
  VALUES (ad_id, click_referrer, click_user_agent, click_ip_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ad stats (for admin dashboard)
CREATE OR REPLACE FUNCTION get_ad_stats(ad_id UUID)
RETURNS TABLE (
  impressions INTEGER,
  clicks INTEGER,
  ctr NUMERIC,
  clicks_today INTEGER,
  clicks_this_week INTEGER,
  clicks_this_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.impressions,
    a.clicks,
    CASE WHEN a.impressions > 0
      THEN ROUND((a.clicks::NUMERIC / a.impressions::NUMERIC) * 100, 2)
      ELSE 0
    END as ctr,
    (SELECT COUNT(*)::INTEGER FROM ad_clicks ac WHERE ac.ad_id = a.id AND ac.clicked_at >= CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM ad_clicks ac WHERE ac.ad_id = a.id AND ac.clicked_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM ad_clicks ac WHERE ac.ad_id = a.id AND ac.clicked_at >= CURRENT_DATE - INTERVAL '30 days')
  FROM ads a
  WHERE a.id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE DEFAULT AD
-- ============================================

-- Update the default QuoteCord ad with a handle
UPDATE ads
SET
  handle = 'pro',
  destination_url = 'https://quotecord.com/dashboard/billing',
  weight = 1,
  advertiser_name = 'QuoteCord'
WHERE name = 'Default Ad' AND handle IS NULL;
