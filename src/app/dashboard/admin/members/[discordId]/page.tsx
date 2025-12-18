'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  User,
  Crown,
  Clock,
  Mail,
  CreditCard,
  Flag,
  Shield,
  Images,
  Palette,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle,
  Save,
  Zap,
  ExternalLink,
  Copy,
  Image as ImageIcon,
  Eye,
  MessageSquare,
  CircleUser,
  Droplet,
  Database,
  Calendar,
  Hash,
  Activity
} from 'lucide-react'

interface MemberDetails {
  profile: {
    id: string
    discordId: string
    discordUsername: string | null
    discordAvatar: string | null
    email: string | null
    createdAt: string
    updatedAt: string
  }
  subscription: {
    id: string
    tier: string
    status: string
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    createdAt: string
    updatedAt: string
  } | null
  featureFlags: {
    id: string
    premiumOverride: boolean | null
    overrideAnimatedGifs: boolean | null
    overridePreview: boolean | null
    overrideMultiMessage: boolean | null
    overrideAvatarChoice: boolean | null
    overridePresets: boolean | null
    overrideNoWatermark: boolean | null
    overrideMaxGallerySize: number | null
    reason: string | null
    createdBy: string | null
    expiresAt: string | null
    createdAt: string
    updatedAt: string
  } | null
  effectiveAccess: {
    isPremium: boolean
    premiumSource: string
    features: {
      animatedGifs: boolean
      preview: boolean
      multiMessage: boolean
      avatarChoice: boolean
      presets: boolean
      noWatermark: boolean
      galleryStorage: boolean
      maxGallerySize: number
    }
    hasOverrides: boolean
    hasGlobalOverrides: boolean
    debug: {
      globalPremiumOverride: boolean | null
      individualPremiumOverride: boolean | null
      hasActiveSubscription: boolean
      subscriptionTier: string | null
      subscriptionStatus: string | null
      subscriptionEndDate: string | null
    }
  }
  stats: {
    totalQuotesGenerated: number
    galleryQuotes: number
    presetCount: number
    accountAge: number
    lastUpdated: string
  }
  recentQuotes: Array<{
    id: string
    fileName: string
    filePath: string
    publicUrl: string | null
    template: string
    font: string
    theme: string
    animated: boolean
    quoteText: string | null
    authorName: string | null
    privacyMode: string | null
    createdAt: string
  }>
  presets: Array<{
    id: string
    name: string
    template: string
    font: string
    theme: string
    orientation: string | null
    createdAt: string
  }>
}

interface FeatureFlagForm {
  premiumOverride: boolean | null
  overrideAnimatedGifs: boolean | null
  overridePreview: boolean | null
  overrideMultiMessage: boolean | null
  overrideAvatarChoice: boolean | null
  overridePresets: boolean | null
  overrideNoWatermark: boolean | null
  overrideMaxGallerySize: number | null
  reason: string
  createdBy: string
  expiresAt: string | null
}

const FEATURE_OPTIONS = [
  { key: 'overrideAnimatedGifs', label: 'Animated GIFs', icon: ImageIcon, description: 'Create animated GIF quotes' },
  { key: 'overridePreview', label: 'Preview', icon: Eye, description: 'Preview quotes before posting' },
  { key: 'overrideMultiMessage', label: 'Multi-Message', icon: MessageSquare, description: 'Combine up to 5 messages' },
  { key: 'overrideAvatarChoice', label: 'Avatar Choice', icon: CircleUser, description: 'Choose avatar source' },
  { key: 'overridePresets', label: 'Presets', icon: Palette, description: 'Save custom style presets' },
  { key: 'overrideNoWatermark', label: 'Ad-Free', icon: Droplet, description: 'Remove ads from quotes' },
] as const

export default function MemberDetailPage() {
  const router = useRouter()
  const params = useParams()
  const discordId = params.discordId as string

  const [member, setMember] = useState<MemberDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'quotes'>('overview')

  // Form state for feature flags
  const [flagForm, setFlagForm] = useState<FeatureFlagForm>({
    premiumOverride: null,
    overrideAnimatedGifs: null,
    overridePreview: null,
    overrideMultiMessage: null,
    overrideAvatarChoice: null,
    overridePresets: null,
    overrideNoWatermark: null,
    overrideMaxGallerySize: null,
    reason: '',
    createdBy: '',
    expiresAt: null
  })

  // API Key helper
  const getApiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminApiKey') || ''
    }
    return ''
  }

  // Fetch member details
  const fetchMember = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/members/${discordId}`, {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please check your API key')
        }
        if (response.status === 404) {
          throw new Error('Member not found')
        }
        throw new Error('Failed to fetch member details')
      }

      const data: MemberDetails = await response.json()
      setMember(data)

      // Initialize form with existing flags
      if (data.featureFlags) {
        setFlagForm({
          premiumOverride: data.featureFlags.premiumOverride,
          overrideAnimatedGifs: data.featureFlags.overrideAnimatedGifs,
          overridePreview: data.featureFlags.overridePreview,
          overrideMultiMessage: data.featureFlags.overrideMultiMessage,
          overrideAvatarChoice: data.featureFlags.overrideAvatarChoice,
          overridePresets: data.featureFlags.overridePresets,
          overrideNoWatermark: data.featureFlags.overrideNoWatermark,
          overrideMaxGallerySize: data.featureFlags.overrideMaxGallerySize,
          reason: data.featureFlags.reason || '',
          createdBy: data.featureFlags.createdBy || '',
          expiresAt: data.featureFlags.expiresAt
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member')
    } finally {
      setLoading(false)
    }
  }, [discordId])

  useEffect(() => {
    if (discordId) {
      fetchMember()
    }
  }, [discordId, fetchMember])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Save feature flags
  const handleSaveFlags = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          discordId,
          premiumOverride: flagForm.premiumOverride,
          overrideAnimatedGifs: flagForm.overrideAnimatedGifs,
          overridePreview: flagForm.overridePreview,
          overrideMultiMessage: flagForm.overrideMultiMessage,
          overrideAvatarChoice: flagForm.overrideAvatarChoice,
          overridePresets: flagForm.overridePresets,
          overrideNoWatermark: flagForm.overrideNoWatermark,
          overrideMaxGallerySize: flagForm.overrideMaxGallerySize,
          reason: flagForm.reason || null,
          createdBy: flagForm.createdBy || null,
          expiresAt: flagForm.expiresAt || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save feature flags')
      }

      setSuccess('Feature flags saved successfully')
      fetchMember() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feature flags')
    } finally {
      setSaving(false)
    }
  }

  // Delete feature flags
  const handleDeleteFlags = async () => {
    if (!confirm('Are you sure you want to remove all feature flag overrides for this user?')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/feature-flags?discordId=${discordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove feature flags')
      }

      setSuccess('Feature flags removed successfully')
      // Reset form
      setFlagForm({
        premiumOverride: null,
        overrideAnimatedGifs: null,
        overridePreview: null,
        overrideMultiMessage: null,
        overrideAvatarChoice: null,
        overridePresets: null,
        overrideNoWatermark: null,
        overrideMaxGallerySize: null,
        reason: '',
        createdBy: '',
        expiresAt: null
      })
      fetchMember() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove feature flags')
    } finally {
      setSaving(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !member) {
    return (
      <div className="max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </button>
        <div className="bg-error/10 border border-error/50 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-error mb-2">Error Loading Member</h2>
          <p className="text-dark-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!member) return null

  return (
    <div className="max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </button>

      {/* Success Message */}
      {success && (
        <div className="bg-success/10 border border-success/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-dark-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      )}

      {/* Member Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            {member.profile.discordAvatar ? (
              <Image
                src={member.profile.discordAvatar}
                alt={member.profile.discordUsername || 'User'}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
                <User className="w-8 h-8 text-brand-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {member.profile.discordUsername || 'Unknown User'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {member.effectiveAccess.isPremium ? (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-pro-gold/20 text-pro-gold">
                    <Crown className="w-3 h-3" />
                    Premium ({member.effectiveAccess.premiumSource})
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-dark-700 text-dark-400">
                    Free
                  </span>
                )}
                {member.featureFlags && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                    <Flag className="w-3 h-3" />
                    Has Overrides
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={fetchMember}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'text-brand-400 border-brand-500'
              : 'text-dark-400 border-transparent hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'flags'
              ? 'text-brand-400 border-brand-500'
              : 'text-dark-400 border-transparent hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4" />
          Manage Access
          {member.featureFlags && <span className="w-2 h-2 rounded-full bg-purple-500" />}
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'quotes'
              ? 'text-brand-400 border-brand-500'
              : 'text-dark-400 border-transparent hover:text-white'
          }`}
        >
          <Images className="w-4 h-4" />
          Quotes
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-300">
            {member.stats.galleryQuotes}
          </span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-dark-400 mb-2">
                <Images className="w-4 h-4" />
                <span className="text-xs">Gallery Quotes</span>
              </div>
              <p className="text-2xl font-bold">{member.stats.galleryQuotes}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-dark-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Total Generated</span>
              </div>
              <p className="text-2xl font-bold">{member.stats.totalQuotesGenerated}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-dark-400 mb-2">
                <Palette className="w-4 h-4" />
                <span className="text-xs">Presets</span>
              </div>
              <p className="text-2xl font-bold">{member.stats.presetCount}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-dark-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Account Age</span>
              </div>
              <p className="text-2xl font-bold">{member.stats.accountAge} days</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" />
              Profile Details
            </h2>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-dark-400">
                  <Hash className="w-4 h-4" />
                  <span>Discord ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm">{member.profile.discordId}</code>
                  <button
                    onClick={() => copyToClipboard(member.profile.discordId)}
                    className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-dark-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-dark-400">
                  <User className="w-4 h-4" />
                  <span>Username</span>
                </div>
                <span>{member.profile.discordUsername || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-dark-400">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <span>{member.profile.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-dark-400">
                  <Clock className="w-4 h-4" />
                  <span>Account Created</span>
                </div>
                <span>{formatDate(member.profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-400" />
              Subscription
            </h2>
            {member.subscription ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                  <span className="text-dark-400">Tier</span>
                  <span className={`font-medium capitalize ${member.subscription.tier === 'premium' ? 'text-pro-gold' : ''}`}>
                    {member.subscription.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                  <span className="text-dark-400">Status</span>
                  <span className={`font-medium capitalize ${
                    member.subscription.status === 'active' ? 'text-success' :
                    member.subscription.status === 'cancelled' ? 'text-warning' : 'text-error'
                  }`}>
                    {member.subscription.status}
                  </span>
                </div>
                {member.subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                    <span className="text-dark-400">Period Ends</span>
                    <span>{formatDate(member.subscription.currentPeriodEnd)}</span>
                  </div>
                )}
                {member.subscription.stripeCustomerId && (
                  <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                    <span className="text-dark-400">Stripe Customer</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{member.subscription.stripeCustomerId}</code>
                      <button
                        onClick={() => copyToClipboard(member.subscription!.stripeCustomerId!)}
                        className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-dark-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-dark-400 text-center py-4">No subscription record</p>
            )}
          </div>

          {/* Effective Access */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              Effective Access
            </h2>
            <p className="text-sm text-dark-400 mb-4">
              What this user actually has access to, considering global flags, individual overrides, and subscription.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Animated GIFs', value: member.effectiveAccess.features.animatedGifs },
                { label: 'Preview', value: member.effectiveAccess.features.preview },
                { label: 'Multi-Message', value: member.effectiveAccess.features.multiMessage },
                { label: 'Avatar Choice', value: member.effectiveAccess.features.avatarChoice },
                { label: 'Presets', value: member.effectiveAccess.features.presets },
                { label: 'Ad-Free', value: member.effectiveAccess.features.noWatermark },
              ].map(feature => (
                <div
                  key={feature.label}
                  className={`p-3 rounded-xl border ${
                    feature.value
                      ? 'bg-success/10 border-success/30'
                      : 'bg-dark-800/50 border-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{feature.label}</span>
                    <span className={`text-xs font-medium ${feature.value ? 'text-success' : 'text-dark-500'}`}>
                      {feature.value ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-dark-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Gallery Limit</span>
                <span className="font-medium">
                  {member.effectiveAccess.features.maxGallerySize === Infinity
                    ? 'Unlimited'
                    : member.effectiveAccess.features.maxGallerySize}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Access Tab */}
      {activeTab === 'flags' && (
        <div className="space-y-6">
          {/* Quick Premium Toggle */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Premium Override</h2>
            <p className="text-sm text-dark-400 mb-4">
              Quickly grant or revoke premium access for this user, overriding their subscription status.
              This is ideal for testers, partners, or special cases.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: true, label: 'Grant Premium', icon: Crown, color: 'pro-gold', desc: 'Full premium access' },
                { value: null, label: 'Use Subscription', icon: User, color: 'brand-400', desc: 'Normal billing' },
                { value: false, label: 'Force Free', icon: Zap, color: 'dark-400', desc: 'Revoke premium' },
              ].map(option => (
                <button
                  key={String(option.value)}
                  onClick={() => setFlagForm(prev => ({ ...prev, premiumOverride: option.value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    flagForm.premiumOverride === option.value
                      ? option.value === true
                        ? 'border-pro-gold bg-pro-gold/20'
                        : option.value === false
                        ? 'border-dark-500 bg-dark-800'
                        : 'border-brand-500 bg-brand-500/20'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <option.icon className={`w-6 h-6 ${
                    flagForm.premiumOverride === option.value
                      ? option.value === true
                        ? 'text-pro-gold'
                        : option.value === false
                        ? 'text-dark-400'
                        : 'text-brand-400'
                      : 'text-dark-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    flagForm.premiumOverride === option.value ? 'text-white' : 'text-dark-400'
                  }`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-dark-500 text-center">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Feature Overrides */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Individual Feature Overrides</h2>
            <p className="text-sm text-dark-400 mb-4">
              Override specific features regardless of premium status.
            </p>
            <div className="space-y-3">
              {FEATURE_OPTIONS.map(feature => {
                const value = flagForm[feature.key as keyof FeatureFlagForm] as boolean | null
                return (
                  <div key={feature.key} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-5 h-5 text-dark-400" />
                      <div>
                        <span className="text-sm font-medium">{feature.label}</span>
                        <p className="text-xs text-dark-500">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[
                        { v: true, label: 'On', color: 'success' },
                        { v: null, label: 'Default', color: 'dark-400' },
                        { v: false, label: 'Off', color: 'error' },
                      ].map(opt => (
                        <button
                          key={String(opt.v)}
                          onClick={() => setFlagForm(prev => ({ ...prev, [feature.key]: opt.v }))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            value === opt.v
                              ? opt.v === true
                                ? 'bg-success/20 text-success'
                                : opt.v === false
                                ? 'bg-error/20 text-error'
                                : 'bg-dark-700 text-white'
                              : 'text-dark-500 hover:text-dark-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Storage Quota */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-dark-400" />
              Storage Quota Override
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Leave empty for default"
                value={flagForm.overrideMaxGallerySize ?? ''}
                onChange={(e) => setFlagForm(prev => ({
                  ...prev,
                  overrideMaxGallerySize: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              <span className="text-sm text-dark-500">quotes</span>
            </div>
            <p className="text-xs text-dark-500 mt-2">
              Free: 50 | Premium: Unlimited | Custom: any number
            </p>
          </div>

          {/* Metadata */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Override Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Beta tester, Partner account"
                  value={flagForm.reason}
                  onChange={(e) => setFlagForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Set By</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={flagForm.createdBy}
                  onChange={(e) => setFlagForm(prev => ({ ...prev, createdBy: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Expiration Date</label>
              <input
                type="datetime-local"
                value={flagForm.expiresAt ? new Date(flagForm.expiresAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFlagForm(prev => ({
                  ...prev,
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null
                }))}
                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              <p className="text-xs text-dark-500 mt-2">
                Leave empty for no expiration (permanent override)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {member.featureFlags && (
              <button
                onClick={handleDeleteFlags}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-error/20 hover:bg-error/30 text-error rounded-xl transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Remove All Overrides
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleSaveFlags}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {member.recentQuotes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Images className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No quotes in gallery</p>
              <p className="text-sm text-dark-500 mt-1">
                This user hasn&apos;t saved any quotes yet
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-dark-400">
                  Showing {member.recentQuotes.length} of {member.stats.galleryQuotes} quotes
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {member.recentQuotes.map(quote => (
                  <div key={quote.id} className="glass rounded-xl overflow-hidden">
                    {quote.publicUrl && (
                      <div className="relative aspect-video bg-dark-800">
                        <Image
                          src={quote.publicUrl}
                          alt={quote.fileName}
                          fill
                          className="object-contain"
                        />
                        {quote.animated && (
                          <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-dark-900/80 text-white">
                            GIF
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-dark-500 mb-2">
                        <span className="capitalize">{quote.template}</span>
                        <span>•</span>
                        <span>{quote.theme}</span>
                        <span>•</span>
                        <span>{quote.font}</span>
                      </div>
                      {quote.quoteText && (
                        <p className="text-sm text-dark-300 truncate mb-2">
                          &ldquo;{quote.quoteText}&rdquo;
                        </p>
                      )}
                      {quote.authorName && (
                        <p className="text-xs text-dark-500">— {quote.authorName}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
                        <span className="text-xs text-dark-500">
                          {formatDate(quote.createdAt)}
                        </span>
                        {quote.privacyMode && (
                          <span className="text-xs text-dark-500 capitalize">
                            {quote.privacyMode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Presets Section */}
          {member.presets.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-400" />
                Saved Presets
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {member.presets.map(preset => (
                  <div key={preset.id} className="p-3 bg-dark-800/50 rounded-xl">
                    <p className="font-medium text-sm truncate">{preset.name}</p>
                    <p className="text-xs text-dark-500 mt-1">
                      {preset.template} • {preset.theme}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
