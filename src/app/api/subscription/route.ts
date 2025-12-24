import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function GET() {
  try {
    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      console.error('Subscription fetch failed: No user', userError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: {
        stripe_subscription_id: string | null
        current_period_start: string | null
        current_period_end: string | null
        [key: string]: any
      } | null }

    // If we have a Stripe subscription, fetch additional details
    if (subscription?.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)

        const periodStart = stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
          : null

        // Get billing interval from the subscription's price
        const billingInterval = stripeSubscription.items.data[0]?.price?.recurring?.interval || null

        // Update the database with the dates if they were missing
        if (periodStart && periodEnd && (!subscription.current_period_start || !subscription.current_period_end)) {
          await (supabase as any)
            .from('subscriptions')
            .update({
              current_period_start: periodStart,
              current_period_end: periodEnd
            })
            .eq('user_id', user.id)
        }

        // Return subscription data with billing interval
        return NextResponse.json({
          ...subscription,
          current_period_start: periodStart || subscription.current_period_start,
          current_period_end: periodEnd || subscription.current_period_end,
          billing_interval: billingInterval // 'month' or 'year'
        })
      } catch (e) {
        console.error('Failed to fetch subscription from Stripe:', e)
      }
    }

    return NextResponse.json(subscription || { tier: 'free', status: 'active' })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
