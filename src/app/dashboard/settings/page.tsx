'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import { getCurrentUser, UserProfile } from '@/lib/user'

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Info */}
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          {user.discord_avatar ? (
            <Image
              src={user.discord_avatar}
              alt={user.discord_username || 'User'}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-discord-blurple rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium">
                {user.discord_username?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-lg">{user.discord_username}</p>
            <p className="text-sm text-gray-400">Connected via Discord</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-400">
            <User className="w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500">Discord ID</p>
              <p className="text-sm text-white">{user.discord_id}</p>
            </div>
          </div>

          {user.email && (
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-white">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-sm text-white">
                {/* This would come from profile.created_at in a real implementation */}
                Recently joined
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <Shield className="w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500">Subscription</p>
              <p className="text-sm text-white">
                {user.subscription.tier === 'premium' ? 'Premium' : 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-discord-darker border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Data & Privacy</h2>

        <p className="text-gray-400 text-sm mb-4">
          Your data is stored securely and is only used to provide the quotecord service.
          We never sell or share your data with third parties.
        </p>

        <div className="flex gap-4">
          <a
            href="/privacy"
            className="text-sm text-discord-blurple hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm text-discord-blurple hover:underline"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  )
}
