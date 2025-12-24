// Billing Settings Types

export interface BillingSettings {
  monthlyPriceId: string
  annualPriceId: string
  monthlyPriceAmount: number
  annualPriceAmount: number
  currency: string
  allowPromotionCodes: boolean
  updatedBy: string | null
  updatedAt: string | null
}

export interface PromoTrialRule {
  id: string
  promoCode: string
  name: string
  description: string | null
  trialDays: number
  isActive: boolean
  applicablePlan: 'monthly' | 'annual' | null
  restrictedGuildIds: string | null
  notes: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminCouponTracking {
  id: string
  stripeCouponId: string
  stripePromoCodeId: string | null
  code: string | null
  purpose: string | null
  createdFor: string | null
  createdBy: string | null
  createdAt: string
}

// Stripe API types for display
export interface StripePrice {
  id: string
  product: string | { id: string; name: string }
  active: boolean
  currency: string
  unitAmount: number | null
  recurring: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount: number
  } | null
  nickname: string | null
  metadata: Record<string, string>
}

export interface StripeCoupon {
  id: string
  name: string | null
  amountOff: number | null
  percentOff: number | null
  currency: string | null
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  maxRedemptions: number | null
  timesRedeemed: number
  redeemBy: number | null
  valid: boolean
  metadata: Record<string, string>
  created: number
}

export interface StripePromotionCode {
  id: string
  code: string
  active: boolean
  coupon: StripeCoupon
  maxRedemptions: number | null
  timesRedeemed: number
  expiresAt: number | null
  metadata: Record<string, string>
  created: number
}

// API Request/Response types
export interface CreateCouponRequest {
  name: string
  amountOff?: number
  percentOff?: number
  currency?: string
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths?: number
  maxRedemptions?: number
  redeemBy?: string // ISO date string
  metadata?: Record<string, string>
}

export interface CreatePromoCodeRequest {
  couponId: string
  code: string
  maxRedemptions?: number
  expiresAt?: string // ISO date string
  metadata?: Record<string, string>
}

export interface CreateTrialRuleRequest {
  promoCode: string
  name: string
  description?: string
  trialDays: number
  isActive?: boolean
  applicablePlan?: 'monthly' | 'annual' | null
  restrictedGuildIds?: string
  notes?: string
  createdBy?: string
}

export interface UpdateTrialRuleRequest {
  name?: string
  description?: string
  trialDays?: number
  isActive?: boolean
  applicablePlan?: 'monthly' | 'annual' | null
  restrictedGuildIds?: string
  notes?: string
  updatedBy?: string
}

export interface BillingSettingsUpdate {
  monthlyPriceId?: string
  annualPriceId?: string
  monthlyPriceAmount?: number
  annualPriceAmount?: number
  currency?: string
  allowPromotionCodes?: boolean
  updatedBy?: string
}

// Checkout settings response (public API)
export interface CheckoutSettings {
  monthlyPriceId: string
  annualPriceId: string
  allowPromotionCodes: boolean
  trialDays: number | null // Will be set based on promo code
}
