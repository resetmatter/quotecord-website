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
  XCircle,
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
  Database
} from 'lucide-react'

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

const FEATURE_OPTIONS = [
  { key: 'overrideAnimatedGifs', label: 'Animated GIFs', icon: ImageIcon },
  { key: 'overridePreview', label: 'Preview', icon: Eye },
  { key: 'overrideMultiMessage', label: 'Multi-Message', icon: MessageSquare },
  { key: 'overrideAvatarChoice', label: 'Avatar Choice', icon: CircleUser },
  { key: 'overridePresets', label: 'Presets', icon: Palette },
  { key: 'overrideNoWatermark', label: 'No Watermark', icon: Droplet },
] as const

export default function FeatureFlagsAdminPage() {
  const [flags, setFlags] = useState<FeatureFlagListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
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

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true)
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
      setFlags(data.flags || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const getApiKey = () => {
    // Try to get from localStorage or use a default for development
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

  const handleOpenModal = (flag?: FeatureFlagListItem) => {
    if (flag) {
      // Editing existing flag - need to fetch full details
      fetchFlagDetails(flag.discordId)
    } else {
      // New flag
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

  const handleSave = async () => {
    if (!formData.discordId.trim()) {
      setError('Discord ID is required')
      return
    }

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

      setSuccess(editingFlag ? 'Feature flag updated successfully' : 'Feature flag created successfully')
      setShowModal(false)
      fetchFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feature flag')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (discordId: string) => {
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

      setSuccess('Feature flag removed successfully')
      fetchFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature flag')
    } finally {
      setDeleting(null)
    }
  }

  const filteredFlags = flags.filter(flag =>
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
            <p className="text-sm text-dark-400">Manage premium overrides for testing</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Flag
        </button>
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

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
          onClick={fetchFlags}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Flags List */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : filteredFlags.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">
              {searchQuery ? 'No flags match your search' : 'No feature flags configured'}
            </p>
            <p className="text-sm text-dark-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add a flag to grant premium access for testing'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {filteredFlags.map((flag) => (
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
                      onClick={() => handleDelete(flag.discordId)}
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
      {!loading && flags.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-dark-500">
          <span>{filteredFlags.length} of {flags.length} flags shown</span>
          <span>{flags.filter(f => f.premiumOverride).length} with premium override</span>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !saving && setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative glass rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">
                {editingFlag ? 'Edit Feature Flag' : 'Add Feature Flag'}
              </h2>
              <button
                onClick={() => !saving && setShowModal(false)}
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
                  {FEATURE_OPTIONS.map(feature => {
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
                  Free: 50 | Premium: 1000 | Custom: any number
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
                disabled={saving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.discordId.trim()}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
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
