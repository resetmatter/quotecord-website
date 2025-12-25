-- Migration: Advertiser billing system with prepaid credits
-- Charge per quote generated, track gallery shares

-- ============================================
-- ADD BILLING COLUMNS TO ADS TABLE
-- ============================================

-- Pricing and budget
ALTER TABLE ads ADD COLUMN IF NOT EXISTS cost_per_quote_cents INTEGER DEFAULT 1; -- Cost per quote in cents (1 = $0.01)
ALTER TABLE ads ADD COLUMN IF NOT EXISTS budget_cents INTEGER DEFAULT 0; -- Prepaid budget in cents
ALTER TABLE ads ADD COLUMN IF NOT EXISTS spent_cents INTEGER DEFAULT 0; -- Amount spent so far

-- Billing status
ALTER TABLE ads ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'free' CHECK (billing_type IN ('free', 'prepaid', 'unlimited'));
-- 'free' = no charge (internal/promo ads)
-- 'prepaid' = charges against budget, stops when depleted
-- 'unlimited' = special deals, no budget limit

-- Gallery tracking
ALTER TABLE ads ADD COLUMN IF NOT EXISTS gallery_shares INTEGER DEFAULT 0; -- Times shared from website gallery

-- Stripe customer info (for advertisers who pay)
ALTER TABLE ads ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- ============================================
-- AD TRANSACTIONS TABLE (payment/credit history)
-- ============================================

CREATE TABLE IF NOT EXISTS ad_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,

  -- Transaction type
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  -- 'credit' = added funds (payment)
  -- 'debit' = spent on quotes
  -- 'refund' = refunded amount

  -- Amount
  amount_cents INTEGER NOT NULL, -- Positive for credits, represents absolute value

  -- Balance after transaction
  balance_after_cents INTEGER NOT NULL,

  -- Description
  description TEXT,

  -- For credits: payment info
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- For debits: usage info
  quotes_count INTEGER, -- Number of quotes this debit covers (for batch debits)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

ALTER TABLE ad_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage ad transactions" ON ad_transactions;
CREATE POLICY "Service role can manage ad transactions" ON ad_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ad_transactions_ad_id ON ad_transactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_created_at ON ad_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_type ON ad_transactions(type);

-- ============================================
-- GALLERY SHARES TABLE (track when quotes are shared from gallery)
-- ============================================

CREATE TABLE IF NOT EXISTS ad_gallery_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  quote_id TEXT, -- Reference to the quote that was shared (if tracked)

  -- Share metadata
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  share_type TEXT, -- 'copy_link', 'download', 'social_twitter', 'social_discord', etc.
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT
);

ALTER TABLE ad_gallery_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage gallery shares" ON ad_gallery_shares;
CREATE POLICY "Service role can manage gallery shares" ON ad_gallery_shares
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ad_gallery_shares_ad_id ON ad_gallery_shares(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_gallery_shares_shared_at ON ad_gallery_shares(shared_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if an ad has budget remaining
CREATE OR REPLACE FUNCTION ad_has_budget(ad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ad_record RECORD;
BEGIN
  SELECT billing_type, budget_cents, spent_cents
  INTO ad_record
  FROM ads WHERE id = ad_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Free and unlimited ads always have "budget"
  IF ad_record.billing_type IN ('free', 'unlimited') THEN
    RETURN TRUE;
  END IF;

  -- Prepaid ads need remaining budget
  RETURN (ad_record.budget_cents - ad_record.spent_cents) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining budget in cents
CREATE OR REPLACE FUNCTION get_ad_remaining_budget(ad_id UUID)
RETURNS INTEGER AS $$
DECLARE
  ad_record RECORD;
BEGIN
  SELECT billing_type, budget_cents, spent_cents
  INTO ad_record
  FROM ads WHERE id = ad_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF ad_record.billing_type = 'free' THEN
    RETURN -1; -- Indicates free/unlimited
  END IF;

  IF ad_record.billing_type = 'unlimited' THEN
    RETURN -1;
  END IF;

  RETURN GREATEST(0, ad_record.budget_cents - ad_record.spent_cents);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to charge for a quote generation
CREATE OR REPLACE FUNCTION charge_ad_for_quote(ad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ad_record RECORD;
  new_spent INTEGER;
BEGIN
  SELECT billing_type, budget_cents, spent_cents, cost_per_quote_cents
  INTO ad_record
  FROM ads WHERE id = ad_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Free ads don't get charged
  IF ad_record.billing_type = 'free' THEN
    -- Just increment impressions
    UPDATE ads SET impressions = impressions + 1 WHERE id = ad_id;
    RETURN TRUE;
  END IF;

  -- Unlimited ads get charged but no budget check
  IF ad_record.billing_type = 'unlimited' THEN
    new_spent := ad_record.spent_cents + ad_record.cost_per_quote_cents;
    UPDATE ads SET
      spent_cents = new_spent,
      impressions = impressions + 1
    WHERE id = ad_id;
    RETURN TRUE;
  END IF;

  -- Prepaid ads: check budget first
  IF (ad_record.budget_cents - ad_record.spent_cents) < ad_record.cost_per_quote_cents THEN
    RETURN FALSE; -- Not enough budget
  END IF;

  new_spent := ad_record.spent_cents + ad_record.cost_per_quote_cents;

  UPDATE ads SET
    spent_cents = new_spent,
    impressions = impressions + 1
  WHERE id = ad_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to an ad
CREATE OR REPLACE FUNCTION add_ad_credits(
  ad_id UUID,
  amount_cents INTEGER,
  description TEXT DEFAULT NULL,
  stripe_payment_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$ -- Returns new balance
DECLARE
  new_balance INTEGER;
BEGIN
  -- Update the budget
  UPDATE ads SET
    budget_cents = budget_cents + amount_cents,
    billing_type = CASE WHEN billing_type = 'free' THEN 'prepaid' ELSE billing_type END
  WHERE id = ad_id
  RETURNING (budget_cents - spent_cents) INTO new_balance;

  -- Record the transaction
  INSERT INTO ad_transactions (ad_id, type, amount_cents, balance_after_cents, description, stripe_payment_intent_id, created_by)
  VALUES (ad_id, 'credit', amount_cents, new_balance, description, stripe_payment_id, 'system');

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a gallery share
CREATE OR REPLACE FUNCTION record_gallery_share(
  ad_id UUID,
  share_quote_id TEXT DEFAULT NULL,
  share_type TEXT DEFAULT 'unknown',
  share_referrer TEXT DEFAULT NULL,
  share_user_agent TEXT DEFAULT NULL,
  share_ip_hash TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Increment counter on ads table
  UPDATE ads SET gallery_shares = gallery_shares + 1 WHERE id = ad_id;

  -- Record detailed share info
  INSERT INTO ad_gallery_shares (ad_id, quote_id, share_type, referrer, user_agent, ip_hash)
  VALUES (ad_id, share_quote_id, share_type, share_referrer, share_user_agent, share_ip_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated get_random_ad to only return ads with budget
CREATE OR REPLACE FUNCTION get_random_ad()
RETURNS TABLE (
  id UUID, text TEXT, short_text TEXT, name TEXT,
  description TEXT, handle TEXT, destination_url TEXT, weight INTEGER
) AS $$
DECLARE
  total_weight INTEGER;
  random_val INTEGER;
  running_weight INTEGER := 0;
  selected_id UUID;
BEGIN
  -- Only select ads that are enabled, in date range, AND have budget
  SELECT COALESCE(SUM(a.weight), 0) INTO total_weight
  FROM ads a
  WHERE a.enabled = TRUE
    AND (a.start_date IS NULL OR a.start_date <= NOW())
    AND (a.end_date IS NULL OR a.end_date > NOW())
    AND (
      a.billing_type IN ('free', 'unlimited')
      OR (a.billing_type = 'prepaid' AND (a.budget_cents - a.spent_cents) >= a.cost_per_quote_cents)
    );

  IF total_weight = 0 THEN RETURN; END IF;

  random_val := floor(random() * total_weight) + 1;

  FOR selected_id IN
    SELECT a.id FROM ads a
    WHERE a.enabled = TRUE
      AND (a.start_date IS NULL OR a.start_date <= NOW())
      AND (a.end_date IS NULL OR a.end_date > NOW())
      AND (
        a.billing_type IN ('free', 'unlimited')
        OR (a.billing_type = 'prepaid' AND (a.budget_cents - a.spent_cents) >= a.cost_per_quote_cents)
      )
    ORDER BY a.id
  LOOP
    SELECT running_weight + a.weight INTO running_weight FROM ads a WHERE a.id = selected_id;
    IF running_weight >= random_val THEN
      RETURN QUERY SELECT a.id, a.text, a.short_text, a.name, a.description, a.handle, a.destination_url, a.weight
      FROM ads a WHERE a.id = selected_id;
      RETURN;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE EXISTING ADS
-- ============================================

-- Set default ad to free billing
UPDATE ads SET billing_type = 'free' WHERE billing_type IS NULL;
UPDATE ads SET billing_type = 'free' WHERE advertiser_name = 'QuoteCord';
