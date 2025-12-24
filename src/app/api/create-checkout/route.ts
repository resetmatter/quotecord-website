import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { getBillingSettings, getTrialDaysForPromoCode } from '@/lib/billing'

// Validate required environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

export async function POST(req: Request) {
  try {
    // Check for required env vars
    if (!STRIPE_SECRET_KEY) {
      console.error('Checkout failed: Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    // Get dynamic billing settings from database
    const billingSettings = await getBillingSettings()

    if (!billingSettings.monthlyPriceId || !billingSettings.annualPriceId) {
      console.error('Checkout failed: Missing price IDs in billing settings', {
        monthly: !!billingSettings.monthlyPriceId,
        annual: !!billingSettings.annualPriceId
      })
      return NextResponse.json({ error: 'Payment plans not configured' }, { status: 500 })
    }

    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      console.error('Checkout failed: No user', userError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { period, promoCode } = await req.json() // 'monthly' or 'annual', optional promoCode
    console.log('Creating checkout for period:', period, 'promoCode:', promoCode)

    // Get user profile with Discord ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('discord_id, email')
      .eq('id', user.id)
      .single() as { data: { discord_id: string; email: string | null } | null; error: any }

    if (profileError || !profile) {
      console.error('Checkout failed: Profile not found', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get or create subscription record and Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single() as { data: { stripe_customer_id: string | null } | null }

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.id)
      const customer = await stripe.customers.create({
        email: profile.email || undefined,
        metadata: {
          discord_id: profile.discord_id,
          supabase_user_id: user.id
        }
      })
      customerId = customer.id

      // Upsert subscription record (create if doesn't exist, update if it does)
      const { error: upsertError } = await (supabase as any)
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          discord_id: profile.discord_id,
          stripe_customer_id: customerId,
          tier: 'free',
          status: 'active'
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        console.error('Failed to save Stripe customer ID:', upsertError)
        // Continue anyway - checkout can still work
      }
    }

    // Get the appropriate price ID from billing settings
    const priceId = period === 'annual' ? billingSettings.annualPriceId : billingSettings.monthlyPriceId
    console.log('Creating checkout session with price:', priceId)

    // Check if there's a trial rule for this promo code
    let trialDays = 0
    if (promoCode) {
      trialDays = await getTrialDaysForPromoCode(promoCode, period as 'monthly' | 'annual')
      console.log('Trial days for promo code:', promoCode, '->', trialDays)
    }

    // Build checkout session options
    // Note: We handle promo codes ourselves (not Stripe promo codes) so users enter codes
    // on our billing page before checkout, and we apply trial_period_days
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      allow_promotion_codes: false, // We handle promos via trial_period_days instead
      metadata: {
        discord_id: profile.discord_id,
        supabase_user_id: user.id,
        promo_code: promoCode || ''
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`
    }

    // Add trial period if there's a promo code with trial days
    // This gives X days free before charging, even on annual plans
    if (trialDays > 0) {
      sessionOptions.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          discord_id: profile.discord_id,
          supabase_user_id: user.id,
          promo_code: promoCode || '',
          trial_source: 'promo_code'
        }
      }
      console.log('Adding trial period:', trialDays, 'days')
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create(sessionOptions)

    console.log('Checkout session created:', checkoutSession.id)
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    )
  }
}
