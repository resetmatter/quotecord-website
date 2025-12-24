'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Save,
  HelpCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Zap,
  Radio
} from 'lucide-react'
import type { Ad } from '@/types/ads'

export default function AdsManagementPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Key
  const getApiKey = () => typeof window !== 'undefined' ? localStorage.getItem('adminApiKey') || '' : ''
  const setApiKey = (key: string) => typeof window !== 'undefined' && localStorage.setItem('adminApiKey', key)

  // State
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit/Create Form
  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    text: '',
    shortText: '',
    name: '',
    description: '',
    url: '',
    enabled: true,
    isActive: false
  })

  // Fetch all ads
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/ads', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAds(data.ads || [])
      } else {
        setError('Failed to load ads. Check your API key.')
      }
    } catch (err) {
      setError('Failed to load ads. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 5000); return () => clearTimeout(t) } }, [success])

  // Open create form
  const handleCreate = () => {
    setEditingAd(null)
    setFormData({
      text: '',
      shortText: '',
      name: '',
      description: '',
      url: '',
      enabled: true,
      isActive: false
    })
    setShowForm(true)
  }

  // Open edit form
  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setFormData({
      text: ad.text,
      shortText: ad.shortText,
      name: ad.name || '',
      description: ad.description || '',
      url: ad.url || '',
      enabled: ad.enabled,
      isActive: ad.isActive
    })
    setShowForm(true)
  }

  // Save ad (create or update)
  const handleSave = async () => {
    if (!formData.text || !formData.shortText) {
      setError('Both text and short text are required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      }

      let response: Response

      if (editingAd) {
        // Update existing ad
        response = await fetch(`/api/admin/ads?id=${editingAd.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            text: formData.text,
            shortText: formData.shortText,
            name: formData.name || null,
            description: formData.description || null,
            url: formData.url || null,
            enabled: formData.enabled,
            isActive: formData.isActive,
            updatedBy: 'admin'
          })
        })
      } else {
        // Create new ad
        response = await fetch('/api/admin/ads', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: formData.text,
            shortText: formData.shortText,
            name: formData.name || null,
            description: formData.description || null,
            url: formData.url || null,
            enabled: formData.enabled,
            isActive: formData.isActive,
            createdBy: 'admin'
          })
        })
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save ad')
      }

      setSuccess(editingAd ? 'Ad updated successfully!' : 'Ad created successfully!')
      setShowForm(false)
      setEditingAd(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ad')
    } finally {
      setSaving(false)
    }
  }

  // Toggle enabled status
  const handleToggleEnabled = async (ad: Ad) => {
    try {
      const response = await fetch(`/api/admin/ads?id=${ad.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          enabled: !ad.enabled,
          updatedBy: 'admin'
        })
      })

      if (!response.ok) throw new Error('Failed to toggle ad')

      setSuccess(`Ad ${ad.enabled ? 'disabled' : 'enabled'}`)
      fetchData()
    } catch {
      setError('Failed to toggle ad')
    }
  }

  // Set as active ad
  const handleSetActive = async (ad: Ad) => {
    try {
      const response = await fetch(`/api/admin/ads?id=${ad.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          isActive: true,
          updatedBy: 'admin'
        })
      })

      if (!response.ok) throw new Error('Failed to set active ad')

      setSuccess(`"${ad.name || ad.text.slice(0, 30)}..." is now the active ad`)
      fetchData()
    } catch {
      setError('Failed to set active ad')
    }
  }

  // Delete ad
  const handleDelete = async (ad: Ad) => {
    if (!confirm(`Delete ad "${ad.name || ad.text.slice(0, 30)}..."? This cannot be undone.`)) return

    try {
      const response = await fetch(`/api/admin/ads?id=${ad.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (!response.ok) throw new Error('Failed to delete ad')

      setSuccess('Ad deleted')
      fetchData()
    } catch {
      setError('Failed to delete ad')
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
  }

  // Get the active ad
  const activeAd = ads.find(ad => ad.isActive && ad.enabled)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ad Management</h1>
          <p className="text-sm text-dark-400">Configure ads displayed on free user quotes</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass rounded-2xl p-5 mb-6 border border-brand-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">How Ads Work</h3>
            <div className="space-y-2 text-sm text-dark-400">
              <p>
                <strong className="text-white">1. Create ads</strong> — Add multiple ad configurations with different text for different campaigns.
              </p>
              <p>
                <strong className="text-white">2. Set one as active</strong> — Only one ad can be active at a time. This is what the bot displays to free users.
              </p>
              <p>
                <strong className="text-white">3. Two text formats</strong> — &quot;Full text&quot; appears on classic/profile templates, &quot;Short text&quot; on discord/embed templates.
              </p>
            </div>
            <div className="mt-3 p-3 bg-dark-800/50 rounded-xl">
              <p className="text-xs text-dark-500">
                <strong className="text-dark-300">Bot API:</strong> The bot fetches the active ad from{' '}
                <code className="text-brand-400 bg-dark-900 px-1.5 py-0.5 rounded">GET /api/bot/ads</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">Admin API Key</label>
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-dark-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark-800 rounded-lg text-xs text-dark-300 w-64 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg border border-dark-700">
              This is your BOT_API_KEY or ADMIN_API_KEY from your environment variables. It authenticates you as an admin.
            </div>
          </div>
        </div>
        <input
          type="password"
          placeholder="Paste your admin API key here"
          defaultValue={getApiKey()}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
        />
        <p className="text-xs text-dark-500 mt-2">Stored locally in your browser. Required to make changes.</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-success/10 border border-success/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-error" />
          <p className="text-sm text-error">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Active Ad */}
          {activeAd && (
            <div className="glass rounded-2xl p-6 border-2 border-success/30">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-success animate-pulse" />
                <h2 className="text-lg font-semibold">Currently Active Ad</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-dark-500 mb-1">Full Text (classic/profile templates)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-dark-800 px-3 py-2 rounded-lg text-sm text-brand-400 font-mono">
                      {activeAd.text}
                    </code>
                    <button onClick={() => copyToClipboard(activeAd.text)} className="p-2 text-dark-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-dark-500 mb-1">Short Text (discord/embed templates)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-dark-800 px-3 py-2 rounded-lg text-sm text-brand-400 font-mono">
                      {activeAd.shortText}
                    </code>
                    <button onClick={() => copyToClipboard(activeAd.shortText)} className="p-2 text-dark-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {activeAd.description && (
                  <div>
                    <p className="text-xs text-dark-500 mb-1">Description/Caption</p>
                    <p className="text-sm text-dark-300">{activeAd.description}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-dark-500 pt-2">
                  <span>Impressions: {activeAd.impressions.toLocaleString()}</span>
                  {activeAd.url && (
                    <a href={activeAd.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                      <LinkIcon className="w-3 h-3" />
                      View URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Ads */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">All Ads</h2>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 px-4 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Create Ad
              </button>
            </div>

            {ads.length === 0 ? (
              <div className="text-center py-8 text-dark-400 border-2 border-dashed border-dark-700 rounded-xl">
                <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No ads yet</p>
                <p className="text-sm text-dark-500 mt-1">Click &quot;Create Ad&quot; to make your first one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ads.map(ad => (
                  <div
                    key={ad.id}
                    className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                      ad.isActive && ad.enabled
                        ? 'bg-success/10 border border-success/30'
                        : 'bg-dark-800/50 hover:bg-dark-800/70'
                    }`}
                  >
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      ad.isActive && ad.enabled
                        ? 'bg-success/20'
                        : ad.enabled
                          ? 'bg-brand-500/20'
                          : 'bg-dark-700'
                    }`}>
                      {ad.isActive && ad.enabled ? (
                        <Radio className="w-5 h-5 text-success" />
                      ) : ad.enabled ? (
                        <Eye className="w-5 h-5 text-brand-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-dark-500" />
                      )}
                    </div>

                    {/* Ad content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {ad.name && <span className="font-medium text-white">{ad.name}</span>}
                        {ad.isActive && ad.enabled && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Active</span>
                        )}
                        {!ad.enabled && (
                          <span className="text-xs bg-dark-700 text-dark-400 px-2 py-0.5 rounded-full">Disabled</span>
                        )}
                      </div>
                      <p className="text-sm text-dark-300 truncate">{ad.text}</p>
                      <p className="text-xs text-dark-500 truncate mt-0.5">Short: {ad.shortText}</p>
                      {ad.description && (
                        <p className="text-xs text-dark-500 mt-1">Caption: {ad.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                        <span>{ad.impressions.toLocaleString()} impressions</span>
                        {ad.url && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Has URL</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Set as active button */}
                      {!ad.isActive && ad.enabled && (
                        <button
                          onClick={() => handleSetActive(ad)}
                          className="p-2 text-dark-400 hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                          title="Set as active"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      {/* Toggle enabled */}
                      <button
                        onClick={() => handleToggleEnabled(ad)}
                        className={`p-2 rounded-lg transition-colors ${
                          ad.enabled
                            ? 'text-success hover:text-dark-400 hover:bg-dark-700'
                            : 'text-dark-500 hover:text-success hover:bg-success/10'
                        }`}
                        title={ad.enabled ? 'Disable' : 'Enable'}
                      >
                        {ad.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(ad)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(ad)}
                        className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => !saving && setShowForm(false)} />
          <div className="relative glass rounded-2xl max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold">{editingAd ? 'Edit Ad' : 'Create Ad'}</h2>
              <button onClick={() => !saving && setShowForm(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name <span className="text-dark-500 font-normal">(internal reference)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., QuoteCord Pro Promo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Full Text */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Type className="w-4 h-4 text-brand-400" />
                  Full Text <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Sponsored • Get Pro at quotecord.com"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  maxLength={150}
                />
                <p className="text-xs text-dark-500 mt-1">Shown on classic/profile templates. Max ~100 chars recommended.</p>
              </div>

              {/* Short Text */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <AlignLeft className="w-4 h-4 text-brand-400" />
                  Short Text <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Sponsored • quotecord.com"
                  value={formData.shortText}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortText: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  maxLength={80}
                />
                <p className="text-xs text-dark-500 mt-1">Shown on discord/embed templates. Max ~50 chars recommended.</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description/Caption <span className="text-dark-500 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="A brief description that can be shown under the quote..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-dark-500 mt-1">Context for what the ad URL is about.</p>
              </div>

              {/* URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <LinkIcon className="w-4 h-4 text-brand-400" />
                  URL <span className="text-dark-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://quotecord.com"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-dark-800 space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                  <div>
                    <span className="text-sm font-medium">Enabled</span>
                    <p className="text-xs text-dark-500 mt-0.5">Allow this ad to be shown</p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={formData.enabled ? 'text-success' : 'text-dark-500'}
                  >
                    {formData.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                  <div>
                    <span className="text-sm font-medium">Set as Active</span>
                    <p className="text-xs text-dark-500 mt-0.5">Make this the currently shown ad</p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={formData.isActive ? 'text-success' : 'text-dark-500'}
                  >
                    {formData.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/50">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.text || !formData.shortText}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-5 rounded-xl disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingAd ? 'Save Changes' : 'Create Ad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
