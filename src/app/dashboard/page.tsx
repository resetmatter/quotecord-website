'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Crown, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
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
        <div className="bg-discord-green/10 border border-discord-green/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-discord-green" />
          <div>
            <p className="font-medium text-discord-green">Welcome to Premium!</p>
            <p className="text-sm text-gray-400">Your account has been upgraded. Enjoy all premium features!</p>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Subscription Status</h2>
            <div className="flex items-center gap-2 mb-4">
              {isPremium ? (
                <>
                  <Crown className="w-5 h-5 text-premium-gold" />
                  <span className="text-premium-gold font-medium">Premium</span>
                </>
              ) : (
                <span className="text-gray-400">Free Tier</span>
              )}
            </div>
            {isPremium && user?.subscription?.current_period_end && (
              <p className="text-sm text-gray-500">
                Renews on {new Date(user.subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          {isPremium ? (
            <Link
              href="/dashboard/billing"
              className="text-sm text-discord-blurple hover:underline"
            >
              Manage Subscription
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="bg-discord-blurple hover:bg-discord-blurple/80 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Feature Access */}
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Features</h2>

        <div className="grid sm:grid-cols-2 gap-4">
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
            status={isPremium ? 'Enabled' : 'Premium Only'}
            available={isPremium}
          />
          <FeatureStatus
            name="Animated GIFs"
            status={isPremium ? 'Enabled' : 'Premium Only'}
            available={isPremium}
          />
          <FeatureStatus
            name="Multi-Message"
            status={isPremium ? 'Up to 5' : 'Premium Only'}
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
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="space-y-3">
          <Link
            href="/add"
            className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>Add DisQuote to Another Server</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>Get Help & Support</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
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
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <span className="text-sm">{name}</span>
      <span className={`text-sm ${available ? 'text-discord-green' : 'text-gray-500'}`}>
        {status}
      </span>
    </div>
  )
}
