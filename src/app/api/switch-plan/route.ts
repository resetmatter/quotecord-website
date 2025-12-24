import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { getBillingSettings } from '@/lib/billing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPeriod } = await req.json() // 'monthly' or 'annual'

    if (!['monthly', 'annual'].includes(newPeriod)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single() as { data: { stripe_subscription_id: string | null } | null }

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Get the Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)

    // Get billing settings for price IDs
    const billingSettings = await getBillingSettings()
    const newPriceId = newPeriod === 'annual'
      ? billingSettings.annualPriceId
      : billingSettings.monthlyPriceId

    if (!newPriceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    // Check if subscription is on trial
    const isOnTrial = stripeSubscription.status === 'trialing'
    const trialEnd = stripeSubscription.trial_end

    // Update the subscription to the new plan
    // Preserve the trial if one exists
    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: isOnTrial ? 'none' : 'create_prorations'
    }

    // If on trial, preserve the trial end date
    if (isOnTrial && trialEnd) {
      updateParams.trial_end = trialEnd
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      updateParams
    )

    console.log(`Switched subscription ${subscription.stripe_subscription_id} to ${newPeriod}, trial preserved: ${isOnTrial}`)

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.current_period_end,
        trialEnd: updatedSubscription.trial_end,
        interval: updatedSubscription.items.data[0].price.recurring?.interval
      }
    })
  } catch (error) {
    console.error('Switch plan error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to switch plan: ${message}` },
      { status: 500 }
    )
  }
}
