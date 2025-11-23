-- DisQuote Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

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
