-- quotecord Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard > Storage)
-- ============================================
-- Create a bucket named 'quotes' with:
-- - Public access: true (for serving quote images)
-- - File size limit: 10MB
-- - Allowed MIME types: image/png, image/gif, image/jpeg, image/webp
--
-- Storage Policies (run in SQL Editor):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('quotes', 'quotes', true);
--
-- CREATE POLICY "Allow public read access" ON storage.objects
--   FOR SELECT USING (bucket_id = 'quotes');
--
-- CREATE POLICY "Allow service role to upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'quotes' AND auth.role() = 'service_role');
--
-- CREATE POLICY "Allow service role to delete" ON storage.objects
--   FOR DELETE USING (bucket_id = 'quotes' AND auth.role() = 'service_role');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table - User profiles linked to Discord
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  discord_avatar TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================

-- Subscriptions table - Subscription status by Discord ID
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  discord_id TEXT UNIQUE NOT NULL,

  -- Subscription status
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due'

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Billing period
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================

-- Presets table - Saved user presets (Premium feature)
CREATE TABLE IF NOT EXISTS presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,

  -- Settings
  template TEXT NOT NULL,
  font TEXT NOT NULL,
  theme TEXT NOT NULL,
  orientation TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Users can manage their own presets
CREATE POLICY "Users can manage own presets" ON presets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================

-- Quotes table - Usage tracking
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  guild_id TEXT,

  -- Quote details
  template TEXT NOT NULL,
  font TEXT NOT NULL,
  theme TEXT NOT NULL,
  orientation TEXT,
  animated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (for bot usage tracking)
CREATE POLICY "Service role can insert quotes" ON quotes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup from Discord OAuth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile from Discord data
  INSERT INTO profiles (id, discord_id, discord_username, discord_avatar, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );

  -- Create default free subscription
  INSERT INTO subscriptions (user_id, discord_id, tier, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    'free',
    'active'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================

-- Function to check premium status by Discord ID
CREATE OR REPLACE FUNCTION is_premium_user(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE discord_id = discord_user_id
    AND status = 'active'
    AND tier = 'premium'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================

-- Function to get full subscription info
CREATE OR REPLACE FUNCTION get_subscription_by_discord_id(discord_user_id TEXT)
RETURNS TABLE (
  tier TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.tier, s.status, s.current_period_end
  FROM subscriptions s
  WHERE s.discord_id = discord_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================

-- Index for faster Discord ID lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_discord_id ON subscriptions(discord_id);
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON profiles(discord_id);
CREATE INDEX IF NOT EXISTS idx_quotes_discord_id ON quotes(discord_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================
-- QUOTE GALLERY TABLE
-- ============================================

-- Quote gallery table - Stores quote image metadata with references to Supabase Storage
CREATE TABLE IF NOT EXISTS quote_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL, -- Discord ID of the user who CREATED the quote (the quoter)

  -- Quote image metadata
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT NOT NULL, -- 'image/png', 'image/gif', etc.

  -- Generation details
  template TEXT NOT NULL,
  font TEXT NOT NULL,
  theme TEXT NOT NULL,
  orientation TEXT,
  animated BOOLEAN DEFAULT FALSE,

  -- Quote content (for display purposes)
  quote_text TEXT,
  author_name TEXT, -- Legacy field, use quoted_user_name instead
  guild_id TEXT,

  -- Quoted user info (the person being quoted)
  quoted_user_id TEXT, -- Discord ID of the user being quoted
  quoted_user_name TEXT, -- Cached Discord username
  quoted_user_avatar TEXT, -- Cached Discord avatar URL

  -- Quoter info cache (for display without lookups)
  quoter_user_name TEXT, -- Cached Discord username of the quoter
  quoter_user_avatar TEXT, -- Cached Discord avatar URL of the quoter

  -- Storage info
  public_url TEXT, -- Public URL for the quote image

  -- Privacy mode ('public', 'anonymous', 'private', 'dmonly')
  privacy_mode TEXT DEFAULT 'public',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quote_gallery ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotes
CREATE POLICY "Users can view own gallery quotes" ON quote_gallery
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own quotes
CREATE POLICY "Users can delete own gallery quotes" ON quote_gallery
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can insert quotes (for bot)
CREATE POLICY "Service role can insert gallery quotes" ON quote_gallery
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can manage all quotes
CREATE POLICY "Service role can manage gallery quotes" ON quote_gallery
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for quote gallery
CREATE INDEX IF NOT EXISTS idx_quote_gallery_discord_id ON quote_gallery(discord_id);
CREATE INDEX IF NOT EXISTS idx_quote_gallery_user_id ON quote_gallery(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_gallery_created_at ON quote_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_gallery_quoted_user_id ON quote_gallery(quoted_user_id);
CREATE INDEX IF NOT EXISTS idx_quote_gallery_privacy_mode ON quote_gallery(privacy_mode);

-- ============================================
-- BOT API KEY TABLE
-- ============================================

-- API keys for bot authentication
CREATE TABLE IF NOT EXISTS bot_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_hash TEXT UNIQUE NOT NULL, -- SHA256 hash of the API key
  name TEXT NOT NULL, -- Descriptive name for the key
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bot_api_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access API keys
CREATE POLICY "Service role can manage API keys" ON bot_api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ADDITIONAL FUNCTIONS
-- ============================================

-- Function to get user quote count
CREATE OR REPLACE FUNCTION get_user_quote_count(discord_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER FROM quote_gallery
    WHERE discord_id = discord_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has storage quota available (Premium: 1000, Free: 50)
CREATE OR REPLACE FUNCTION check_storage_quota(discord_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_premium BOOLEAN;
  quote_count INTEGER;
  max_quotes INTEGER;
BEGIN
  -- Check if user is premium
  SELECT is_premium_user(discord_user_id) INTO is_premium;

  -- Set max quotes based on tier
  IF is_premium THEN
    max_quotes := 1000;
  ELSE
    max_quotes := 50;
  END IF;

  -- Get current quote count
  SELECT get_user_quote_count(discord_user_id) INTO quote_count;

  RETURN quote_count < max_quotes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
