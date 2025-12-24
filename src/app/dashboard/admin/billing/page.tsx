'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  DollarSign,
  Tag,
  Ticket,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Save,
  Info,
  Copy,
  ExternalLink,
  Percent,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Gift
} from 'lucide-react'
import type {
  BillingSettings,
  StripePrice,
  StripeCoupon,
  StripePromotionCode,
  PromoTrialRule
} from '@/types/billing'

type TabType = 'prices' | 'coupons' | 'promo-codes' | 'trial-rules'

export default function BillingSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('prices')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Key
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

  // Billing Settings State
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Prices State
  const [prices, setPrices] = useState<StripePrice[]>([])
  const [pricesLoading, setPricesLoading] = useState(true)

  // Coupons State
  const [coupons, setCoupons] = useState<StripeCoupon[]>([])
  const [couponsLoading, setCouponsLoading] = useState(true)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponSaving, setCouponSaving] = useState(false)
  const [deletingCoupon, setDeletingCoupon] = useState<string | null>(null)

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<StripePromotionCode[]>([])
  const [promoCodesLoading, setPromoCodesLoading] = useState(true)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoSaving, setPromoSaving] = useState(false)
  const [deactivatingPromo, setDeactivatingPromo] = useState<string | null>(null)

  // Trial Rules State
  const [trialRules, setTrialRules] = useState<PromoTrialRule[]>([])
  const [trialRulesLoading, setTrialRulesLoading] = useState(true)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [editingRule, setEditingRule] = useState<PromoTrialRule | null>(null)
  const [trialSaving, setTrialSaving] = useState(false)
  const [deletingRule, setDeletingRule] = useState<string | null>(null)

  // Form States
  const [couponForm, setCouponForm] = useState({
    name: '',
    discountType: 'percent' as 'percent' | 'amount',
    percentOff: '',
    amountOff: '',
    currency: 'usd',
    duration: 'once' as 'forever' | 'once' | 'repeating',
    durationInMonths: '',
    maxRedemptions: '',
    redeemBy: '',
    purpose: '',
    createdFor: '',
    createdBy: ''
  })

  const [promoForm, setPromoForm] = useState({
    couponId: '',
    code: '',
    maxRedemptions: '',
    expiresAt: '',
    purpose: '',
    createdFor: '',
    createdBy: ''
  })

  const [trialForm, setTrialForm] = useState({
    promoCode: '',
    name: '',
    description: '',
    trialDays: '',
    isActive: true,
    applicablePlan: '' as '' | 'monthly' | 'annual',
    restrictedGuildIds: '',
    notes: '',
    createdBy: ''
  })

  // Fetch Functions
  const fetchBillingSettings = useCallback(async () => {
    try {
      setSettingsLoading(true)
      const response = await fetch('/api/admin/billing/settings', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })
      if (!response.ok) throw new Error('Failed to fetch billing settings')
      const data = await response.json()
      setBillingSettings(data.settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing settings')
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const fetchPrices = useCallback(async () => {
    try {
      setPricesLoading(true)
      const response = await fetch('/api/admin/billing/prices', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })
      if (!response.ok) throw new Error('Failed to fetch prices')
      const data = await response.json()
      setPrices(data.prices || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
    } finally {
      setPricesLoading(false)
    }
  }, [])

  const fetchCoupons = useCallback(async () => {
    try {
      setCouponsLoading(true)
      const response = await fetch('/api/admin/billing/coupons', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })
      if (!response.ok) throw new Error('Failed to fetch coupons')
      const data = await response.json()
      setCoupons(data.coupons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons')
    } finally {
      setCouponsLoading(false)
    }
  }, [])

  const fetchPromoCodes = useCallback(async () => {
    try {
      setPromoCodesLoading(true)
      const response = await fetch('/api/admin/billing/promo-codes', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })
      if (!response.ok) throw new Error('Failed to fetch promo codes')
      const data = await response.json()
      setPromoCodes(data.promoCodes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promo codes')
    } finally {
      setPromoCodesLoading(false)
    }
  }, [])

  const fetchTrialRules = useCallback(async () => {
    try {
      setTrialRulesLoading(true)
      const response = await fetch('/api/admin/billing/trial-rules', {
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })
      if (!response.ok) throw new Error('Failed to fetch trial rules')
      const data = await response.json()
      setTrialRules(data.rules || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trial rules')
    } finally {
      setTrialRulesLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchBillingSettings()
    fetchPrices()
    fetchCoupons()
    fetchPromoCodes()
    fetchTrialRules()
  }, [fetchBillingSettings, fetchPrices, fetchCoupons, fetchPromoCodes, fetchTrialRules])

  // Clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Save Billing Settings
  const handleSaveSettings = async () => {
    if (!billingSettings) return

    try {
      setSettingsSaving(true)
      setError(null)

      const response = await fetch('/api/admin/billing/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify({
          ...billingSettings,
          updatedBy: 'admin'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Billing settings saved successfully')
      fetchBillingSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  // Create Coupon
  const handleCreateCoupon = async () => {
    try {
      setCouponSaving(true)
      setError(null)

      const payload: Record<string, any> = {
        name: couponForm.name,
        duration: couponForm.duration,
        purpose: couponForm.purpose || undefined,
        createdFor: couponForm.createdFor || undefined,
        createdBy: couponForm.createdBy || undefined
      }

      if (couponForm.discountType === 'percent') {
        payload.percentOff = parseFloat(couponForm.percentOff)
      } else {
        payload.amountOff = Math.round(parseFloat(couponForm.amountOff) * 100)
        payload.currency = couponForm.currency
      }

      if (couponForm.duration === 'repeating' && couponForm.durationInMonths) {
        payload.durationInMonths = parseInt(couponForm.durationInMonths)
      }

      if (couponForm.maxRedemptions) {
        payload.maxRedemptions = parseInt(couponForm.maxRedemptions)
      }

      if (couponForm.redeemBy) {
        payload.redeemBy = couponForm.redeemBy
      }

      const response = await fetch('/api/admin/billing/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create coupon')
      }

      setSuccess('Coupon created successfully')
      setShowCouponModal(false)
      setCouponForm({
        name: '', discountType: 'percent', percentOff: '', amountOff: '', currency: 'usd',
        duration: 'once', durationInMonths: '', maxRedemptions: '', redeemBy: '',
        purpose: '', createdFor: '', createdBy: ''
      })
      fetchCoupons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
    } finally {
      setCouponSaving(false)
    }
  }

  // Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This cannot be undone.')) return

    try {
      setDeletingCoupon(couponId)
      const response = await fetch(`/api/admin/billing/coupons?id=${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete coupon')
      }

      setSuccess('Coupon deleted successfully')
      fetchCoupons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coupon')
    } finally {
      setDeletingCoupon(null)
    }
  }

  // Create Promo Code
  const handleCreatePromoCode = async () => {
    try {
      setPromoSaving(true)
      setError(null)

      const payload: Record<string, any> = {
        couponId: promoForm.couponId,
        code: promoForm.code,
        purpose: promoForm.purpose || undefined,
        createdFor: promoForm.createdFor || undefined,
        createdBy: promoForm.createdBy || undefined
      }

      if (promoForm.maxRedemptions) {
        payload.maxRedemptions = parseInt(promoForm.maxRedemptions)
      }

      if (promoForm.expiresAt) {
        payload.expiresAt = promoForm.expiresAt
      }

      const response = await fetch('/api/admin/billing/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create promo code')
      }

      setSuccess('Promo code created successfully')
      setShowPromoModal(false)
      setPromoForm({
        couponId: '', code: '', maxRedemptions: '', expiresAt: '',
        purpose: '', createdFor: '', createdBy: ''
      })
      fetchPromoCodes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo code')
    } finally {
      setPromoSaving(false)
    }
  }

  // Deactivate Promo Code
  const handleDeactivatePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to deactivate this promo code?')) return

    try {
      setDeactivatingPromo(promoId)
      const response = await fetch(`/api/admin/billing/promo-codes?id=${promoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to deactivate promo code')
      }

      setSuccess('Promo code deactivated successfully')
      fetchPromoCodes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate promo code')
    } finally {
      setDeactivatingPromo(null)
    }
  }

  // Create/Update Trial Rule
  const handleSaveTrialRule = async () => {
    try {
      setTrialSaving(true)
      setError(null)

      const payload: Record<string, any> = {
        promoCode: trialForm.promoCode,
        name: trialForm.name,
        description: trialForm.description || undefined,
        trialDays: parseInt(trialForm.trialDays),
        isActive: trialForm.isActive,
        applicablePlan: trialForm.applicablePlan || null,
        restrictedGuildIds: trialForm.restrictedGuildIds || undefined,
        notes: trialForm.notes || undefined,
        createdBy: trialForm.createdBy || undefined
      }

      const url = editingRule
        ? `/api/admin/billing/trial-rules?id=${editingRule.id}`
        : '/api/admin/billing/trial-rules'

      const response = await fetch(url, {
        method: editingRule ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save trial rule')
      }

      setSuccess(editingRule ? 'Trial rule updated successfully' : 'Trial rule created successfully')
      setShowTrialModal(false)
      setEditingRule(null)
      setTrialForm({
        promoCode: '', name: '', description: '', trialDays: '', isActive: true,
        applicablePlan: '', restrictedGuildIds: '', notes: '', createdBy: ''
      })
      fetchTrialRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trial rule')
    } finally {
      setTrialSaving(false)
    }
  }

  // Delete Trial Rule
  const handleDeleteTrialRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this trial rule?')) return

    try {
      setDeletingRule(ruleId)
      const response = await fetch(`/api/admin/billing/trial-rules?id=${ruleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getApiKey()}` }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete trial rule')
      }

      setSuccess('Trial rule deleted successfully')
      fetchTrialRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trial rule')
    } finally {
      setDeletingRule(null)
    }
  }

  // Helpers
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
  }

  const openTrialModal = (rule?: PromoTrialRule) => {
    if (rule) {
      setEditingRule(rule)
      setTrialForm({
        promoCode: rule.promoCode,
        name: rule.name,
        description: rule.description || '',
        trialDays: rule.trialDays.toString(),
        isActive: rule.isActive,
        applicablePlan: rule.applicablePlan || '',
        restrictedGuildIds: rule.restrictedGuildIds || '',
        notes: rule.notes || '',
        createdBy: rule.updatedBy || rule.createdBy || ''
      })
    } else {
      setEditingRule(null)
      setTrialForm({
        promoCode: '', name: '', description: '', trialDays: '', isActive: true,
        applicablePlan: '', restrictedGuildIds: '', notes: '', createdBy: ''
      })
    }
    setShowTrialModal(true)
  }

  return (
    <div className="max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Billing Settings</h1>
            <p className="text-sm text-dark-400">Manage Stripe prices, coupons, and trial rules</p>
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
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-success/10 border border-success/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-dark-800 rounded-lg">
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-dark-700 overflow-x-auto">
        {[
          { key: 'prices', label: 'Prices', icon: DollarSign },
          { key: 'coupons', label: 'Coupons', icon: Tag },
          { key: 'promo-codes', label: 'Promo Codes', icon: Ticket },
          { key: 'trial-rules', label: 'Trial Rules', icon: Clock }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-brand-400 border-brand-500'
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-dark-400">
              <p className="font-medium text-white mb-1">Active Price Configuration</p>
              <p>
                Select which Stripe price IDs to use for monthly and annual subscriptions.
                The checkout flow will use these prices when creating subscriptions.
              </p>
            </div>
          </div>

          {/* Current Settings */}
          {!settingsLoading && billingSettings && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Active Price IDs</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Price ID</label>
                  <select
                    value={billingSettings.monthlyPriceId}
                    onChange={(e) => setBillingSettings(prev => prev ? { ...prev, monthlyPriceId: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select a price...</option>
                    {prices.filter(p => p.recurring?.interval === 'month').map(price => (
                      <option key={price.id} value={price.id}>
                        {price.nickname || price.id} - {formatCurrency(price.unitAmount || 0, price.currency)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-dark-500 mt-1">Current: {billingSettings.monthlyPriceId || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Annual Price ID</label>
                  <select
                    value={billingSettings.annualPriceId}
                    onChange={(e) => setBillingSettings(prev => prev ? { ...prev, annualPriceId: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select a price...</option>
                    {prices.filter(p => p.recurring?.interval === 'year').map(price => (
                      <option key={price.id} value={price.id}>
                        {price.nickname || price.id} - {formatCurrency(price.unitAmount || 0, price.currency)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-dark-500 mt-1">Current: {billingSettings.annualPriceId || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-dark-400" />
                  <div>
                    <span className="text-sm font-medium">Allow Promotion Codes</span>
                    <p className="text-xs text-dark-500">Enable customers to apply promo codes at checkout</p>
                  </div>
                </div>
                <button
                  onClick={() => setBillingSettings(prev => prev ? { ...prev, allowPromotionCodes: !prev.allowPromotionCodes } : null)}
                  className={`p-2 rounded-lg transition-colors ${billingSettings.allowPromotionCodes ? 'text-success' : 'text-dark-500'}`}
                >
                  {billingSettings.allowPromotionCodes ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {settingsSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* All Prices List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
              <h2 className="font-semibold">All Stripe Prices</h2>
              <button
                onClick={fetchPrices}
                disabled={pricesLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {pricesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : prices.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No prices found in Stripe</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {prices.map(price => (
                  <div key={price.id} className="p-4 hover:bg-dark-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          price.id === billingSettings?.monthlyPriceId || price.id === billingSettings?.annualPriceId
                            ? 'bg-success/20 text-success'
                            : 'bg-dark-800 text-dark-400'
                        }`}>
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{price.nickname || 'Unnamed'}</span>
                            {(price.id === billingSettings?.monthlyPriceId || price.id === billingSettings?.annualPriceId) && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">Active</span>
                            )}
                          </div>
                          <p className="text-sm text-dark-400">
                            {formatCurrency(price.unitAmount || 0, price.currency)}
                            {price.recurring && ` / ${price.recurring.interval}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(price.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        {price.id}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-dark-400">
              <p className="font-medium text-white mb-1">About Coupons</p>
              <p>
                Coupons define the discount amount. After creating a coupon, create a Promo Code
                that users can enter at checkout. The coupon defines the discount, the promo code
                is what users type in.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={fetchCoupons}
              disabled={couponsLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
            >
              <RefreshCw className={`w-4 h-4 ${couponsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          </div>

          {/* Coupons List */}
          <div className="glass rounded-2xl overflow-hidden">
            {couponsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No coupons found</p>
                <p className="text-sm text-dark-500">Create your first coupon to offer discounts</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="p-4 hover:bg-dark-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          coupon.valid ? 'bg-success/20 text-success' : 'bg-dark-800 text-dark-400'
                        }`}>
                          {coupon.percentOff ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{coupon.name || coupon.id}</span>
                            {!coupon.valid && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error">Expired</span>
                            )}
                          </div>
                          <p className="text-sm text-dark-400">
                            {coupon.percentOff ? `${coupon.percentOff}% off` : formatCurrency(coupon.amountOff || 0, coupon.currency || 'usd')}
                            {' • '}
                            {coupon.duration === 'forever' ? 'Forever' :
                             coupon.duration === 'once' ? 'Once' :
                             `${coupon.durationInMonths} months`}
                            {' • '}
                            {coupon.timesRedeemed} uses
                            {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(coupon.id)}
                          className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white"
                          title="Copy ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={deletingCoupon === coupon.id}
                          className="p-2 hover:bg-error/20 rounded-lg text-dark-400 hover:text-error disabled:opacity-50"
                        >
                          {deletingCoupon === coupon.id ? (
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
        </div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promo-codes' && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-dark-400">
              <p className="font-medium text-white mb-1">About Promo Codes</p>
              <p>
                Promo codes are the actual codes users enter at checkout (like &quot;FIRSTMONTHFREE&quot;).
                Each promo code is linked to a coupon that defines the discount.
                To give communities free trial days, create a promo code here, then add a Trial Rule on the next tab.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={fetchPromoCodes}
              disabled={promoCodesLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
            >
              <RefreshCw className={`w-4 h-4 ${promoCodesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create Promo Code
            </button>
          </div>

          {/* Promo Codes List */}
          <div className="glass rounded-2xl overflow-hidden">
            {promoCodesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No promo codes found</p>
                <p className="text-sm text-dark-500">Create a coupon first, then create a promo code</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {promoCodes.map(promo => (
                  <div key={promo.id} className="p-4 hover:bg-dark-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          promo.active ? 'bg-success/20 text-success' : 'bg-dark-800 text-dark-400'
                        }`}>
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-bold text-brand-400">{promo.code}</code>
                            {!promo.active && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-dark-400">
                            {promo.coupon.percentOff ? `${promo.coupon.percentOff}% off` :
                             formatCurrency(promo.coupon.amountOff || 0, promo.coupon.currency || 'usd')}
                            {' • '}
                            {promo.timesRedeemed} uses
                            {promo.maxRedemptions && ` / ${promo.maxRedemptions}`}
                            {promo.expiresAt && ` • Expires ${formatDate(promo.expiresAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(promo.code)}
                          className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white"
                          title="Copy Code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {promo.active && (
                          <button
                            onClick={() => handleDeactivatePromo(promo.id)}
                            disabled={deactivatingPromo === promo.id}
                            className="p-2 hover:bg-error/20 rounded-lg text-dark-400 hover:text-error disabled:opacity-50"
                          >
                            {deactivatingPromo === promo.id ? (
                              <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trial Rules Tab */}
      {activeTab === 'trial-rules' && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-dark-400">
              <p className="font-medium text-white mb-1">About Trial Rules</p>
              <p>
                Trial rules map promo codes to free trial periods. When a user applies a promo code
                at checkout, the system checks if there&apos;s a trial rule for that code and applies
                the trial days to their subscription. This way, they get X days free before billing starts,
                even on annual plans.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={fetchTrialRules}
              disabled={trialRulesLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
            >
              <RefreshCw className={`w-4 h-4 ${trialRulesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => openTrialModal()}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create Trial Rule
            </button>
          </div>

          {/* Trial Rules List */}
          <div className="glass rounded-2xl overflow-hidden">
            {trialRulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : trialRules.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No trial rules configured</p>
                <p className="text-sm text-dark-500">Create a trial rule to give communities free trial periods</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-800">
                {trialRules.map(rule => (
                  <div key={rule.id} className="p-4 hover:bg-dark-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          rule.isActive ? 'bg-success/20 text-success' : 'bg-dark-800 text-dark-400'
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rule.name}</span>
                            {!rule.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-dark-400">
                            <code className="font-mono text-brand-400">{rule.promoCode}</code>
                            {' → '}
                            <span className="font-semibold text-white">{rule.trialDays} days free</span>
                            {rule.applicablePlan && ` (${rule.applicablePlan} only)`}
                          </p>
                          {rule.description && (
                            <p className="text-xs text-dark-500 mt-1">{rule.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTrialModal(rule)}
                          className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrialRule(rule.id)}
                          disabled={deletingRule === rule.id}
                          className="p-2 hover:bg-error/20 rounded-lg text-dark-400 hover:text-error disabled:opacity-50"
                        >
                          {deletingRule === rule.id ? (
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
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !couponSaving && setShowCouponModal(false)} />
          <div className="relative glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">Create Coupon</h2>
              <button onClick={() => !couponSaving && setShowCouponModal(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Name *</label>
                <input
                  type="text"
                  placeholder="e.g., 30-Day Free Trial"
                  value={couponForm.name}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">A friendly name to identify this coupon</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'percent', label: 'Percentage Off', icon: Percent },
                    { value: 'amount', label: 'Fixed Amount', icon: DollarSign }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCouponForm(prev => ({ ...prev, discountType: opt.value as 'percent' | 'amount' }))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        couponForm.discountType === opt.value
                          ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                          : 'border-dark-700 hover:border-dark-600 text-dark-400'
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {couponForm.discountType === 'percent' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Percent Off *</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={couponForm.percentOff}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, percentOff: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500">%</span>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">Enter 100 for 100% off (free)</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Amount Off *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.99"
                      value={couponForm.amountOff}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, amountOff: e.target.value }))}
                      className="w-full pl-8 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">The fixed dollar amount to discount</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={couponForm.duration}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, duration: e.target.value as any }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="once">Once (first payment only)</option>
                  <option value="repeating">Repeating (multiple months)</option>
                  <option value="forever">Forever (all payments)</option>
                </select>
                <p className="text-xs text-dark-500 mt-1">
                  {couponForm.duration === 'once' && 'Discount applies only to the first invoice'}
                  {couponForm.duration === 'repeating' && 'Discount applies for a set number of months'}
                  {couponForm.duration === 'forever' && 'Discount applies to all future invoices'}
                </p>
              </div>

              {couponForm.duration === 'repeating' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Duration in Months *</label>
                  <input
                    type="number"
                    placeholder="e.g., 3"
                    value={couponForm.durationInMonths}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, durationInMonths: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-xs text-dark-500 mt-1">How many months the discount should apply</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Max Redemptions (optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={couponForm.maxRedemptions}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">Maximum number of times this coupon can be used total</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date (optional)</label>
                <input
                  type="datetime-local"
                  value={couponForm.redeemBy}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, redeemBy: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">After this date, the coupon cannot be applied</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purpose (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Beta tester reward"
                  value={couponForm.purpose}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">Internal note about why this coupon was created</p>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <button
                onClick={() => setShowCouponModal(false)}
                disabled={couponSaving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoupon}
                disabled={couponSaving || !couponForm.name || (!couponForm.percentOff && !couponForm.amountOff)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl disabled:opacity-50"
              >
                {couponSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !promoSaving && setShowPromoModal(false)} />
          <div className="relative glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">Create Promo Code</h2>
              <button onClick={() => !promoSaving && setShowPromoModal(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Coupon *</label>
                <select
                  value={promoForm.couponId}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, couponId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Choose a coupon...</option>
                  {coupons.filter(c => c.valid).map(coupon => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.name || coupon.id} ({coupon.percentOff ? `${coupon.percentOff}%` : formatCurrency(coupon.amountOff || 0, coupon.currency || 'usd')} off)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">The coupon that defines the discount amount</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Promo Code *</label>
                <input
                  type="text"
                  placeholder="e.g., FIRSTMONTHFREE"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-mono"
                />
                <p className="text-xs text-dark-500 mt-1">The code users will type at checkout (auto-capitalized)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Redemptions (optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={promoForm.maxRedemptions}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">Maximum number of times this code can be used</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date (optional)</label>
                <input
                  type="datetime-local"
                  value={promoForm.expiresAt}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">After this date, the code cannot be used</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Created For (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Discord Community XYZ"
                  value={promoForm.createdFor}
                  onChange={(e) => setPromoForm(prev => ({ ...prev, createdFor: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">Note who this code was created for</p>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <button
                onClick={() => setShowPromoModal(false)}
                disabled={promoSaving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromoCode}
                disabled={promoSaving || !promoForm.couponId || !promoForm.code}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl disabled:opacity-50"
              >
                {promoSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Create Promo Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Trial Rule Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !trialSaving && setShowTrialModal(false)} />
          <div className="relative glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">{editingRule ? 'Edit Trial Rule' : 'Create Trial Rule'}</h2>
              <button onClick={() => !trialSaving && setShowTrialModal(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Promo Code *</label>
                <input
                  type="text"
                  placeholder="e.g., FIRSTMONTHFREE"
                  value={trialForm.promoCode}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
                  disabled={!!editingRule}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-mono disabled:opacity-50"
                />
                <p className="text-xs text-dark-500 mt-1">
                  The Stripe promo code or promotion code ID this rule applies to.
                  This should match an existing promo code in Stripe.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rule Name *</label>
                <input
                  type="text"
                  placeholder="e.g., First Month Free Trial"
                  value={trialForm.name}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">A friendly name for this trial rule</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trial Days *</label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={trialForm.trialDays}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, trialDays: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">
                  Number of free days before billing starts.
                  For annual plans, this means X days free trial, then the annual charge begins.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Applicable Plan</label>
                <select
                  value={trialForm.applicablePlan}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, applicablePlan: e.target.value as any }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">All Plans</option>
                  <option value="monthly">Monthly Only</option>
                  <option value="annual">Annual Only</option>
                </select>
                <p className="text-xs text-dark-500 mt-1">
                  Restrict this trial to specific plans, or leave as &quot;All Plans&quot; for both
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                <div>
                  <span className="text-sm font-medium">Active</span>
                  <p className="text-xs text-dark-500">Enable or disable this trial rule</p>
                </div>
                <button
                  onClick={() => setTrialForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`p-2 rounded-lg ${trialForm.isActive ? 'text-success' : 'text-dark-500'}`}
                >
                  {trialForm.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  placeholder="e.g., 30-day free trial for community partners"
                  value={trialForm.description}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-dark-500 mt-1">A description of what this rule does</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Restricted Guild IDs (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 123456789,987654321"
                  value={trialForm.restrictedGuildIds}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, restrictedGuildIds: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-dark-500 mt-1">
                  Comma-separated Discord guild IDs. If set, only users from these servers can use this trial.
                  Leave empty for no restrictions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  placeholder="Internal notes about this rule..."
                  value={trialForm.notes}
                  onChange={(e) => setTrialForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-dark-500 mt-1">Admin notes (not visible to users)</p>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-dark-800 bg-dark-900/80 backdrop-blur-sm">
              <button
                onClick={() => setShowTrialModal(false)}
                disabled={trialSaving}
                className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTrialRule}
                disabled={trialSaving || !trialForm.promoCode || !trialForm.name || !trialForm.trialDays}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-xl disabled:opacity-50"
              >
                {trialSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
