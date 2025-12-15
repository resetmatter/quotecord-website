import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Validate required environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID

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
    if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_ANNUAL_PRICE_ID) {
      console.error('Checkout failed: Missing price IDs', {
        monthly: !!STRIPE_MONTHLY_PRICE_ID,
        annual: !!STRIPE_ANNUAL_PRICE_ID
      })
      return NextResponse.json({ error: 'Payment plans not configured' }, { status: 500 })
    }

    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      console.error('Checkout failed: No user', userError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { period } = await req.json() // 'monthly' or 'annual'
    console.log('Creating checkout for period:', period)

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

    const priceId = period === 'annual' ? STRIPE_ANNUAL_PRICE_ID : STRIPE_MONTHLY_PRICE_ID
    console.log('Creating checkout session with price:', priceId)

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      allow_promotion_codes: true,
      metadata: {
        discord_id: profile.discord_id,
        supabase_user_id: user.id
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`
    })

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
