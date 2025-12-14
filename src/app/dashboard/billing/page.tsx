'use client'

import { useState, useEffect } from 'react'
import { Crown, Sparkles, ExternalLink, Shield, Check, Star, ArrowRight } from 'lucide-react'
import { getCurrentUser, UserProfile } from '@/lib/user'

export default function BillingPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active'

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: billingPeriod })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/create-portal', {
        method: 'POST'
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {/* Current Plan */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>

        <div className="flex items-center gap-3 mb-4">
          {isPremium ? (
            <>
              <div className="w-12 h-12 rounded-xl icon-bg-pro flex items-center justify-center">
                <Crown className="w-6 h-6 text-pro-gold" />
              </div>
              <div>
                <p className="font-semibold gradient-text-pro">Pro</p>
                <p className="text-sm text-dark-400">
                  {user?.subscription?.current_period_end
                    ? `Renews ${new Date(user.subscription.current_period_end).toLocaleDateString()}`
                    : 'Active subscription'
                  }
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl icon-bg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold">Free</p>
                <p className="text-sm text-dark-400">Basic features included</p>
              </div>
            </>
          )}
        </div>

        {isPremium && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 disabled:opacity-50 transition-colors"
          >
            Manage Subscription
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upgrade Section (for free users) */}
      {!isPremium && (
        <div className="relative glass rounded-2xl p-6 border-gradient-pro">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-pro-amber to-pro-gold text-dark-900 text-sm font-bold rounded-full shadow-glow-pro">
              <Star className="w-4 h-4" />
              UPGRADE
            </span>
          </div>

          <h2 className="text-lg font-semibold mb-4 mt-2">Upgrade to Pro</h2>

          <ul className="space-y-2 mb-6">
            {[
              'Preview mode',
              'Animated GIF export',
              'Multi-message quotes',
              'Server avatar choice',
              'Save presets',
              'No ads'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-dark-300">
                <Check className="w-4 h-4 text-pro-gold flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Billing Period Toggle */}
          <div className="mb-6">
            <label className="text-sm text-dark-400 mb-2 block">Select billing period</label>
            <div className="flex gap-3">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  billingPeriod === 'monthly'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <div className="font-semibold text-sm">Monthly</div>
                <div className="text-2xl font-bold">$1.99</div>
                <div className="text-sm text-dark-400">/month</div>
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 p-4 rounded-xl border transition-all relative ${
                  billingPeriod === 'annual'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <div className="absolute -top-2 right-2 bg-success text-dark-900 text-xs font-bold px-2 py-0.5 rounded">
                  2 months free
                </div>
                <div className="font-semibold text-sm">Annual</div>
                <div className="text-2xl font-bold">$19.99</div>
                <div className="text-sm text-dark-400">/year</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber disabled:opacity-50 disabled:cursor-not-allowed text-dark-900 font-bold py-3 px-4 rounded-xl transition-all shadow-glow-pro"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex items-center gap-2 justify-center mt-4 text-dark-500 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Secure payment by Stripe. Cancel anytime.
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="mt-6 glass rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-dark-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-400">
          <p className="mb-1">
            All payments are processed securely through Stripe. We never store your card details.
          </p>
          <p>
            Need help with billing? Contact us at{' '}
            <a href="mailto:support@quotecord.app" className="text-brand-400 hover:text-brand-300 transition-colors">
              support@quotecord.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
