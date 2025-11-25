import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { period } = await req.json() // 'monthly' or 'annual'

    // Get user profile with Discord ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('discord_id, email')
      .eq('id', session.user.id)
      .single() as { data: { discord_id: string; email: string } | null }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single() as { data: { stripe_customer_id: string | null } | null }

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || undefined,
        metadata: {
          discord_id: profile.discord_id,
          supabase_user_id: session.user.id
        }
      })
      customerId = customer.id

      // Save customer ID
      await (supabase as any)
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', session.user.id)
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: period === 'annual'
          ? process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!
          : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
        quantity: 1
      }],
      metadata: {
        discord_id: profile.discord_id,
        supabase_user_id: session.user.id
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
