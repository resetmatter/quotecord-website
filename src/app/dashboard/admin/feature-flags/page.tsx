'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  Plus,
  Search,
  Trash2,
  Edit3,
  Crown,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Eye,
  MessageSquare,
  CircleUser,
  Palette,
  Droplet,
  Database,
  Globe,
  Save,
  RotateCcw,
  Info
} from 'lucide-react'

// Types
interface GlobalFeatureFlags {
  globalPremiumOverride: boolean | null
  globalAnimatedGifs: boolean | null
  globalPreview: boolean | null
  globalMultiMessage: boolean | null
  globalAvatarChoice: boolean | null
  globalPresets: boolean | null
  globalNoWatermark: boolean | null
  globalMaxGallerySize: number | null
  reason: string | null
  updatedBy: string | null
  updatedAt: string | null
}

interface FeatureFlag {
  id?: string
  discordId: string
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
  createdAt?: string
}

interface FeatureFlagListItem {
  discordId: string
  premiumOverride: boolean | null
  reason: string | null
  createdBy: string | null
  expiresAt: string | null
  createdAt: string
}

type TabType = 'global' | 'users'

const GLOBAL_FEATURE_OPTIONS = [
  { key: 'globalAnimatedGifs', label: 'Animated GIFs', icon: ImageIcon, description: 'Create animated GIF quotes from animated avatars' },
  { key: 'globalPreview', label: 'Preview', icon: Eye, description: 'Preview quotes before posting to channel' },
  { key: 'globalMultiMessage', label: 'Multi-Message', icon: MessageSquare, description: 'Combine up to 5 messages in one quote' },
  { key: 'globalAvatarChoice', label: 'Avatar Choice', icon: CircleUser, description: 'Choose between server and default avatar' },
  { key: 'globalPresets', label: 'Presets', icon: Palette, description: 'Save up to 10 custom style presets' },
  { key: 'globalNoWatermark', label: 'No Watermark', icon: Droplet, description: 'Remove watermark from generated quotes' },
] as const

const USER_FEATURE_OPTIONS = [
  { key: 'overrideAnimatedGifs', label: 'Animated GIFs', icon: ImageIcon },
  { key: 'overridePreview', label: 'Preview', icon: Eye },
  { key: 'overrideMultiMessage', label: 'Multi-Message', icon: MessageSquare },
  { key: 'overrideAvatarChoice', label: 'Avatar Choice', icon: CircleUser },
  { key: 'overridePresets', label: 'Presets', icon: Palette },
  { key: 'overrideNoWatermark', label: 'No Watermark', icon: Droplet },
] as const

export default function FeatureFlagsAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('global')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Global Flags State
  const [globalFlags, setGlobalFlags] = useState<GlobalFeatureFlags>({
    globalPremiumOverride: null,
    globalAnimatedGifs: null,
    globalPreview: null,
    globalMultiMessage: null,
    globalAvatarChoice: null,
    globalPresets: null,
    globalNoWatermark: null,
    globalMaxGallerySize: null,
    reason: null,
    updatedBy: null,
    updatedAt: null
  })
  const [globalLoading, setGlobalLoading] = useState(true)
  const [globalSaving, setGlobalSaving] = useState(false)
  const [globalReason, setGlobalReason] = useState('')
  const [globalUpdatedBy, setGlobalUpdatedBy] = useState('')

  // User Flags State
  const [userFlags, setUserFlags] = useState<FeatureFlagListItem[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [userSaving, setUserSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState<FeatureFlag>({
    discordId: '',
    premiumOverride: true,
    overrideAnimatedGifs: null,
    overridePreview: null,
    overrideMultiMessage: null,
    overrideAvatarChoice: null,
    overridePresets: null,
    overrideNoWatermark: null,
    overrideMaxGallerySize: null,
    reason: '',
    createdBy: '',
    expiresAt: null,
  })

  // API Key helpers
  const getApiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminApiKey') || ''
    }
    return ''
  }

  const setApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminApiKey', key)
    }
  }

  // Fetch Global Flags
  const fetchGlobalFlags = useCallback(async () => {
    try {
      setGlobalLoading(true)
      setError(null)

      const response = await fetch('/api/admin/global-flags', {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch global feature flags')
      }

      const data = await response.json()
      setGlobalFlags(data.globalFlags)
      setGlobalReason(data.globalFlags.reason || '')
      setGlobalUpdatedBy(data.globalFlags.updatedBy || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global feature flags')
    } finally {
      setGlobalLoading(false)
    }
  }, [])

  // Fetch User Flags
  const fetchUserFlags = useCallback(async () => {
    try {
      setUserLoading(true)
      setError(null)

      const response = await fetch('/api/admin/feature-flags', {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags')
      }

      const data = await response.json()
      setUserFlags(data.flags || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags')
    } finally {
      setUserLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchGlobalFlags()
    fetchUserFlags()
  }, [fetchGlobalFlags, fetchUserFlags])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Global Flags Handlers
  const handleSaveGlobal = async () => {
    try {
      setGlobalSaving(true)
      setError(null)

      const response = await fetch('/api/admin/global-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          globalPremiumOverride: globalFlags.globalPremiumOverride,
          globalAnimatedGifs: globalFlags.globalAnimatedGifs,
          globalPreview: globalFlags.globalPreview,
          globalMultiMessage: globalFlags.globalMultiMessage,
          globalAvatarChoice: globalFlags.globalAvatarChoice,
          globalPresets: globalFlags.globalPresets,
          globalNoWatermark: globalFlags.globalNoWatermark,
          globalMaxGallerySize: globalFlags.globalMaxGallerySize,
          reason: globalReason || null,
          updatedBy: globalUpdatedBy || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save global feature flags')
      }

      setSuccess('Global feature flags saved successfully')
      fetchGlobalFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save global feature flags')
    } finally {
      setGlobalSaving(false)
    }
  }

  const handleResetGlobal = async () => {
    if (!confirm('Are you sure you want to reset all global feature flags to their defaults? This will affect all users.')) {
      return
    }

    try {
      setGlobalSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/global-flags?updatedBy=${encodeURIComponent(globalUpdatedBy || 'admin')}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset global feature flags')
      }

      setSuccess('Global feature flags reset to defaults')
      fetchGlobalFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset global feature flags')
    } finally {
      setGlobalSaving(false)
    }
  }

  // User Flags Handlers
  const handleOpenModal = (flag?: FeatureFlagListItem) => {
    if (flag) {
      fetchFlagDetails(flag.discordId)
    } else {
      setFormData({
        discordId: '',
        premiumOverride: true,
        overrideAnimatedGifs: null,
        overridePreview: null,
        overrideMultiMessage: null,
        overrideAvatarChoice: null,
        overridePresets: null,
        overrideNoWatermark: null,
        overrideMaxGallerySize: null,
        reason: '',
        createdBy: '',
        expiresAt: null,
      })
      setEditingFlag(null)
      setShowModal(true)
    }
  }

  const fetchFlagDetails = async (discordId: string) => {
    try {
      const response = await fetch(`/api/admin/feature-flags?discordId=${discordId}`, {
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch flag details')

      const data = await response.json()
      if (data.flags) {
        setFormData({
          discordId,
          premiumOverride: data.flags.premiumOverride,
          overrideAnimatedGifs: data.flags.overrideAnimatedGifs,
          overridePreview: data.flags.overridePreview,
          overrideMultiMessage: data.flags.overrideMultiMessage,
          overrideAvatarChoice: data.flags.overrideAvatarChoice,
          overridePresets: data.flags.overridePresets,
          overrideNoWatermark: data.flags.overrideNoWatermark,
          overrideMaxGallerySize: data.flags.overrideMaxGallerySize,
          reason: data.flags.reason || '',
          createdBy: data.flags.createdBy || '',
          expiresAt: data.flags.expiresAt,
        })
        setEditingFlag(data.flags)
      }
      setShowModal(true)
    } catch (err) {
      setError('Failed to load flag details')
    }
  }

  const handleSaveUser = async () => {
    if (!formData.discordId.trim()) {
      setError('Discord ID is required')
      return
    }

    try {
      setUserSaving(true)
      setError(null)

      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          discordId: formData.discordId.trim(),
          premiumOverride: formData.premiumOverride,
          overrideAnimatedGifs: formData.overrideAnimatedGifs,
          overridePreview: formData.overridePreview,
          overrideMultiMessage: formData.overrideMultiMessage,
          overrideAvatarChoice: formData.overrideAvatarChoice,
          overridePresets: formData.overridePresets,
          overrideNoWatermark: formData.overrideNoWatermark,
          overrideMaxGallerySize: formData.overrideMaxGallerySize,
          reason: formData.reason || null,
          createdBy: formData.createdBy || null,
          expiresAt: formData.expiresAt || null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save feature flag')
      }

      setSuccess(editingFlag ? 'User feature flag updated successfully' : 'User feature flag created successfully')
      setShowModal(false)
      fetchUserFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feature flag')
    } finally {
      setUserSaving(false)
    }
  }

  const handleDeleteUser = async (discordId: string) => {
    if (!confirm(`Are you sure you want to remove feature flags for Discord ID: ${discordId}?`)) {
      return
    }

    try {
      setDeleting(discordId)
      setError(null)

      const response = await fetch(`/api/admin/feature-flags?discordId=${discordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete feature flag')
      }

      setSuccess('User feature flag removed successfully')
      fetchUserFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature flag')
    } finally {
      setDeleting(null)
    }
  }

  // Helpers
  const hasActiveGlobalOverrides =
    globalFlags.globalPremiumOverride !== null ||
    globalFlags.globalAnimatedGifs !== null ||
    globalFlags.globalPreview !== null ||
    globalFlags.globalMultiMessage !== null ||
    globalFlags.globalAvatarChoice !== null ||
    globalFlags.globalPresets !== null ||
    globalFlags.globalNoWatermark !== null ||
    globalFlags.globalMaxGallerySize !== null

  const filteredUserFlags = userFlags.filter(flag =>
    flag.discordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Feature Flags</h1>
            <p className="text-sm text-dark-400">Manage feature access for all users</p>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="glass rounded-xl p-4 mb-6">
        <label className="block text-xs text-dark-500 mb-2">Admin API Key</label>
        <input
          type="password"
          placeholder="Enter your BOT_API_KEY or ADMIN_API_KEY"
          defaultValue={getApiKey()}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
        <p className="text-xs text-dark-500 mt-2">This key is stored locally and used for API authentication</p>
      </div>

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

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'global'
              ? 'text-brand-400 border-brand-500'
              : 'text-dark-400 border-transparent hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          Global Flags
          {hasActiveGlobalOverrides && (
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'text-brand-400 border-brand-500'
              : 'text-dark-400 border-transparent hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          User Flags
          {userFlags.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-300">
              {userFlags.length}
            </span>
          )}
        </button>
      </div>

      {/* Global Flags Tab */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={fetchGlobalFlags}
              disabled={globalLoading || globalSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleResetGlobal}
              disabled={globalLoading || globalSaving || !hasActiveGlobalOverrides}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>

          {/* Status Banner */}
          {hasActiveGlobalOverrides && (
            <div className="bg-warning/10 border border-warning/50 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Global overrides are active</p>
                <p className="text-sm text-dark-400 mt-1">
                  These settings affect ALL users and take priority over individual feature flags and subscriptions.
                </p>
              </div>
            </div>
          )}

          {globalLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="glass rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-dark-400">
                  <p className="font-medium text-white mb-1">How Global Flags Work</p>
                  <p>
                    Global flags have the highest priority. When set, they override individual user feature flags and subscription status.
                    Setting a feature to &quot;Default&quot; will allow individual settings and subscriptions to take effect.
                  </p>
                </div>
              </div>

              {/* Global Premium Override */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Global Premium Status</h2>
                <p className="text-sm text-dark-400 mb-4">
                  Force premium or free status for ALL users, regardless of their subscription.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: true, label: 'All Premium', icon: Crown, color: 'pro-gold', desc: 'Everyone gets premium features' },
                    { value: null, label: 'Default', icon: User, color: 'brand-400', desc: 'Use individual subscriptions' },
                    { value: false, label: 'All Free', icon: Zap, color: 'dark-400', desc: 'Everyone is treated as free' },
                  ].map(option => (
                    <button
                      key={String(option.value)}
                      onClick={() => setGlobalFlags(prev => ({ ...prev, globalPremiumOverride: option.value }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        globalFlags.globalPremiumOverride === option.value
                          ? option.value === true
                            ? 'border-pro-gold bg-pro-gold/20'
                            : option.value === false
                            ? 'border-dark-500 bg-dark-800'
                            : 'border-brand-500 bg-brand-500/20'
                          : 'border-dark-700 hover:border-dark-600'
                      }`}
                    >
                      <option.icon className={`w-6 h-6 ${
                        globalFlags.globalPremiumOverride === option.value
                          ? option.value === true
                            ? 'text-pro-gold'
                            : option.value === false
                            ? 'text-dark-400'
                            : 'text-brand-400'
                          : 'text-dark-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        globalFlags.globalPremiumOverride === option.value ? 'text-white' : 'text-dark-400'
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
                  Override specific features for ALL users. These take priority over individual user settings.
                </p>
                <div className="space-y-3">
                  {GLOBAL_FEATURE_OPTIONS.map(feature => {
                    const value = globalFlags[feature.key as keyof GlobalFeatureFlags] as boolean | null
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
                              onClick={() => setGlobalFlags(prev => ({ ...prev, [feature.key]: opt.v }))}
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

              {/* Storage Quota Override */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-dark-400" />
                  Global Storage Quota
                </h2>
                <p className="text-sm text-dark-400 mb-4">
                  Set a storage quota limit for ALL users. Leave empty to use individual settings.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Leave empty for default"
                    value={globalFlags.globalMaxGallerySize ?? ''}
                    onChange={(e) => setGlobalFlags(prev => ({
                      ...prev,
                      globalMaxGallerySize: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <span className="text-sm text-dark-500">quotes</span>
                </div>
                <p className="text-xs text-dark-500 mt-2">
                  Default: Free = 50 | Premium = Unlimited | Leave empty to use individual limits
                </p>
              </div>

              {/* Metadata */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Change Notes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for Changes</label>
                    <input
                      type="text"
                      placeholder="e.g., Holiday promotion, Beta test"
                      value={globalReason}
                      onChange={(e) => setGlobalReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Updated By</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={globalUpdatedBy}
                      onChange={(e) => setGlobalUpdatedBy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                {globalFlags.updatedAt && (
                  <p className="text-xs text-dark-500 mt-4">
                    Last updated: {formatDate(globalFlags.updatedAt)} {globalFlags.updatedBy && `by ${globalFlags.updatedBy}`}
                  </p>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveGlobal}
                  disabled={globalSaving}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  {globalSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Global Flags
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* User Flags Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder="Search by Discord ID, reason, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              onClick={fetchUserFlags}
              disabled={userLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${userLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add User Flag
            </button>
          </div>

          {/* User Flags List */}
          <div className="glass rounded-2xl overflow-hidden">
            {userLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : filteredUserFlags.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">
                  {searchQuery ? 'No flags match your search' : 'No user feature flags configured'}
                </p>
                <p className="text-sm text-dark-500 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add a flag to grant premium access for specific users'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {filteredUserFlags.map((flag) => (
                  <div
                    key={flag.discordId}
                    className={`p-4 sm:p-6 hover:bg-dark-800/30 transition-colors ${isExpired(flag.expiresAt) ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          flag.premiumOverride ? 'bg-pro-gold/20' : 'bg-dark-800'
                        }`}>
                          {flag.premiumOverride ? (
                            <Crown className="w-5 h-5 text-pro-gold" />
                          ) : (
                            <User className="w-5 h-5 text-dark-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono bg-dark-800 px-2 py-0.5 rounded">
                              {flag.discordId}
                            </code>
                            {flag.premiumOverride && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pro-gold/20 text-pro-gold">
                                Premium
                              </span>
                            )}
                            {isExpired(flag.expiresAt) && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-error/20 text-error">
                                Expired
                              </span>
                            )}
                          </div>
                          {flag.reason && (
                            <p className="text-sm text-dark-400 mt-1 truncate">{flag.reason}</p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500">
                        {flag.createdBy && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{flag.createdBy}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expires: {formatDate(flag.expiresAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(flag)}
                          className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(flag.discordId)}
                          disabled={deleting === flag.discordId}
                          className="p-2 hover:bg-error/20 rounded-lg transition-colors text-dark-400 hover:text-error disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === flag.discordId ? (
                            <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {!userLoading && userFlags.length > 0 && (
            <div className="flex items-center justify-between text-sm text-dark-500">
              <span>{filteredUserFlags.length} of {userFlags.length} flags shown</span>
              <span>{userFlags.filter(f => f.premiumOverride).length} with premium override</span>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !userSaving && setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative glass rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">
                {editingFlag ? 'Edit User Flag' : 'Add User Flag'}
              </h2>
              <button
                onClick={() => !userSaving && setShowModal(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Discord ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Discord ID *</label>
                <input
                  type="text"
                  placeholder="e.g., 123456789012345678"
                  value={formData.discordId}
                  onChange={(e) => setFormData(prev => ({ ...prev, discordId: e.target.value }))}
                  disabled={!!editingFlag}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              {/* Premium Override */}
              <div>
                <label className="block text-sm font-medium mb-2">Premium Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: true, label: 'Premium', icon: Crown, color: 'pro-gold' },
                    { value: false, label: 'Free', icon: Zap, color: 'dark-400' },
                    { value: null, label: 'Default', icon: User, color: 'brand-400' },
                  ].map(option => (
                    <button
                      key={String(option.value)}
                      onClick={() => setFormData(prev => ({ ...prev, premiumOverride: option.value }))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        formData.premiumOverride === option.value
                          ? option.value === true
                            ? 'border-pro-gold bg-pro-gold/20 text-pro-gold'
                            : option.value === false
                            ? 'border-dark-500 bg-dark-800 text-white'
                            : 'border-brand-500 bg-brand-500/20 text-brand-400'
                          : 'border-dark-700 hover:border-dark-600 text-dark-400'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-dark-500 mt-2">
                  Premium = full access, Free = override to free, Default = use actual subscription
                </p>
              </div>

              {/* Individual Feature Overrides */}
              <div>
                <label className="block text-sm font-medium mb-2">Individual Feature Overrides</label>
                <p className="text-xs text-dark-500 mb-3">
                  Override specific features regardless of premium status. Leave as &quot;Default&quot; to inherit from premium status.
                </p>
                <div className="space-y-2">
                  {USER_FEATURE_OPTIONS.map(feature => {
                    const value = formData[feature.key as keyof FeatureFlag] as boolean | null
                    return (
                      <div key={feature.key} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <feature.icon className="w-4 h-4 text-dark-400" />
                          <span className="text-sm">{feature.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[
                            { v: true, label: 'On', color: 'success' },
                            { v: null, label: 'Default', color: 'dark-400' },
                            { v: false, label: 'Off', color: 'error' },
                          ].map(opt => (
                            <button
                              key={String(opt.v)}
                              onClick={() => setFormData(prev => ({ ...prev, [feature.key]: opt.v }))}
                              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
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

              {/* Storage Quota Override */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-dark-400" />
                    Storage Quota Override
                  </div>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Leave empty for default"
                    value={formData.overrideMaxGallerySize ?? ''}
                    onChange={(e) => setFormData(prev => ({
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

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Beta tester, Bug investigation"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-medium mb-2">Created By</label>
                <input
                  type="text"
                  placeholder="Your name or identifier"
                  value={formData.createdBy || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null
                  }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <p className="text-xs text-dark-500 mt-2">
                  Leave empty for no expiration
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <button
                onClick={() => setShowModal(false)}
                disabled={userSaving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={userSaving || !formData.discordId.trim()}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {editingFlag ? 'Update Flag' : 'Create Flag'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
