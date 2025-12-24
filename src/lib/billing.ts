import { createServiceClient } from './supabase-server'
import Stripe from 'stripe'
import type {
  BillingSettings,
  PromoTrialRule,
  AdminCouponTracking,
  StripePrice,
  StripeCoupon,
  StripePromotionCode,
  CreateCouponRequest,
  CreatePromoCodeRequest,
  CreateTrialRuleRequest,
  UpdateTrialRuleRequest,
  BillingSettingsUpdate,
  CheckoutSettings
} from '@/types/billing'

// Initialize Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null

const BILLING_SETTINGS_ID = 'b0000000-0000-0000-0000-000000000001'

// Database row types
interface BillingSettingsRow {
  id: string
  monthly_price_id: string
  annual_price_id: string
  monthly_price_amount: number
  annual_price_amount: number
  currency: string
  allow_promotion_codes: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

interface PromoTrialRuleRow {
  id: string
  promo_code: string
  name: string
  description: string | null
  trial_days: number
  is_active: boolean
  applicable_plan: string | null
  restricted_guild_ids: string | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

interface AdminCouponTrackingRow {
  id: string
  stripe_coupon_id: string
  stripe_promo_code_id: string | null
  code: string | null
  purpose: string | null
  created_for: string | null
  created_by: string | null
  created_at: string
}

// ===========================================
// BILLING SETTINGS FUNCTIONS
// ===========================================

export async function getBillingSettings(): Promise<BillingSettings> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('billing_settings')
    .select('*')
    .eq('id', BILLING_SETTINGS_ID)
    .single() as { data: BillingSettingsRow | null; error: any }

  // Return defaults if no data
  if (error || !data) {
    return {
      monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      annualPriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
      monthlyPriceAmount: 1.99,
      annualPriceAmount: 19.99,
      currency: 'usd',
      allowPromotionCodes: true,
      updatedBy: null,
      updatedAt: null
    }
  }

  return {
    monthlyPriceId: data.monthly_price_id || process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    annualPriceId: data.annual_price_id || process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
    monthlyPriceAmount: data.monthly_price_amount,
    annualPriceAmount: data.annual_price_amount,
    currency: data.currency,
    allowPromotionCodes: data.allow_promotion_codes,
    updatedBy: data.updated_by,
    updatedAt: data.updated_at
  }
}

export async function updateBillingSettings(
  input: BillingSettingsUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  }

  if (input.monthlyPriceId !== undefined) updateData.monthly_price_id = input.monthlyPriceId
  if (input.annualPriceId !== undefined) updateData.annual_price_id = input.annualPriceId
  if (input.monthlyPriceAmount !== undefined) updateData.monthly_price_amount = input.monthlyPriceAmount
  if (input.annualPriceAmount !== undefined) updateData.annual_price_amount = input.annualPriceAmount
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.allowPromotionCodes !== undefined) updateData.allow_promotion_codes = input.allowPromotionCodes
  if (input.updatedBy !== undefined) updateData.updated_by = input.updatedBy

  const { error } = await (supabase as any)
    .from('billing_settings')
    .update(updateData)
    .eq('id', BILLING_SETTINGS_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ===========================================
// STRIPE PRICE FUNCTIONS
// ===========================================

export async function listStripePrices(): Promise<StripePrice[]> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
    limit: 100
  })

  return prices.data.map(price => ({
    id: price.id,
    product: typeof price.product === 'string'
      ? price.product
      : { id: price.product.id, name: (price.product as Stripe.Product).name },
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount,
    recurring: price.recurring
      ? {
          interval: price.recurring.interval,
          intervalCount: price.recurring.interval_count
        }
      : null,
    nickname: price.nickname,
    metadata: price.metadata
  }))
}

export async function getStripePrice(priceId: string): Promise<StripePrice | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    })

    return {
      id: price.id,
      product: typeof price.product === 'string'
        ? price.product
        : { id: price.product.id, name: (price.product as Stripe.Product).name },
      active: price.active,
      currency: price.currency,
      unitAmount: price.unit_amount,
      recurring: price.recurring
        ? {
            interval: price.recurring.interval,
            intervalCount: price.recurring.interval_count
          }
        : null,
      nickname: price.nickname,
      metadata: price.metadata
    }
  } catch {
    return null
  }
}

// ===========================================
// STRIPE COUPON FUNCTIONS
// ===========================================

export async function listStripeCoupons(): Promise<StripeCoupon[]> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const coupons = await stripe.coupons.list({ limit: 100 })

  return coupons.data.map(coupon => ({
    id: coupon.id,
    name: coupon.name,
    amountOff: coupon.amount_off,
    percentOff: coupon.percent_off,
    currency: coupon.currency,
    duration: coupon.duration,
    durationInMonths: coupon.duration_in_months,
    maxRedemptions: coupon.max_redemptions,
    timesRedeemed: coupon.times_redeemed,
    redeemBy: coupon.redeem_by,
    valid: coupon.valid,
    metadata: coupon.metadata || {},
    created: coupon.created
  }))
}

export async function createStripeCoupon(
  input: CreateCouponRequest
): Promise<{ success: boolean; coupon?: StripeCoupon; error?: string }> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    const couponData: Stripe.CouponCreateParams = {
      name: input.name,
      duration: input.duration,
      metadata: input.metadata || {}
    }

    if (input.amountOff) {
      couponData.amount_off = input.amountOff
      couponData.currency = input.currency || 'usd'
    } else if (input.percentOff) {
      couponData.percent_off = input.percentOff
    }

    if (input.duration === 'repeating' && input.durationInMonths) {
      couponData.duration_in_months = input.durationInMonths
    }

    if (input.maxRedemptions) {
      couponData.max_redemptions = input.maxRedemptions
    }

    if (input.redeemBy) {
      couponData.redeem_by = Math.floor(new Date(input.redeemBy).getTime() / 1000)
    }

    const coupon = await stripe.coupons.create(couponData)

    return {
      success: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        amountOff: coupon.amount_off,
        percentOff: coupon.percent_off,
        currency: coupon.currency,
        duration: coupon.duration,
        durationInMonths: coupon.duration_in_months,
        maxRedemptions: coupon.max_redemptions,
        timesRedeemed: coupon.times_redeemed,
        redeemBy: coupon.redeem_by,
        valid: coupon.valid,
        metadata: coupon.metadata || {},
        created: coupon.created
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create coupon'
    }
  }
}

export async function deleteStripeCoupon(
  couponId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    await stripe.coupons.del(couponId)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete coupon'
    }
  }
}

// ===========================================
// STRIPE PROMOTION CODE FUNCTIONS
// ===========================================

export async function listStripePromotionCodes(): Promise<StripePromotionCode[]> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const promoCodes = await stripe.promotionCodes.list({
    limit: 100,
    expand: ['data.coupon']
  })

  return promoCodes.data.map(promo => ({
    id: promo.id,
    code: promo.code,
    active: promo.active,
    coupon: {
      id: promo.coupon.id,
      name: promo.coupon.name,
      amountOff: promo.coupon.amount_off,
      percentOff: promo.coupon.percent_off,
      currency: promo.coupon.currency,
      duration: promo.coupon.duration,
      durationInMonths: promo.coupon.duration_in_months,
      maxRedemptions: promo.coupon.max_redemptions,
      timesRedeemed: promo.coupon.times_redeemed,
      redeemBy: promo.coupon.redeem_by,
      valid: promo.coupon.valid,
      metadata: promo.coupon.metadata || {},
      created: promo.coupon.created
    },
    maxRedemptions: promo.max_redemptions,
    timesRedeemed: promo.times_redeemed,
    expiresAt: promo.expires_at,
    metadata: promo.metadata || {},
    created: promo.created
  }))
}

export async function createStripePromotionCode(
  input: CreatePromoCodeRequest
): Promise<{ success: boolean; promotionCode?: StripePromotionCode; error?: string }> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    const promoData: Stripe.PromotionCodeCreateParams = {
      coupon: input.couponId,
      code: input.code.toUpperCase(),
      metadata: input.metadata || {}
    }

    if (input.maxRedemptions) {
      promoData.max_redemptions = input.maxRedemptions
    }

    if (input.expiresAt) {
      promoData.expires_at = Math.floor(new Date(input.expiresAt).getTime() / 1000)
    }

    const promo = await stripe.promotionCodes.create(promoData)
    const coupon = promo.coupon as Stripe.Coupon

    return {
      success: true,
      promotionCode: {
        id: promo.id,
        code: promo.code,
        active: promo.active,
        coupon: {
          id: coupon.id,
          name: coupon.name,
          amountOff: coupon.amount_off,
          percentOff: coupon.percent_off,
          currency: coupon.currency,
          duration: coupon.duration,
          durationInMonths: coupon.duration_in_months,
          maxRedemptions: coupon.max_redemptions,
          timesRedeemed: coupon.times_redeemed,
          redeemBy: coupon.redeem_by,
          valid: coupon.valid,
          metadata: coupon.metadata || {},
          created: coupon.created
        },
        maxRedemptions: promo.max_redemptions,
        timesRedeemed: promo.times_redeemed,
        expiresAt: promo.expires_at,
        metadata: promo.metadata || {},
        created: promo.created
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create promotion code'
    }
  }
}

export async function deactivateStripePromotionCode(
  promoCodeId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    await stripe.promotionCodes.update(promoCodeId, { active: false })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate promotion code'
    }
  }
}

// ===========================================
// PROMO TRIAL RULES FUNCTIONS
// ===========================================

export async function listPromoTrialRules(): Promise<PromoTrialRule[]> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('promo_trial_rules')
    .select('*')
    .order('created_at', { ascending: false }) as { data: PromoTrialRuleRow[] | null; error: any }

  if (error || !data) {
    return []
  }

  return data.map(row => ({
    id: row.id,
    promoCode: row.promo_code,
    name: row.name,
    description: row.description,
    trialDays: row.trial_days,
    isActive: row.is_active,
    applicablePlan: row.applicable_plan as 'monthly' | 'annual' | null,
    restrictedGuildIds: row.restricted_guild_ids,
    notes: row.notes,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}

export async function getPromoTrialRule(id: string): Promise<PromoTrialRule | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('promo_trial_rules')
    .select('*')
    .eq('id', id)
    .single() as { data: PromoTrialRuleRow | null; error: any }

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    promoCode: data.promo_code,
    name: data.name,
    description: data.description,
    trialDays: data.trial_days,
    isActive: data.is_active,
    applicablePlan: data.applicable_plan as 'monthly' | 'annual' | null,
    restrictedGuildIds: data.restricted_guild_ids,
    notes: data.notes,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function getTrialDaysForPromoCode(
  promoCode: string,
  plan?: 'monthly' | 'annual'
): Promise<number> {
  const supabase = createServiceClient()

  let query = (supabase as any)
    .from('promo_trial_rules')
    .select('trial_days')
    .eq('promo_code', promoCode)
    .eq('is_active', true)

  if (plan) {
    query = query.or(`applicable_plan.is.null,applicable_plan.eq.${plan}`)
  }

  const { data, error } = await query.single() as { data: { trial_days: number } | null; error: any }

  if (error || !data) {
    return 0
  }

  return data.trial_days
}

export async function createPromoTrialRule(
  input: CreateTrialRuleRequest
): Promise<{ success: boolean; rule?: PromoTrialRule; error?: string }> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('promo_trial_rules')
    .insert({
      promo_code: input.promoCode,
      name: input.name,
      description: input.description || null,
      trial_days: input.trialDays,
      is_active: input.isActive ?? true,
      applicable_plan: input.applicablePlan || null,
      restricted_guild_ids: input.restrictedGuildIds || null,
      notes: input.notes || null,
      created_by: input.createdBy || null
    })
    .select()
    .single() as { data: PromoTrialRuleRow | null; error: any }

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: 'Failed to create trial rule' }
  }

  return {
    success: true,
    rule: {
      id: data.id,
      promoCode: data.promo_code,
      name: data.name,
      description: data.description,
      trialDays: data.trial_days,
      isActive: data.is_active,
      applicablePlan: data.applicable_plan as 'monthly' | 'annual' | null,
      restrictedGuildIds: data.restricted_guild_ids,
      notes: data.notes,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

export async function updatePromoTrialRule(
  id: string,
  input: UpdateTrialRuleRequest
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.trialDays !== undefined) updateData.trial_days = input.trialDays
  if (input.isActive !== undefined) updateData.is_active = input.isActive
  if (input.applicablePlan !== undefined) updateData.applicable_plan = input.applicablePlan
  if (input.restrictedGuildIds !== undefined) updateData.restricted_guild_ids = input.restrictedGuildIds
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.updatedBy !== undefined) updateData.updated_by = input.updatedBy

  const { error } = await (supabase as any)
    .from('promo_trial_rules')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deletePromoTrialRule(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('promo_trial_rules')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ===========================================
// ADMIN COUPON TRACKING FUNCTIONS
// ===========================================

export async function trackCouponCreation(input: {
  stripeCouponId: string
  stripePromoCodeId?: string
  code?: string
  purpose?: string
  createdFor?: string
  createdBy?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { error } = await (supabase as any)
    .from('admin_coupon_tracking')
    .insert({
      stripe_coupon_id: input.stripeCouponId,
      stripe_promo_code_id: input.stripePromoCodeId || null,
      code: input.code || null,
      purpose: input.purpose || null,
      created_for: input.createdFor || null,
      created_by: input.createdBy || null
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function listAdminCouponTracking(): Promise<AdminCouponTracking[]> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('admin_coupon_tracking')
    .select('*')
    .order('created_at', { ascending: false }) as { data: AdminCouponTrackingRow[] | null; error: any }

  if (error || !data) {
    return []
  }

  return data.map(row => ({
    id: row.id,
    stripeCouponId: row.stripe_coupon_id,
    stripePromoCodeId: row.stripe_promo_code_id,
    code: row.code,
    purpose: row.purpose,
    createdFor: row.created_for,
    createdBy: row.created_by,
    createdAt: row.created_at
  }))
}

// ===========================================
// CHECKOUT SETTINGS (PUBLIC API)
// ===========================================

export async function getCheckoutSettings(
  promoCode?: string,
  plan?: 'monthly' | 'annual'
): Promise<CheckoutSettings> {
  const billingSettings = await getBillingSettings()

  let trialDays: number | null = null
  if (promoCode) {
    trialDays = await getTrialDaysForPromoCode(promoCode, plan)
  }

  return {
    monthlyPriceId: billingSettings.monthlyPriceId,
    annualPriceId: billingSettings.annualPriceId,
    allowPromotionCodes: billingSettings.allowPromotionCodes,
    trialDays: trialDays || null
  }
}
