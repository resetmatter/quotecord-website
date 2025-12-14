'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Crown, Sparkles, ArrowRight, CheckCircle, Zap, UserPlus } from 'lucide-react'
import { getCurrentUser, UserProfile } from '@/lib/user'

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    getCurrentUser().then(setUser)

    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true)
      setTimeout(() => setShowUpgradeSuccess(false), 5000)
    }
  }, [searchParams])

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active'

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
            {isPremium && user?.subscription?.current_period_end && (
              <p className="text-sm text-dark-500">
                Renews on {new Date(user.subscription.current_period_end).toLocaleDateString()}
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
            name="Watermark"
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
            href="/add"
            className="flex items-center justify-between p-4 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-all group"
          >
            <span>Add quotecord to Another Server</span>
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
            <span>Get Help & Support</span>
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
