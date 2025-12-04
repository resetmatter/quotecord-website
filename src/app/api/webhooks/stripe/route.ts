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

        if (discordId && session.subscription) {
          // Retrieve the subscription to get billing period dates
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Upgrade to premium with billing period info
          const { error } = await supabase
            .from('subscriptions')
            .update({
              tier: 'premium',
              status: 'active',
              stripe_subscription_id: subscription.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('discord_id', discordId)

          if (error) {
            console.error(`Failed to upgrade user ${discordId}:`, error)
          } else {
            console.log(`Upgraded user ${discordId} to premium (period ends: ${new Date(subscription.current_period_end * 1000).toISOString()})`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'past_due',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Updated subscription ${subscription.id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // When subscription is deleted, check if there's remaining time
        // If cancelled mid-period, keep premium until period_end
        const periodEnd = new Date(subscription.current_period_end * 1000)
        const now = new Date()

        if (periodEnd > now) {
          // Keep premium access until period ends, but mark as cancelled
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error(`Failed to update cancelled subscription ${subscription.id}:`, error)
          } else {
            console.log(`Subscription ${subscription.id} cancelled - access until ${periodEnd.toISOString()}`)
          }
        } else {
          // Period has ended, downgrade to free immediately
          const { error } = await supabase
            .from('subscriptions')
            .update({
              tier: 'free',
              status: 'cancelled',
              current_period_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error(`Failed to downgrade subscription ${subscription.id}:`, error)
          } else {
            console.log(`Subscription ${subscription.id} cancelled and downgraded to free`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer as string)

        if (error) {
          console.error(`Failed to update past_due status for customer ${invoice.customer}:`, error)
        } else {
          console.log(`Payment failed for customer ${invoice.customer} - status set to past_due`)
        }
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
