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
  Edit3,
  Radio
} from 'lucide-react'
import type { Ad } from '@/types/ads'

export default function AdsManagementPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const getApiKey = () => typeof window !== 'undefined' ? localStorage.getItem('adminApiKey') || '' : ''
  const setApiKey = (key: string) => typeof window !== 'undefined' && localStorage.setItem('adminApiKey', key)

  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    text: '',
    shortText: '',
    name: '',
    enabled: true
  })

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
    } catch {
      setError('Failed to load ads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) } }, [success])

  const handleCreate = () => {
    setEditingAd(null)
    setFormData({ text: '', shortText: '', name: '', enabled: true })
    setShowForm(true)
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setFormData({
      text: ad.text,
      shortText: ad.shortText,
      name: ad.name || '',
      enabled: ad.enabled
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.text || !formData.shortText) {
      setError('Both text fields are required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      }

      const response = editingAd
        ? await fetch(`/api/admin/ads?id=${editingAd.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(formData)
          })
        : await fetch('/api/admin/ads', {
            method: 'POST',
            headers,
            body: JSON.stringify(formData)
          })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(editingAd ? 'Ad updated!' : 'Ad created!')
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSetActive = async (ad: Ad) => {
    try {
      const response = await fetch(`/api/admin/ads?id=${ad.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({ isActive: true })
      })

      if (!response.ok) throw new Error('Failed')

      setSuccess(`"${ad.name || 'Ad'}" is now active`)
      fetchData()
    } catch {
      setError('Failed to set active ad')
    }
  }

  const handleDelete = async (ad: Ad) => {
    if (!confirm(`Delete "${ad.name || ad.text.slice(0, 30)}"?`)) return

    try {
      const response = await fetch(`/api/admin/ads?id=${ad.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (!response.ok) throw new Error('Failed')

      setSuccess('Ad deleted')
      fetchData()
    } catch {
      setError('Failed to delete')
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ad Management</h1>
          <p className="text-sm text-dark-400">Manage the ad shown in QuoteCord bot</p>
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 mb-6 border border-brand-500/20">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-dark-400">
            <p>Create multiple ads and select which one is <strong className="text-white">active</strong>. The active ad will be shown to free users in the QuoteCord bot.</p>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="glass rounded-xl p-4 mb-6">
        <label className="text-sm font-medium mb-2 block">Admin API Key</label>
        <input
          type="password"
          placeholder="Paste your admin API key"
          defaultValue={getApiKey()}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
        />
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
        <div className="space-y-4">
          {/* Ads List */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Ads</h2>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 px-4 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                New Ad
              </button>
            </div>

            {ads.length === 0 ? (
              <div className="text-center py-8 text-dark-400 border-2 border-dashed border-dark-700 rounded-xl">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No ads yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ads.map(ad => (
                  <div
                    key={ad.id}
                    className={`p-4 rounded-xl border ${
                      ad.isActive
                        ? 'bg-brand-500/10 border-brand-500/50'
                        : 'bg-dark-800/50 border-dark-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {ad.isActive && (
                            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                          <p className="font-medium text-white truncate">
                            {ad.name || 'Unnamed Ad'}
                          </p>
                        </div>
                        <p className="text-sm text-dark-400 truncate">{ad.text}</p>
                        <p className="text-xs text-dark-500 truncate mt-1">{ad.shortText}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!ad.isActive && (
                          <button
                            onClick={() => handleSetActive(ad)}
                            className="p-2 text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg"
                            title="Set as active"
                          >
                            <Radio className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad)}
                          className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="relative glass rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold">{editingAd ? 'Edit Ad' : 'New Ad'}</h2>
              <button onClick={() => !saving && setShowForm(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name (for your reference)</label>
                <input
                  type="text"
                  placeholder="e.g., QuoteCord Pro Promo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                <p className="text-xs text-dark-500 mt-1">Shown on classic/profile templates (~100 chars max)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                <p className="text-xs text-dark-500 mt-1">Shown on discord/embed templates (~50 chars max)</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-dark-800">
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
                {editingAd ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
