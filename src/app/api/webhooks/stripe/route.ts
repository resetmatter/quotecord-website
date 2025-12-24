import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Use service role for webhook updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const discordId = session.metadata?.discord_id

        if (discordId) {
          // Upgrade to premium and save customer ID
          // Note: Trial periods are applied via subscription_data.trial_period_days at checkout
          await supabase
            .from('subscriptions')
            .update({
              tier: 'premium',
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString()
            })
            .eq('discord_id', discordId)

          console.log(`Upgraded user ${discordId} to premium`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Safely convert timestamps
        const periodStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Map Stripe status to our database status
        // 'active' and 'trialing' are both valid subscriptions
        let dbStatus = 'past_due'
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          dbStatus = 'active'
        }

        const updateData: Record<string, any> = {
          status: dbStatus,
          updated_at: new Date().toISOString()
        }

        if (periodStart) updateData.current_period_start = periodStart
        if (periodEnd) updateData.current_period_end = periodEnd

        await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Updated subscription ${subscription.id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Downgrade to free
        await supabase
          .from('subscriptions')
          .update({
            tier: 'free',
            status: 'cancelled',
            current_period_end: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Cancelled subscription ${subscription.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer as string)

        console.log(`Payment failed for customer ${invoice.customer}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
