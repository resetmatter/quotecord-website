-- Migration: Add Billing Settings and Promo Trial Rules
-- This migration adds tables for managing Stripe billing configuration
-- and custom promo code trial rules from the admin dashboard

-- =====================================================
-- Table: billing_settings
-- Stores the active Stripe price IDs and other billing config
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_settings (
  id uuid PRIMARY KEY DEFAULT 'b0000000-0000-0000-0000-000000000001'::uuid,

  -- Active Stripe Price IDs
  monthly_price_id text NOT NULL DEFAULT '',
  annual_price_id text NOT NULL DEFAULT '',

  -- Price amounts (stored for display, actual billing uses Stripe)
  monthly_price_amount numeric(10,2) DEFAULT 1.99,
  annual_price_amount numeric(10,2) DEFAULT 19.99,

  -- Currency
  currency text DEFAULT 'usd',

  -- Feature toggles
  allow_promotion_codes boolean DEFAULT true,

  -- Audit trail
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default row if not exists
INSERT INTO billing_settings (id)
VALUES ('b0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Table: promo_trial_rules
-- Maps promo/coupon codes to custom trial periods
-- e.g., FIRSTMONTHFREE -> 30-day trial
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_trial_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The promo code or coupon ID this rule applies to
  -- Can be a promotion_code ID (promo_xxx) or coupon ID (coupon_xxx) from Stripe
  promo_code text NOT NULL UNIQUE,

  -- Human-friendly name for this promo
  name text NOT NULL,

  -- Description of what this promo does
  description text,

  -- Trial period in days (e.g., 30 for a 30-day free trial)
  trial_days integer NOT NULL DEFAULT 0,

  -- Whether this rule is currently active
  is_active boolean DEFAULT true,

  -- Restrict to specific plans (null = all plans)
  -- 'monthly', 'annual', or null for both
  applicable_plan text CHECK (applicable_plan IN ('monthly', 'annual', NULL)),

  -- Optional: Restrict to specific communities/guilds (comma-separated Discord guild IDs)
  -- This allows community-specific promos
  restricted_guild_ids text,

  -- Notes for admin reference
  notes text,

  -- Audit trail
  created_by text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for fast lookup by promo code
CREATE INDEX IF NOT EXISTS idx_promo_trial_rules_promo_code ON promo_trial_rules(promo_code);
CREATE INDEX IF NOT EXISTS idx_promo_trial_rules_is_active ON promo_trial_rules(is_active);

-- =====================================================
-- Table: admin_coupon_tracking
-- Tracks coupons/promos created through the admin dashboard
-- Stores metadata that isn't in Stripe
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_coupon_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe coupon ID
  stripe_coupon_id text NOT NULL,

  -- Stripe promotion code ID (if created)
  stripe_promo_code_id text,

  -- The actual code users enter
  code text,

  -- Admin notes about this coupon
  purpose text,

  -- Who/what community this was created for
  created_for text,

  -- Audit trail
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_coupon_tracking_coupon ON admin_coupon_tracking(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_admin_coupon_tracking_code ON admin_coupon_tracking(code);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_trial_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_coupon_tracking ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables (admin-only)
CREATE POLICY "Service role can manage billing_settings"
  ON billing_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage promo_trial_rules"
  ON promo_trial_rules
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage admin_coupon_tracking"
  ON admin_coupon_tracking
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get trial days for a promo code
CREATE OR REPLACE FUNCTION get_promo_trial_days(
  p_promo_code text,
  p_plan text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_days integer;
BEGIN
  SELECT trial_days INTO v_trial_days
  FROM promo_trial_rules
  WHERE promo_code = p_promo_code
    AND is_active = true
    AND (applicable_plan IS NULL OR applicable_plan = p_plan);

  RETURN COALESCE(v_trial_days, 0);
END;
$$;

-- Function to get current billing settings
CREATE OR REPLACE FUNCTION get_billing_settings()
RETURNS TABLE (
  monthly_price_id text,
  annual_price_id text,
  monthly_price_amount numeric,
  annual_price_amount numeric,
  currency text,
  allow_promotion_codes boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    monthly_price_id,
    annual_price_id,
    monthly_price_amount,
    annual_price_amount,
    currency,
    allow_promotion_codes
  FROM billing_settings
  WHERE id = 'b0000000-0000-0000-0000-000000000001'::uuid;
$$;
