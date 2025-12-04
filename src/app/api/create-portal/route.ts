import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST() {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single() as { data: { stripe_customer_id: string | null } | null; error: any }

    if (subError) {
      console.error('Subscription fetch error:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 })
    }

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({
        error: 'No billing account found. Please subscribe first.',
        code: 'NO_CUSTOMER'
      }, { status: 404 })
    }

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`
      })

      if (!portalSession.url) {
        return NextResponse.json({ error: 'Failed to generate portal URL' }, { status: 500 })
      }

      return NextResponse.json({ url: portalSession.url })
    } catch (stripeError: any) {
      console.error('Stripe portal session error:', stripeError)

      // Handle specific Stripe errors
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json({
          error: 'Customer not found in Stripe. Please contact support.',
          code: 'CUSTOMER_NOT_FOUND'
        }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
    }
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
