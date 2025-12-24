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
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Zap,
  Users,
  Calendar
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

      // Just create a trial rule in our database - no Stripe coupon needed
      // The trial days are applied via subscription_data.trial_period_days at checkout
      const ruleRes = await fetch('/api/admin/billing/trial-rules', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          promoCode: promoForm.code.toUpperCase(),
          name: `${promoForm.trialDays}-day trial: ${promoForm.code.toUpperCase()}`,
          description: promoForm.createdFor ? `For ${promoForm.createdFor}` : undefined,
          trialDays: parseInt(promoForm.trialDays),
          isActive: true,
          notes: promoForm.createdFor || undefined,
          createdBy: 'admin'
        })
      })

      if (!ruleRes.ok) {
        const data = await ruleRes.json()
        throw new Error(data.error || 'Failed to create promo')
      }

      setSuccess(`Promo "${promoForm.code.toUpperCase()}" created with ${promoForm.trialDays}-day free trial!`)
      setShowCreateForm(false)
      setPromoForm({ code: '', trialDays: '30', maxRedemptions: '', expiresAt: '', createdFor: '' })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo')
    } finally {
      setCreating(false)
    }
  }

  // Delete promo (delete trial rule from our database)
  const handleDeletePromo = async (code: string, ruleId: string) => {
    if (!confirm(`Delete promo "${code}"? Users won't be able to use this code anymore.`)) return

    try {
      const headers = { 'Authorization': `Bearer ${getApiKey()}` }
      await fetch(`/api/admin/billing/trial-rules?id=${ruleId}`, { method: 'DELETE', headers })
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

  // Filter to only show active promos from our trial rules
  const activePromos = trialRules.filter(r => r.isActive)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Billing Settings</h1>
          <p className="text-sm text-dark-400">Manage subscription prices and create promotional offers</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass rounded-2xl p-5 mb-6 border border-brand-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">How This Works</h3>
            <div className="space-y-2 text-sm text-dark-400">
              <p>
                <strong className="text-white">1. Set your prices</strong> — Choose which Stripe price IDs to use for monthly and annual plans.
              </p>
              <p>
                <strong className="text-white">2. Create promo codes</strong> — Give communities free trial days. When someone uses a code like &quot;GAMING30&quot;,
                they get 30 days free before any billing starts.
              </p>
              <p>
                <strong className="text-white">3. Share the code</strong> — Give the promo code to the community. They enter it at checkout and get the free trial.
              </p>
            </div>
            <div className="mt-3 p-3 bg-dark-800/50 rounded-xl">
              <p className="text-xs text-dark-500">
                <strong className="text-dark-300">Note:</strong> Trial days work even on annual plans.
                If you give 30 days free, they try premium for 30 days, then the annual charge begins.
                They don&apos;t get a full year free — just the trial period before billing starts.
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
          {/* Subscription Prices */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
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
            <p className="text-sm text-dark-400 mb-4">
              Select which Stripe prices to use. These are the actual prices users pay for your subscription plans.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium">Monthly Plan</label>
                  <span className="text-xs text-dark-500">($1.99/mo)</span>
                </div>
                <select
                  value={billingSettings?.monthlyPriceId || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, monthlyPriceId: e.target.value } : null)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select a price from Stripe...</option>
                  {prices.filter(p => p.recurring?.interval === 'month').map(price => (
                    <option key={price.id} value={price.id}>
                      {price.nickname || price.id.slice(0, 20)} - {formatCurrency(price.unitAmount || 0)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">Recurring monthly subscription price</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium">Annual Plan</label>
                  <span className="text-xs text-dark-500">($19.99/yr)</span>
                </div>
                <select
                  value={billingSettings?.annualPriceId || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, annualPriceId: e.target.value } : null)}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select a price from Stripe...</option>
                  {prices.filter(p => p.recurring?.interval === 'year').map(price => (
                    <option key={price.id} value={price.id}>
                      {price.nickname || price.id.slice(0, 20)} - {formatCurrency(price.unitAmount || 0)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">Recurring yearly subscription price</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 p-4 bg-dark-800/50 rounded-xl">
              <div>
                <span className="text-sm font-medium">Allow promo codes at checkout</span>
                <p className="text-xs text-dark-500 mt-0.5">Let users enter promotional codes when subscribing</p>
              </div>
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
            <div className="flex items-center justify-between mb-2">
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
            <p className="text-sm text-dark-400 mb-4">
              Create promo codes to give communities free trial days before billing starts.
            </p>

            {/* Quick Example */}
            <div className="bg-dark-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-pro-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium mb-1">Example: Giving a Discord server 30 days free</p>
                  <ol className="text-dark-400 space-y-1 list-decimal list-inside">
                    <li>Click &quot;Create Promo&quot; above</li>
                    <li>Enter code: <code className="text-brand-400 bg-dark-900 px-1.5 py-0.5 rounded">COOLSERVER30</code></li>
                    <li>Set trial days: <code className="text-brand-400 bg-dark-900 px-1.5 py-0.5 rounded">30</code></li>
                    <li>Add a note: &quot;Cool Gaming Server&quot; (so you remember who it&apos;s for)</li>
                    <li>Share the code with the server owner!</li>
                  </ol>
                  <p className="text-dark-500 mt-2 text-xs">
                    When members use COOLSERVER30 at checkout, they get 30 days free, then billing starts automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Promos List */}
            {activePromos.length === 0 ? (
              <div className="text-center py-8 text-dark-400 border-2 border-dashed border-dark-700 rounded-xl">
                <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No active promos yet</p>
                <p className="text-sm text-dark-500 mt-1">Click &quot;Create Promo&quot; to make your first one</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-dark-500 px-1">
                  <span className="flex-1">CODE</span>
                  <span className="w-32 text-center">TRIAL</span>
                  <span className="w-8"></span>
                </div>
                {activePromos.map(rule => (
                  <div key={rule.id} className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800/70 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-brand-400">{rule.promoCode}</code>
                        <button onClick={() => copyToClipboard(rule.promoCode)} className="text-dark-500 hover:text-white" title="Copy code">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {rule.notes && (
                        <p className="text-xs text-dark-500 mt-0.5">{rule.notes}</p>
                      )}
                    </div>
                    <div className="w-32 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-success bg-success/10 px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {rule.trialDays} days
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePromo(rule.promoCode, rule.id)}
                      className="p-2 text-dark-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Delete promo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activePromos.length > 0 && (
              <p className="text-xs text-dark-500 mt-4 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Click the copy icon to copy a promo code, then share it with the community.
              </p>
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

            <div className="p-6 space-y-5">
              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g., COMMUNITY30"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-mono focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1.5">
                  The code users type at checkout. Use letters and numbers only, no spaces.
                </p>
              </div>

              {/* Trial Days */}
              <div>
                <label className="block text-sm font-medium mb-2">Free Trial Days</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="30"
                    min="1"
                    max="365"
                    value={promoForm.trialDays}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, trialDays: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 text-sm">days</span>
                </div>
                <p className="text-xs text-dark-500 mt-1.5">
                  How many days they can use premium for free. Billing starts after this period ends.
                </p>
              </div>

              {/* Created For */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Who is this for? <span className="text-dark-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cool Gaming Discord"
                  value={promoForm.createdFor}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, createdFor: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1.5">
                  A note for yourself so you remember who you gave this code to.
                </p>
              </div>

              {/* Optional Settings */}
              <div className="pt-2 border-t border-dark-800">
                <p className="text-xs text-dark-500 mb-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Optional limits (leave empty for unlimited)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-dark-400">Max Uses</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      min="1"
                      value={promoForm.maxRedemptions}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-dark-400">Expires On</label>
                    <input
                      type="date"
                      value={promoForm.expiresAt}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/50">
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
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-5 rounded-xl disabled:opacity-50"
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
