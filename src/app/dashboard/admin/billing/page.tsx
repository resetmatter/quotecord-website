'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  DollarSign,
  Gift,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Save,
  Info,
  Copy,
  Clock,
  Users,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import type {
  BillingSettings,
  StripePrice,
  StripePromotionCode,
  PromoTrialRule
} from '@/types/billing'

export default function BillingSettingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Key
  const getApiKey = () => typeof window !== 'undefined' ? localStorage.getItem('adminApiKey') || '' : ''
  const setApiKey = (key: string) => typeof window !== 'undefined' && localStorage.setItem('adminApiKey', key)

  // State
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [prices, setPrices] = useState<StripePrice[]>([])
  const [promoCodes, setPromoCodes] = useState<StripePromotionCode[]>([])
  const [trialRules, setTrialRules] = useState<PromoTrialRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create Promo Form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [promoForm, setPromoForm] = useState({
    code: '',
    trialDays: '30',
    discountPercent: '100',
    maxRedemptions: '',
    expiresAt: '',
    createdFor: ''
  })

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const headers = { 'Authorization': `Bearer ${getApiKey()}` }

      const [settingsRes, pricesRes, promoRes, rulesRes] = await Promise.all([
        fetch('/api/admin/billing/settings', { headers }),
        fetch('/api/admin/billing/prices', { headers }),
        fetch('/api/admin/billing/promo-codes', { headers }),
        fetch('/api/admin/billing/trial-rules', { headers })
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setBillingSettings(data.settings)
      }
      if (pricesRes.ok) {
        const data = await pricesRes.json()
        setPrices(data.prices || [])
      }
      if (promoRes.ok) {
        const data = await promoRes.json()
        setPromoCodes(data.promoCodes || [])
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json()
        setTrialRules(data.rules || [])
      }
    } catch (err) {
      setError('Failed to load data. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 5000); return () => clearTimeout(t) } }, [success])

  // Save Settings
  const handleSaveSettings = async () => {
    if (!billingSettings) return
    try {
      setSaving(true)
      const response = await fetch('/api/admin/billing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getApiKey()}` },
        body: JSON.stringify({ ...billingSettings, updatedBy: 'admin' })
      })
      if (!response.ok) throw new Error('Failed to save')
      setSuccess('Settings saved!')
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Create Promo (all-in-one: coupon + promo code + trial rule)
  const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.trialDays) {
      setError('Please enter a promo code and trial days')
      return
    }

    try {
      setCreating(true)
      setError(null)
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getApiKey()}` }

      // Step 1: Create coupon (100% off for trial effect, or custom percent)
      const couponRes = await fetch('/api/admin/billing/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `${promoForm.code} - ${promoForm.trialDays} day trial`,
          percentOff: parseInt(promoForm.discountPercent) || 100,
          duration: 'once',
          purpose: `Trial promo for ${promoForm.createdFor || 'general use'}`,
          createdFor: promoForm.createdFor,
          createdBy: 'admin'
        })
      })

      if (!couponRes.ok) {
        const data = await couponRes.json()
        throw new Error(data.error || 'Failed to create coupon')
      }

      const { coupon } = await couponRes.json()

      // Step 2: Create promo code
      const promoRes = await fetch('/api/admin/billing/promo-codes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          couponId: coupon.id,
          code: promoForm.code.toUpperCase(),
          maxRedemptions: promoForm.maxRedemptions ? parseInt(promoForm.maxRedemptions) : undefined,
          expiresAt: promoForm.expiresAt || undefined,
          createdFor: promoForm.createdFor,
          createdBy: 'admin'
        })
      })

      if (!promoRes.ok) {
        const data = await promoRes.json()
        throw new Error(data.error || 'Failed to create promo code')
      }

      // Step 3: Create trial rule
      const ruleRes = await fetch('/api/admin/billing/trial-rules', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          promoCode: promoForm.code.toUpperCase(),
          name: `${promoForm.trialDays}-day trial: ${promoForm.code.toUpperCase()}`,
          description: promoForm.createdFor ? `For ${promoForm.createdFor}` : undefined,
          trialDays: parseInt(promoForm.trialDays),
          isActive: true,
          createdBy: 'admin'
        })
      })

      if (!ruleRes.ok) {
        const data = await ruleRes.json()
        throw new Error(data.error || 'Failed to create trial rule')
      }

      setSuccess(`Promo "${promoForm.code.toUpperCase()}" created with ${promoForm.trialDays}-day free trial!`)
      setShowCreateForm(false)
      setPromoForm({ code: '', trialDays: '30', discountPercent: '100', maxRedemptions: '', expiresAt: '', createdFor: '' })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo')
    } finally {
      setCreating(false)
    }
  }

  // Delete promo (deactivate promo code + delete trial rule)
  const handleDeletePromo = async (code: string, promoId: string, ruleId?: string) => {
    if (!confirm(`Delete promo "${code}"? Users won't be able to use this code anymore.`)) return

    try {
      const headers = { 'Authorization': `Bearer ${getApiKey()}` }
      await fetch(`/api/admin/billing/promo-codes?id=${promoId}`, { method: 'DELETE', headers })
      if (ruleId) {
        await fetch(`/api/admin/billing/trial-rules?id=${ruleId}`, { method: 'DELETE', headers })
      }
      setSuccess(`Promo "${code}" deleted`)
      fetchData()
    } catch {
      setError('Failed to delete promo')
    }
  }

  // Helpers
  const formatCurrency = (amount: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100)

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); setSuccess('Copied!') }

  const getTrialDays = (code: string) => trialRules.find(r => r.promoCode === code)?.trialDays || 0
  const getTrialRule = (code: string) => trialRules.find(r => r.promoCode === code)

  // Filter to only show active promos
  const activePromos = promoCodes.filter(p => p.active)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Billing Settings</h1>
          <p className="text-sm text-dark-400">Manage prices and promotional offers</p>
        </div>
      </div>

      {/* API Key */}
      <div className="glass rounded-xl p-4 mb-6">
        <label className="block text-xs text-dark-500 mb-2">Admin API Key</label>
        <input
          type="password"
          placeholder="Enter your admin API key"
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
          {/* Subscription Prices */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">Subscription Prices</h2>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 px-4 rounded-xl disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Plan ($1.99/mo)</label>
                <select
                  value={billingSettings?.monthlyPriceId || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, monthlyPriceId: e.target.value } : null)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select price...</option>
                  {prices.filter(p => p.recurring?.interval === 'month').map(price => (
                    <option key={price.id} value={price.id}>
                      {price.nickname || price.id.slice(0, 20)} - {formatCurrency(price.unitAmount || 0)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Annual Plan ($19.99/yr)</label>
                <select
                  value={billingSettings?.annualPriceId || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, annualPriceId: e.target.value } : null)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select price...</option>
                  {prices.filter(p => p.recurring?.interval === 'year').map(price => (
                    <option key={price.id} value={price.id}>
                      {price.nickname || price.id.slice(0, 20)} - {formatCurrency(price.unitAmount || 0)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-dark-800/50 rounded-xl">
              <span className="text-sm">Allow promo codes at checkout</span>
              <button
                onClick={() => setBillingSettings(prev => prev ? { ...prev, allowPromotionCodes: !prev.allowPromotionCodes } : null)}
                className={billingSettings?.allowPromotionCodes ? 'text-success' : 'text-dark-500'}
              >
                {billingSettings?.allowPromotionCodes ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>

          {/* Promotional Offers */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">Promotional Offers</h2>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 px-4 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Create Promo
              </button>
            </div>

            {/* Info */}
            <div className="bg-dark-800/50 rounded-xl p-4 mb-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-400">
                <p>Create promo codes that give communities <strong className="text-white">free trial days</strong>.</p>
                <p className="mt-1">When someone uses a code, they get X days free before billing starts - even on annual plans.</p>
              </div>
            </div>

            {/* Promos List */}
            {activePromos.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No active promos yet</p>
                <p className="text-sm text-dark-500">Create one to give communities free trials</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePromos.map(promo => {
                  const trialDays = getTrialDays(promo.code)
                  const rule = getTrialRule(promo.code)
                  return (
                    <div key={promo.id} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-bold text-brand-400">{promo.code}</code>
                            <button onClick={() => copyToClipboard(promo.code)} className="text-dark-500 hover:text-white">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm text-dark-400">
                            {trialDays > 0 ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {trialDays} days free trial
                              </span>
                            ) : (
                              `${promo.coupon.percentOff || 0}% off`
                            )}
                            {promo.maxRedemptions && ` • ${promo.timesRedeemed}/${promo.maxRedemptions} uses`}
                            {promo.expiresAt && ` • Expires ${formatDate(promo.expiresAt)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePromo(promo.code, promo.id, rule?.id)}
                        className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Promo Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => !creating && setShowCreateForm(false)} />
          <div className="relative glass rounded-2xl max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold">Create Promo Code</h2>
              <button onClick={() => !creating && setShowCreateForm(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g., COMMUNITY30"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-mono focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">The code users will enter at checkout</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Free Trial Days</label>
                <input
                  type="number"
                  placeholder="30"
                  value={promoForm.trialDays}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, trialDays: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">How many days free before billing starts</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Created For <span className="text-dark-500">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g., Gaming Discord Server"
                  value={promoForm.createdFor}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, createdFor: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">Note who this promo is for (just for your reference)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Uses <span className="text-dark-500">(optional)</span></label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={promoForm.maxRedemptions}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expires <span className="text-dark-500">(optional)</span></label>
                  <input
                    type="date"
                    value={promoForm.expiresAt}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-dark-800">
              <button
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromo}
                disabled={creating || !promoForm.code || !promoForm.trialDays}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl disabled:opacity-50"
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Create Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
