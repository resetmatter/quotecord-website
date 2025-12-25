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
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Users,
  ExternalLink,
  Weight,
  DollarSign,
  CreditCard,
  Share2,
  Wallet
} from 'lucide-react'
import type { Ad, BillingType } from '@/types/ads'

interface AdsStats {
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  totalGalleryShares: number
  overallCtr: string
  totalRevenueCents: number
  totalBudgetCents: number
  remainingBudgetCents: number
}

// Format cents to dollars
const formatCents = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`
}

export default function AdsManagementPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Key
  const getApiKey = () => typeof window !== 'undefined' ? localStorage.getItem('adminApiKey') || '' : ''
  const setApiKey = (key: string) => typeof window !== 'undefined' && localStorage.setItem('adminApiKey', key)

  // State
  const [ads, setAds] = useState<Ad[]>([])
  const [stats, setStats] = useState<AdsStats | null>(null)
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
    handle: '',
    destinationUrl: '',
    weight: 1,
    enabled: true,
    startDate: '',
    endDate: '',
    advertiserName: '',
    advertiserEmail: '',
    advertiserNotes: '',
    // Billing
    billingType: 'free' as BillingType,
    costPerQuoteCents: 1,
    budgetCents: 0
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
        setStats(data.stats || null)
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
      handle: '',
      destinationUrl: '',
      weight: 1,
      enabled: true,
      startDate: '',
      endDate: '',
      advertiserName: '',
      advertiserEmail: '',
      advertiserNotes: '',
      billingType: 'prepaid',
      costPerQuoteCents: 1,
      budgetCents: 0
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
      handle: ad.handle || '',
      destinationUrl: ad.destinationUrl || '',
      weight: ad.weight || 1,
      enabled: ad.enabled,
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      advertiserName: ad.advertiserName || '',
      advertiserEmail: ad.advertiserEmail || '',
      advertiserNotes: ad.advertiserNotes || '',
      billingType: ad.billingType || 'free',
      costPerQuoteCents: ad.costPerQuoteCents || 1,
      budgetCents: ad.budgetCents || 0
    })
    setShowForm(true)
  }

  // Validate handle format
  const isValidHandle = (handle: string) => {
    if (!handle) return true
    return /^[a-z0-9_-]+$/i.test(handle)
  }

  // Save ad (create or update)
  const handleSave = async () => {
    if (!formData.text || !formData.shortText) {
      setError('Both text and short text are required')
      return
    }

    if (formData.handle && !isValidHandle(formData.handle)) {
      setError('Handle can only contain letters, numbers, hyphens, and underscores')
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
        response = await fetch(`/api/admin/ads?id=${editingAd.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            text: formData.text,
            shortText: formData.shortText,
            name: formData.name || null,
            description: formData.description || null,
            handle: formData.handle || null,
            destinationUrl: formData.destinationUrl || null,
            weight: formData.weight,
            enabled: formData.enabled,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            advertiserName: formData.advertiserName || null,
            advertiserEmail: formData.advertiserEmail || null,
            advertiserNotes: formData.advertiserNotes || null,
            billingType: formData.billingType,
            costPerQuoteCents: formData.costPerQuoteCents,
            budgetCents: formData.budgetCents,
            updatedBy: 'admin'
          })
        })
      } else {
        response = await fetch('/api/admin/ads', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: formData.text,
            shortText: formData.shortText,
            name: formData.name || null,
            description: formData.description || null,
            handle: formData.handle || null,
            destinationUrl: formData.destinationUrl || null,
            weight: formData.weight,
            enabled: formData.enabled,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            advertiserName: formData.advertiserName || null,
            advertiserEmail: formData.advertiserEmail || null,
            advertiserNotes: formData.advertiserNotes || null,
            billingType: formData.billingType,
            costPerQuoteCents: formData.costPerQuoteCents,
            budgetCents: formData.budgetCents,
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

  // Delete ad
  const handleDelete = async (ad: Ad) => {
    if (!confirm(`Delete ad "${ad.name || ad.advertiserName || ad.text.slice(0, 30)}..."? This cannot be undone.`)) return

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

  // Calculate CTR
  const getCtr = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  // Calculate weight percentage
  const getWeightPercentage = (weight: number) => {
    const totalWeight = ads.filter(a => a.enabled).reduce((sum, a) => sum + (a.weight || 1), 0)
    if (totalWeight === 0) return 0
    return Math.round((weight / totalWeight) * 100)
  }

  // Get remaining budget
  const getRemainingBudget = (ad: Ad) => {
    if (ad.billingType === 'free' || ad.billingType === 'unlimited') return null
    return ad.budgetCents - ad.spentCents
  }

  // Get remaining quotes estimate
  const getRemainingQuotes = (ad: Ad) => {
    if (ad.billingType === 'free' || ad.billingType === 'unlimited') return null
    const remaining = ad.budgetCents - ad.spentCents
    if (ad.costPerQuoteCents <= 0) return null
    return Math.floor(remaining / ad.costPerQuoteCents)
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ad Management</h1>
          <p className="text-sm text-dark-400">Multi-advertiser billing system</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass rounded-2xl p-5 mb-6 border border-brand-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Prepaid Billing System</h3>
            <div className="space-y-2 text-sm text-dark-400">
              <p>
                <strong className="text-white">Per-Quote Charging:</strong> Advertisers are charged for each quote generated with their ad.
              </p>
              <p>
                <strong className="text-white">Prepaid Credits:</strong> Advertisers buy credits upfront. Ads stop showing when budget is depleted.
              </p>
              <p>
                <strong className="text-white">Tracking:</strong> Impressions (quotes), clicks (URL visits), and gallery shares are all tracked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">Admin API Key</label>
        </div>
        <input
          type="password"
          placeholder="Paste your admin API key here"
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
        <div className="space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-dark-400 mb-1">
                  <Megaphone className="w-4 h-4" />
                  <span className="text-xs">Total</span>
                </div>
                <p className="text-xl font-bold">{stats.totalAds}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Active</span>
                </div>
                <p className="text-xl font-bold">{stats.activeAds}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-brand-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">Quotes</span>
                </div>
                <p className="text-xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <MousePointerClick className="w-4 h-4" />
                  <span className="text-xs">Clicks</span>
                </div>
                <p className="text-xl font-bold">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Shares</span>
                </div>
                <p className="text-xl font-bold">{stats.totalGalleryShares.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">CTR</span>
                </div>
                <p className="text-xl font-bold">{stats.overallCtr}%</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Revenue</span>
                </div>
                <p className="text-xl font-bold">{formatCents(stats.totalRevenueCents)}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs">Pending</span>
                </div>
                <p className="text-xl font-bold">{formatCents(stats.remainingBudgetCents)}</p>
              </div>
            </div>
          )}

          {/* All Ads */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">Advertisers</h2>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 px-4 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Add Advertiser
              </button>
            </div>

            {ads.length === 0 ? (
              <div className="text-center py-8 text-dark-400 border-2 border-dashed border-dark-700 rounded-xl">
                <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No ads yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700 text-left text-dark-400">
                      <th className="pb-3 font-medium">Advertiser</th>
                      <th className="pb-3 font-medium">Handle</th>
                      <th className="pb-3 font-medium text-center">Type</th>
                      <th className="pb-3 font-medium text-right">Budget</th>
                      <th className="pb-3 font-medium text-right">Quotes</th>
                      <th className="pb-3 font-medium text-right">Clicks</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {ads.map(ad => {
                      const remaining = getRemainingBudget(ad)
                      const remainingQuotes = getRemainingQuotes(ad)
                      return (
                        <tr key={ad.id} className={`hover:bg-dark-800/50 ${!ad.enabled ? 'opacity-50' : ''}`}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                ad.enabled ? 'bg-brand-500/20' : 'bg-dark-700'
                              }`}>
                                {ad.enabled ? (
                                  <Eye className="w-4 h-4 text-brand-400" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-dark-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {ad.advertiserName || ad.name || 'Unnamed'}
                                </p>
                                <p className="text-xs text-dark-500 truncate max-w-[180px]">
                                  {ad.shortText}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            {ad.handle ? (
                              <div className="flex items-center gap-2">
                                <code className="text-brand-400 bg-dark-900 px-2 py-1 rounded text-xs">
                                  /go/{ad.handle}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(`https://quotecord.com/go/${ad.handle}`)}
                                  className="text-dark-500 hover:text-white"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-dark-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`text-xs px-2 py-1 rounded ${
                              ad.billingType === 'free' ? 'bg-dark-700 text-dark-300' :
                              ad.billingType === 'prepaid' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {ad.billingType}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {ad.billingType === 'prepaid' ? (
                              <div>
                                <p className={`font-mono ${remaining !== null && remaining <= 0 ? 'text-error' : 'text-white'}`}>
                                  {formatCents(remaining || 0)}
                                </p>
                                <p className="text-xs text-dark-500">
                                  of {formatCents(ad.budgetCents)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-dark-500">—</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <p className="font-mono">{ad.impressions.toLocaleString()}</p>
                            {remainingQuotes !== null && (
                              <p className="text-xs text-dark-500">
                                ~{remainingQuotes.toLocaleString()} left
                              </p>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <p className="font-mono">{ad.clicks.toLocaleString()}</p>
                            <p className="text-xs text-dark-500">
                              {getCtr(ad.impressions, ad.clicks)}% CTR
                            </p>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-1">
                              {ad.destinationUrl && (
                                <a
                                  href={ad.destinationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleToggleEnabled(ad)}
                                className={`p-2 rounded-lg ${
                                  ad.enabled
                                    ? 'text-success hover:bg-dark-700'
                                    : 'text-dark-500 hover:text-success hover:bg-success/10'
                                }`}
                              >
                                {ad.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => handleEdit(ad)}
                                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ad)}
                                className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => !saving && setShowForm(false)} />
          <div className="relative glass rounded-2xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold">{editingAd ? 'Edit Advertiser' : 'Add Advertiser'}</h2>
              <button onClick={() => !saving && setShowForm(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Advertiser Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Advertiser Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Logitech"
                      value={formData.advertiserName}
                      onChange={(e) => setFormData(prev => ({ ...prev, advertiserName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      placeholder="ads@company.com"
                      value={formData.advertiserEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, advertiserEmail: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="space-y-4 pt-4 border-t border-dark-800">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Billing Type</label>
                    <select
                      value={formData.billingType}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingType: e.target.value as BillingType }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    >
                      <option value="free">Free (internal)</option>
                      <option value="prepaid">Prepaid</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost per Quote (¢)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.costPerQuoteCents}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPerQuoteCents: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                    <p className="text-xs text-dark-500 mt-1">{formatCents(formData.costPerQuoteCents)} per quote</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget (¢)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.budgetCents}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetCents: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                    <p className="text-xs text-dark-500 mt-1">{formatCents(formData.budgetCents)} total</p>
                  </div>
                </div>
                {formData.billingType === 'prepaid' && formData.budgetCents > 0 && (
                  <div className="bg-dark-800/50 rounded-xl p-3">
                    <p className="text-sm text-dark-300">
                      This budget allows for approximately <strong className="text-white">
                        {Math.floor(formData.budgetCents / formData.costPerQuoteCents).toLocaleString()}
                      </strong> quotes at {formatCents(formData.costPerQuoteCents)} each.
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking URL */}
              <div className="space-y-4 pt-4 border-t border-dark-800">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Tracking URL</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <LinkIcon className="w-4 h-4 text-brand-400" />
                      Handle
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-dark-900 border border-r-0 border-dark-700 rounded-l-xl text-sm text-dark-500">
                        /go/
                      </span>
                      <input
                        type="text"
                        placeholder="logitech"
                        value={formData.handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value.toLowerCase() }))}
                        className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-r-xl text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Destination URL</label>
                    <input
                      type="url"
                      placeholder="https://logitech.com/promo"
                      value={formData.destinationUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, destinationUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Content */}
              <div className="space-y-4 pt-4 border-t border-dark-800">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Ad Content</h3>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Type className="w-4 h-4 text-brand-400" />
                    Full Text <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sponsored by Logitech • Shop gaming gear"
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    maxLength={150}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <AlignLeft className="w-4 h-4 text-brand-400" />
                    Short Text <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sponsored • logitech.com"
                    value={formData.shortText}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortText: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    maxLength={80}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4 pt-4 border-t border-dark-800">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Weight className="w-4 h-4 text-brand-400" />
                      Weight
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                  <div>
                    <span className="text-sm font-medium">Enabled</span>
                    <p className="text-xs text-dark-500">Include in ad rotation</p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={formData.enabled ? 'text-success' : 'text-dark-500'}
                  >
                    {formData.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
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
                {editingAd ? 'Save Changes' : 'Add Advertiser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
