'use client'

import { useState, useEffect } from 'react'
import { Crown, Sparkles, ExternalLink, Shield, Check, Star, ArrowRight, Calendar, Tag, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { getCurrentUser, UserProfile, getBillingPeriod } from '@/lib/user'

export default function BillingPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState<{
    checking: boolean
    valid: boolean | null
    trialDays: number | null
    error: string | null
  }>({ checking: false, valid: null, trialDays: null, error: null })
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<{
    current_period_start: string | null
    current_period_end: string | null
    billing_interval: 'month' | 'year' | null
    status: string | null
  } | null>(null)
  const [allowPromoCodes, setAllowPromoCodes] = useState(true)
  const [switchingPlan, setSwitchingPlan] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    getCurrentUser().then(setUser)

    // Fetch subscription data from API (which fetches from Stripe)
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        if (data.current_period_start || data.current_period_end || data.billing_interval || data.stripe_status) {
          setSubscriptionData({
            current_period_start: data.current_period_start,
            current_period_end: data.current_period_end,
            billing_interval: data.billing_interval,
            status: data.stripe_status || null
          })
        }
      })
      .catch(console.error)

    // Fetch billing settings to check if promo codes are enabled
    fetch('/api/billing/checkout-settings')
      .then(res => res.json())
      .then(data => {
        if (data.allowPromotionCodes !== undefined) {
          setAllowPromoCodes(data.allowPromotionCodes)
        }
      })
      .catch(console.error)
  }, [])

  // Validate promo code
  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoStatus({ checking: false, valid: null, trialDays: null, error: null })
      return
    }

    setPromoStatus({ checking: true, valid: null, trialDays: null, error: null })

    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })
      const data = await res.json()

      if (data.valid) {
        setPromoStatus({ checking: false, valid: true, trialDays: data.trialDays, error: null })
      } else {
        setPromoStatus({ checking: false, valid: false, trialDays: null, error: data.error || 'Invalid code' })
      }
    } catch {
      setPromoStatus({ checking: false, valid: false, trialDays: null, error: 'Failed to check code' })
    }
  }

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active'
  // Use billing_interval from Stripe API (accurate even during trials)
  // Fall back to date calculation only if API data not available
  const periodData = subscriptionData || user?.subscription
  const currentBillingPeriod = subscriptionData?.billing_interval === 'year' ? 'annual'
    : subscriptionData?.billing_interval === 'month' ? 'monthly'
    : periodData ? getBillingPeriod(periodData) : null
  const isMonthlySubscriber = isPremium && currentBillingPeriod === 'monthly'
  const isOnTrial = subscriptionData?.status === 'trialing'

  // Handle switching plans (preserves trial)
  const handleSwitchPlan = async (newPeriod: 'monthly' | 'annual') => {
    if (switchingPlan) return

    try {
      setSwitchingPlan(true)
      const res = await fetch('/api/switch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPeriod })
      })

      const data = await res.json()

      if (data.success) {
        // Refresh user data (for isPremium check)
        const refreshedUser = await getCurrentUser()
        setUser(refreshedUser)

        // Refresh subscription data from Stripe
        const subRes = await fetch('/api/subscription')
        const subData = await subRes.json()
        setSubscriptionData({
          current_period_start: subData.current_period_start,
          current_period_end: subData.current_period_end,
          billing_interval: subData.billing_interval,
          status: subData.stripe_status
        })
        setToast({
          type: 'success',
          message: `Successfully switched to ${newPeriod} billing!${isOnTrial ? ' Your trial has been preserved.' : ''}`
        })
      } else {
        throw new Error(data.error || 'Failed to switch plan')
      }
    } catch (error) {
      console.error('Switch plan error:', error)
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to switch plan'
      })
    } finally {
      setSwitchingPlan(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: billingPeriod,
          promoCode: promoStatus.valid ? promoCode.trim().toUpperCase() : undefined
        })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      })
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
      setToast({
        type: 'error',
        message: 'Failed to open billing portal. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-in ${
          toast.type === 'success'
            ? 'bg-dark-900/90 border-success/30 text-success'
            : 'bg-dark-900/90 border-error/30 text-error'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <p className="font-semibold gradient-text-pro">Pro</p>
                  {currentBillingPeriod && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      currentBillingPeriod === 'annual'
                        ? 'bg-success/20 text-success'
                        : 'bg-dark-700 text-dark-300'
                    }`}>
                      {currentBillingPeriod === 'annual' ? 'Annual' : 'Monthly'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-dark-400">
                  {periodData?.current_period_end
                    ? `Renews ${new Date(periodData.current_period_end).toLocaleDateString()}`
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

        {isPremium && !isOnTrial && (
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

      {/* Trial Info */}
      {isPremium && isOnTrial && (
        <div className="glass rounded-2xl p-4 mb-6 border border-brand-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium">You&apos;re on a free trial!</p>
              <p className="text-xs text-dark-400">
                Your {currentBillingPeriod} plan will start billing on {periodData?.current_period_end ? new Date(periodData.current_period_end).toLocaleDateString() : 'trial end'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Annual (for monthly subscribers) */}
      {isMonthlySubscriber && (
        <div className="glass rounded-2xl p-6 mb-6 border border-success/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Save 16% with Annual</h3>
              <p className="text-sm text-dark-400 mb-3">
                Switch to annual billing for just $19.99/year (instead of $23.88/year on monthly).
                {isOnTrial ? ' Your trial will be preserved!' : ' Your unused monthly balance will be credited.'}
              </p>
              <button
                onClick={() => handleSwitchPlan('annual')}
                disabled={switchingPlan}
                className="text-sm bg-success/20 hover:bg-success/30 text-success font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {switchingPlan ? 'Switching...' : 'Switch to Annual'}
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Promo Code - only show if enabled in billing settings */}
          {allowPromoCodes && (
          <div className="mb-6">
            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="text-sm text-dark-400 hover:text-dark-300 flex items-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                Have a promo code?
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase()
                      setPromoCode(code)
                      // Reset status when typing
                      if (promoStatus.valid !== null) {
                        setPromoStatus({ checking: false, valid: null, trialDays: null, error: null })
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && promoCode.trim()) {
                        validatePromoCode(promoCode)
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => validatePromoCode(promoCode)}
                    disabled={!promoCode.trim() || promoStatus.checking}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {promoStatus.checking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoInput(false)
                      setPromoCode('')
                      setPromoStatus({ checking: false, valid: null, trialDays: null, error: null })
                    }}
                    className="p-2 text-dark-400 hover:text-dark-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {promoStatus.valid === true && promoStatus.trialDays && (
                  <div className="flex items-center gap-2 text-success text-sm bg-success/10 px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span><strong>{promoStatus.trialDays} days free!</strong> You won&apos;t be charged until the trial ends.</span>
                  </div>
                )}
                {promoStatus.valid === false && promoStatus.error && (
                  <p className="text-error text-sm">{promoStatus.error}</p>
                )}
              </div>
            )}
          </div>
          )}

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
                {promoStatus.valid && promoStatus.trialDays ? 'Start Free Trial' : 'Upgrade Now'}
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
            <a href="mailto:support@quotecord.com" className="text-brand-400 hover:text-brand-300 transition-colors">
              support@quotecord.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
