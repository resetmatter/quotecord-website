'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Crown,
  Zap,
  User,
  RotateCcw,
  Image as ImageIcon,
  Eye,
  MessageSquare,
  CircleUser,
  Palette,
  Droplet,
  Database,
  Info
} from 'lucide-react'

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

const FEATURE_OPTIONS = [
  { key: 'globalAnimatedGifs', label: 'Animated GIFs', icon: ImageIcon, description: 'Create animated GIF quotes from animated avatars' },
  { key: 'globalPreview', label: 'Preview', icon: Eye, description: 'Preview quotes before posting to channel' },
  { key: 'globalMultiMessage', label: 'Multi-Message', icon: MessageSquare, description: 'Combine up to 5 messages in one quote' },
  { key: 'globalAvatarChoice', label: 'Avatar Choice', icon: CircleUser, description: 'Choose between server and default avatar' },
  { key: 'globalPresets', label: 'Presets', icon: Palette, description: 'Save up to 10 custom style presets' },
  { key: 'globalNoWatermark', label: 'No Watermark', icon: Droplet, description: 'Remove watermark from generated quotes' },
] as const

export default function GlobalFlagsPage() {
  const [flags, setFlags] = useState<GlobalFeatureFlags>({
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [updatedBy, setUpdatedBy] = useState('')

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

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true)
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
      setFlags(data.globalFlags)
      setReason(data.globalFlags.reason || '')
      setUpdatedBy(data.globalFlags.updatedBy || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global feature flags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/global-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          globalPremiumOverride: flags.globalPremiumOverride,
          globalAnimatedGifs: flags.globalAnimatedGifs,
          globalPreview: flags.globalPreview,
          globalMultiMessage: flags.globalMultiMessage,
          globalAvatarChoice: flags.globalAvatarChoice,
          globalPresets: flags.globalPresets,
          globalNoWatermark: flags.globalNoWatermark,
          globalMaxGallerySize: flags.globalMaxGallerySize,
          reason: reason || null,
          updatedBy: updatedBy || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save global feature flags')
      }

      setSuccess('Global feature flags saved successfully')
      fetchFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save global feature flags')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all global feature flags to their defaults? This will affect all users.')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/global-flags?updatedBy=${encodeURIComponent(updatedBy || 'admin')}`, {
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
      fetchFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset global feature flags')
    } finally {
      setSaving(false)
    }
  }

  const hasActiveOverrides =
    flags.globalPremiumOverride !== null ||
    flags.globalAnimatedGifs !== null ||
    flags.globalPreview !== null ||
    flags.globalMultiMessage !== null ||
    flags.globalAvatarChoice !== null ||
    flags.globalPresets !== null ||
    flags.globalNoWatermark !== null ||
    flags.globalMaxGallerySize !== null

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
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Global Feature Flags</h1>
            <p className="text-sm text-dark-400">Control features for ALL users at once</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFlags}
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleReset}
            disabled={loading || saving || !hasActiveOverrides}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
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
      </div>

      {/* Status Banner */}
      {hasActiveOverrides && (
        <div className="bg-warning/10 border border-warning/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Global overrides are active</p>
            <p className="text-sm text-dark-400 mt-1">
              These settings affect ALL users and take priority over individual feature flags and subscriptions.
            </p>
          </div>
        </div>
      )}

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
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
                  onClick={() => setFlags(prev => ({ ...prev, globalPremiumOverride: option.value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    flags.globalPremiumOverride === option.value
                      ? option.value === true
                        ? 'border-pro-gold bg-pro-gold/20'
                        : option.value === false
                        ? 'border-dark-500 bg-dark-800'
                        : 'border-brand-500 bg-brand-500/20'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <option.icon className={`w-6 h-6 ${
                    flags.globalPremiumOverride === option.value
                      ? option.value === true
                        ? 'text-pro-gold'
                        : option.value === false
                        ? 'text-dark-400'
                        : 'text-brand-400'
                      : 'text-dark-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    flags.globalPremiumOverride === option.value ? 'text-white' : 'text-dark-400'
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
              {FEATURE_OPTIONS.map(feature => {
                const value = flags[feature.key as keyof GlobalFeatureFlags] as boolean | null
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
                          onClick={() => setFlags(prev => ({ ...prev, [feature.key]: opt.v }))}
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
                value={flags.globalMaxGallerySize ?? ''}
                onChange={(e) => setFlags(prev => ({
                  ...prev,
                  globalMaxGallerySize: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              <span className="text-sm text-dark-500">quotes</span>
            </div>
            <p className="text-xs text-dark-500 mt-2">
              Default: Free = 50 | Premium = 1000 | Leave empty to use individual limits
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
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Updated By</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={updatedBy}
                  onChange={(e) => setUpdatedBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
            {flags.updatedAt && (
              <p className="text-xs text-dark-500 mt-4">
                Last updated: {formatDate(flags.updatedAt)} {flags.updatedBy && `by ${flags.updatedBy}`}
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? (
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
        </div>
      )}
    </div>
  )
}
