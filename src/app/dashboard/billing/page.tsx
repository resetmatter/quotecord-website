'use client'

import { useState, useEffect } from 'react'
import { Crown, Sparkles, ExternalLink, AlertCircle } from 'lucide-react'
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
      alert('Failed to start checkout. Please try again.')
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
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>

        <div className="flex items-center gap-3 mb-4">
          {isPremium ? (
            <>
              <div className="w-12 h-12 bg-premium-gold/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-premium-gold" />
              </div>
              <div>
                <p className="font-semibold">Premium</p>
                <p className="text-sm text-gray-400">
                  {user?.subscription?.current_period_end
                    ? `Renews ${new Date(user.subscription.current_period_end).toLocaleDateString()}`
                    : 'Active subscription'
                  }
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold">Free</p>
                <p className="text-sm text-gray-400">Basic features included</p>
              </div>
            </>
          )}
        </div>

        {isPremium && (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="text-sm text-discord-blurple hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            Manage Subscription
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upgrade Section (for free users) */}
      {!isPremium && (
        <div className="bg-gradient-to-b from-discord-blurple/20 to-discord-darker border border-discord-blurple/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Upgrade to Premium</h2>

          <p className="text-gray-400 mb-6">
            Unlock animated GIFs, preview mode, multi-message quotes, and remove watermarks.
          </p>

          {/* Billing Period Toggle */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Select billing period</label>
            <div className="flex gap-3">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'border-discord-blurple bg-discord-blurple/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">Monthly</div>
                <div className="text-2xl font-bold">$1.99</div>
                <div className="text-sm text-gray-400">/month</div>
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 p-4 rounded-lg border transition-colors relative ${
                  billingPeriod === 'annual'
                    ? 'border-discord-blurple bg-discord-blurple/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="absolute -top-2 right-2 bg-discord-green text-black text-xs font-semibold px-2 py-0.5 rounded">
                  Save 37%
                </div>
                <div className="font-semibold">Annual</div>
                <div className="text-2xl font-bold">$14.99</div>
                <div className="text-sm text-gray-400">/year</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-discord-blurple hover:bg-discord-blurple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400">
          <p className="mb-1">
            All payments are processed securely through Stripe. We never store your card details.
          </p>
          <p>
            Need help with billing? Contact us at{' '}
            <a href="mailto:support@disquote.app" className="text-discord-blurple hover:underline">
              support@disquote.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
