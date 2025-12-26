'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Crown, Sparkles, ArrowRight, CheckCircle, Zap, UserPlus, Server, HelpCircle, Calendar, Images } from 'lucide-react'
import { getCurrentUser, UserProfile, getBillingPeriod } from '@/lib/user'

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const [switchingPlan, setSwitchingPlan] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<{
    current_period_start: string | null
    current_period_end: string | null
    billing_interval: 'month' | 'year' | null
  } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    getCurrentUser().then(setUser)

    // Fetch subscription data from API (which fetches from Stripe)
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        if (data.current_period_start || data.current_period_end || data.billing_interval) {
          setSubscriptionData({
            current_period_start: data.current_period_start,
            current_period_end: data.current_period_end,
            billing_interval: data.billing_interval
          })
        }
      })
      .catch(console.error)

    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true)
      setTimeout(() => setShowUpgradeSuccess(false), 5000)
    }
  }, [searchParams])

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active'
  // Use billing_interval from Stripe API (accurate even during trials)
  const periodData = subscriptionData || user?.subscription
  const currentBillingPeriod = subscriptionData?.billing_interval === 'year' ? 'annual'
    : subscriptionData?.billing_interval === 'month' ? 'monthly'
    : periodData ? getBillingPeriod(periodData) : null
  const isMonthlySubscriber = isPremium && currentBillingPeriod === 'monthly'

  // Handle switching from monthly to annual (preserves trial)
  const handleSwitchToAnnual = async () => {
    if (switchingPlan) return

    try {
      setSwitchingPlan(true)
      const res = await fetch('/api/switch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPeriod: 'annual' })
      })

      const data = await res.json()

      if (data.success) {
        // Refresh subscription data
        const subRes = await fetch('/api/subscription')
        const subData = await subRes.json()
        if (subData.billing_interval) {
          setSubscriptionData({
            current_period_start: subData.current_period_start,
            current_period_end: subData.current_period_end,
            billing_interval: subData.billing_interval
          })
        }
        alert('Successfully switched to annual billing! Your trial has been preserved.')
      } else {
        throw new Error(data.error || 'Failed to switch plan')
      }
    } catch (error) {
      console.error('Switch plan error:', error)
      alert(error instanceof Error ? error.message : 'Failed to switch plan')
    } finally {
      setSwitchingPlan(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {showUpgradeSuccess && (
        <div className="bg-success/10 border border-success/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="font-medium text-success">Welcome to Pro!</p>
            <p className="text-sm text-dark-400">Your account has been upgraded. Enjoy all Pro features!</p>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-3">Subscription Status</h2>
            <div className="flex items-center gap-2 mb-3">
              {isPremium ? (
                <>
                  <div className="w-8 h-8 rounded-lg icon-bg-pro flex items-center justify-center">
                    <Crown className="w-4 h-4 text-pro-gold" />
                  </div>
                  <span className="gradient-text-pro font-semibold">Pro</span>
                  {currentBillingPeriod && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      currentBillingPeriod === 'annual'
                        ? 'bg-success/20 text-success'
                        : 'bg-dark-700 text-dark-300'
                    }`}>
                      {currentBillingPeriod === 'annual' ? 'Annual' : 'Monthly'}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg icon-bg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-dark-400">Free Tier</span>
                </>
              )}
            </div>
            {isPremium && periodData?.current_period_end && (
              <p className="text-sm text-dark-500">
                Renews on {new Date(periodData.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          {isPremium ? (
            <Link
              href="/dashboard/billing"
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Manage Subscription
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="group flex items-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 text-sm font-semibold py-2 px-4 rounded-xl transition-all shadow-glow-pro"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Upgrade to Annual (for monthly subscribers) */}
      {isMonthlySubscriber && (
        <div className="glass rounded-2xl p-4 mb-6 border border-success/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Save 16% with Annual billing</p>
              <p className="text-xs text-dark-400">$19.99/year instead of $23.88</p>
            </div>
            <button
              onClick={handleSwitchToAnnual}
              disabled={switchingPlan}
              className="text-xs bg-success/20 hover:bg-success/30 disabled:opacity-50 text-success font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {switchingPlan ? 'Switching...' : 'Switch'}
            </button>
          </div>
        </div>
      )}

      {/* Your Quote Archive - Prominent Gallery CTA */}
      <div className="glass rounded-2xl p-6 mb-6 border border-brand-500/30 bg-gradient-to-br from-dark-800 to-dark-800/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Images className="w-5 h-5 text-brand-400" />
              </div>
              <h2 className="text-lg font-semibold">Your Quote Archive</h2>
            </div>
            <p className="text-dark-400 text-sm mb-4 ml-[52px]">
              Every quote you've ever created is saved here. Browse, search, and revisit your favorite moments anytime.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/gallery"
          className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-4 rounded-xl transition-all group"
        >
          <Images className="w-4 h-4" />
          Open Gallery
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Feature Access */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Features</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <FeatureStatus
            name="Quote Creation"
            status="Unlimited"
            available
          />
          <FeatureStatus
            name="Templates"
            status="All 3"
            available
          />
          <FeatureStatus
            name="Fonts"
            status="All 19"
            available
          />
          <FeatureStatus
            name="Themes"
            status="Dark & Light"
            available
          />
          <FeatureStatus
            name="Preview Mode"
            status={isPremium ? 'Enabled' : 'Pro Only'}
            available={isPremium}
          />
          <FeatureStatus
            name="Animated GIFs"
            status={isPremium ? 'Enabled' : 'Pro Only'}
            available={isPremium}
          />
          <FeatureStatus
            name="Multi-Message"
            status={isPremium ? 'Up to 5' : 'Pro Only'}
            available={isPremium}
          />
          <FeatureStatus
            name="Ads"
            status={isPremium ? 'Removed' : 'Enabled'}
            available={isPremium}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="space-y-3">
          <Link
            href="/dashboard/gallery"
            className="flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-all group"
          >
            <span className="flex items-center gap-2">
              <Images className="w-4 h-4 text-brand-400" />
              Browse Your Quote Archive
            </span>
            <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
          <Link
            href="/add"
            className="flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-all group"
          >
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-400" />
              Add quotecord to Another Server
            </span>
            <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1439621877285785711&integration_type=1&scope=applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-all group"
          >
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-400" />
              Install as User App
            </span>
            <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </a>
          <Link
            href="/support"
            className="flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-all group"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-400" />
              Get Help & Support
            </span>
            <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureStatus({
  name,
  status,
  available
}: {
  name: string
  status: string
  available: boolean
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
      <span className="text-sm">{name}</span>
      <span className={`text-sm font-medium ${available ? 'text-success' : 'text-dark-500'}`}>
        {status}
      </span>
    </div>
  )
}
