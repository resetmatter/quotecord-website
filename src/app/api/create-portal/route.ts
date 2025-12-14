import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST() {
  try {
    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      console.error('Portal failed: No user', userError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single() as { data: { stripe_customer_id: string | null; stripe_subscription_id: string | null } | null }

    let customerId = subscription?.stripe_customer_id

    // If no customer ID stored, try to get it from the subscription
    if (!customerId && subscription?.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
        customerId = stripeSubscription.customer as string

        // Save for future use
        if (customerId) {
          await (supabase as any)
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', user.id)
        }
      } catch (e) {
        console.error('Failed to retrieve subscription from Stripe:', e)
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
