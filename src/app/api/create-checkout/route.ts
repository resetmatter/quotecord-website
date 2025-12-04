import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

interface SubscriptionData {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: string
  status: string
}

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    if (!process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || !process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID) {
      console.error('Stripe price IDs are not configured')
      return NextResponse.json({ error: 'Payment plans not configured' }, { status: 500 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    let body: { period?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const period = body.period || 'monthly'
    if (period !== 'monthly' && period !== 'annual') {
      return NextResponse.json({ error: 'Invalid billing period. Must be "monthly" or "annual"' }, { status: 400 })
    }

    // Get user profile with Discord ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('discord_id, email')
      .eq('id', session.user.id)
      .single() as { data: { discord_id: string; email: string } | null; error: any }

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Profile not found. Please try logging out and back in.' }, { status: 404 })
    }

    // Get existing subscription data
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, tier, status')
      .eq('user_id', session.user.id)
      .single() as { data: SubscriptionData | null; error: any }

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription fetch error:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 })
    }

    // Check if user already has an active premium subscription
    if (subscription?.tier === 'premium' && subscription?.status === 'active') {
      return NextResponse.json({
        error: 'You already have an active Pro subscription. Use the billing portal to manage your subscription.',
        code: 'ALREADY_SUBSCRIBED'
      }, { status: 400 })
    }

    let customerId = subscription?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: profile.email || undefined,
          metadata: {
            discord_id: profile.discord_id,
            supabase_user_id: session.user.id
          }
        })
        customerId = customer.id

        // Save customer ID to database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', session.user.id)

        if (updateError) {
          console.error('Failed to save customer ID:', updateError)
          // Continue anyway - the webhook will handle this
        }
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError)
        return NextResponse.json({ error: 'Failed to create payment profile' }, { status: 500 })
      }
    }

    // Get the appropriate price ID
    const priceId = period === 'annual'
      ? process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!
      : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!

    // Create checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        metadata: {
          discord_id: profile.discord_id,
          supabase_user_id: session.user.id
        },
        subscription_data: {
          metadata: {
            discord_id: profile.discord_id,
            supabase_user_id: session.user.id
          }
        },
        success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
        allow_promotion_codes: true
      })

      if (!checkoutSession.url) {
        return NextResponse.json({ error: 'Failed to generate checkout URL' }, { status: 500 })
      }

      return NextResponse.json({ url: checkoutSession.url })
    } catch (stripeError: any) {
      console.error('Stripe checkout session error:', stripeError)

      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json({
          error: 'Invalid payment configuration. Please contact support.',
          code: 'STRIPE_CONFIG_ERROR'
        }, { status: 500 })
      }

      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
