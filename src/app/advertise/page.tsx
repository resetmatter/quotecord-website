'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Megaphone,
  Users,
  BarChart3,
  Target,
  Sparkles,
  MessageSquare,
  Check,
  ArrowRight,
  Mail,
  Zap,
  Globe,
  Shield,
  Link as LinkIcon,
  Type,
  AlignLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react'

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    handle: '',
    destinationUrl: '',
    text: '',
    shortText: '',
    advertiserName: '',
    advertiserEmail: ''
  })
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [handleMessage, setHandleMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced handle availability check
  useEffect(() => {
    if (!formData.handle) {
      setHandleStatus('idle')
      setHandleMessage('')
      return
    }

    if (formData.handle.length < 3) {
      setHandleStatus('invalid')
      setHandleMessage('At least 3 characters required')
      return
    }

    if (!/^[a-z0-9_-]+$/i.test(formData.handle)) {
      setHandleStatus('invalid')
      setHandleMessage('Only letters, numbers, hyphens, underscores')
      return
    }

    const timer = setTimeout(async () => {
      setHandleStatus('checking')
      try {
        const response = await fetch(`/api/advertise?handle=${encodeURIComponent(formData.handle)}`)
        const data = await response.json()
        if (data.available) {
          setHandleStatus('available')
          setHandleMessage('Handle is available!')
        } else {
          setHandleStatus('taken')
          setHandleMessage(data.reason || 'Handle is taken')
        }
      } catch {
        setHandleStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.handle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid =
    formData.handle.length >= 3 &&
    handleStatus === 'available' &&
    formData.destinationUrl &&
    formData.text &&
    formData.shortText &&
    formData.advertiserName &&
    formData.advertiserEmail

  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Megaphone className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-dark-300">Reach Discord&apos;s most engaged communities</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Advertise with
              <span className="gradient-text"> QuoteCord</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Get your brand in front of thousands of Discord users daily. Create your ad campaign
              in minutes with our self-serve platform.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="glass rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">50K+</p>
              <p className="text-dark-400 text-sm">Monthly Users</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <MessageSquare className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">100K+</p>
              <p className="text-dark-400 text-sm">Quotes Generated</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <Globe className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">5K+</p>
              <p className="text-dark-400 text-sm">Discord Servers</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <Zap className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">1M+</p>
              <p className="text-dark-400 text-sm">Monthly Impressions</p>
            </div>
          </div>

          {/* Self-Serve Form */}
          <div id="create" className="glass rounded-2xl p-8 mb-16 border border-brand-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Create Your Ad Campaign</h2>
                <p className="text-dark-400 text-sm">Set up your tracking URL and ad content</p>
              </div>
            </div>

            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Submitted Successfully!</h3>
                <p className="text-dark-400 mb-6 max-w-md mx-auto">
                  Your ad campaign has been submitted for review. We&apos;ll email you at{' '}
                  <span className="text-white">{formData.advertiserEmail}</span> once it&apos;s approved.
                </p>
                <div className="bg-dark-800 rounded-xl p-4 inline-block">
                  <p className="text-sm text-dark-400 mb-1">Your tracking URL will be:</p>
                  <code className="text-brand-400 font-mono">quotecord.com/go/{formData.handle}</code>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-error/10 border border-error/50 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
                    <p className="text-sm text-error">{error}</p>
                    <button type="button" onClick={() => setError(null)} className="ml-auto">
                      <X className="w-4 h-4 text-error" />
                    </button>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company / Brand Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Acme Gaming"
                      value={formData.advertiserName}
                      onChange={(e) => setFormData(prev => ({ ...prev, advertiserName: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ads@company.com"
                      value={formData.advertiserEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, advertiserEmail: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                {/* Handle & URL */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <LinkIcon className="w-4 h-4 text-brand-400" />
                      Tracking Handle <span className="text-error">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-3 bg-dark-900 border border-r-0 border-dark-700 rounded-l-xl text-sm text-dark-500">
                        quotecord.com/go/
                      </span>
                      <input
                        type="text"
                        placeholder="yourhandle"
                        value={formData.handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                        className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-r-xl text-sm focus:outline-none focus:border-brand-500"
                        maxLength={30}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 h-5">
                      {handleStatus === 'checking' && (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-dark-400 animate-spin" />
                          <span className="text-xs text-dark-400">Checking availability...</span>
                        </>
                      )}
                      {handleStatus === 'available' && (
                        <>
                          <Check className="w-3.5 h-3.5 text-success" />
                          <span className="text-xs text-success">{handleMessage}</span>
                        </>
                      )}
                      {(handleStatus === 'taken' || handleStatus === 'invalid') && (
                        <>
                          <X className="w-3.5 h-3.5 text-error" />
                          <span className="text-xs text-error">{handleMessage}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Destination URL <span className="text-error">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://yoursite.com/promo"
                      value={formData.destinationUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, destinationUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                      required
                    />
                    <p className="text-xs text-dark-500 mt-1.5">Where users go when they visit your tracking URL</p>
                  </div>
                </div>

                {/* Ad Content */}
                <div className="pt-4 border-t border-dark-800">
                  <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">Ad Content</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Type className="w-4 h-4 text-brand-400" />
                        Full Text <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Sponsored by Acme Gaming • Shop now at acme.gg"
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                        maxLength={150}
                        required
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-xs text-dark-500">Shown on classic/profile templates</p>
                        <p className="text-xs text-dark-500">{formData.text.length}/150</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <AlignLeft className="w-4 h-4 text-brand-400" />
                        Short Text <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Sponsored • acme.gg"
                        value={formData.shortText}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortText: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                        maxLength={80}
                        required
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-xs text-dark-500">Shown on discord/embed templates</p>
                        <p className="text-xs text-dark-500">{formData.shortText.length}/80</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {(formData.text || formData.shortText) && (
                  <div className="pt-4 border-t border-dark-800">
                    <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">Preview</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-dark-900 rounded-xl p-4">
                        <p className="text-xs text-dark-500 mb-2">Full Text Preview</p>
                        <p className="text-sm text-dark-300 font-mono">
                          {formData.text || 'Your full text will appear here...'}
                        </p>
                      </div>
                      <div className="bg-dark-900 rounded-xl p-4">
                        <p className="text-xs text-dark-500 mb-2">Short Text Preview</p>
                        <p className="text-sm text-dark-300 font-mono">
                          {formData.shortText || 'Your short text will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-4 border-t border-dark-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-dark-400">
                      Ads are reviewed within 24 hours. We&apos;ll email you once approved.
                    </p>
                    <button
                      type="submit"
                      disabled={!isFormValid || submitting}
                      className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl shadow-glow transition-all"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Megaphone className="w-5 h-5" />
                          Submit for Review
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center mb-10">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Create Your Ad</h3>
                <p className="text-dark-400 text-sm">
                  Fill out the form above with your brand info, tracking URL handle, and ad text.
                  It only takes a minute.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Get Approved</h3>
                <p className="text-dark-400 text-sm">
                  We review submissions within 24 hours. Once approved, your ad enters rotation
                  and starts getting impressions.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Track Results</h3>
                <p className="text-dark-400 text-sm">
                  Your custom URL (quotecord.com/go/yourhandle) tracks all clicks. We send weekly
                  reports with impressions and CTR.
                </p>
              </div>
            </div>
          </div>

          {/* Why Advertise */}
          <div className="glass rounded-2xl p-8 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-400" />
              </div>
              <h2 className="text-xl font-semibold">Why Advertise with QuoteCord?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Highly Engaged Audience</p>
                    <p className="text-dark-400 text-sm">Discord users actively share and interact with quote images in their communities.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Non-Intrusive Format</p>
                    <p className="text-dark-400 text-sm">Ads blend naturally with content, leading to higher engagement than banner ads.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Viral Potential</p>
                    <p className="text-dark-400 text-sm">Quote images get shared across servers, multiplying your ad reach organically.</p>
                  </div>
                </li>
              </ul>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Transparent Reporting</p>
                    <p className="text-dark-400 text-sm">Weekly reports with impressions, clicks, and performance metrics for your campaigns.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Terms</p>
                    <p className="text-dark-400 text-sm">Monthly or campaign-based pricing to fit your marketing budget and goals.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Gaming & Tech Focused</p>
                    <p className="text-dark-400 text-sm">Our audience skews heavily toward gaming, tech, and entertainment enthusiasts.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="glass rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">Need Custom Pricing or Features?</h2>
            <p className="text-dark-400 mb-8 max-w-lg mx-auto">
              For larger campaigns, custom weights, or enterprise needs, reach out directly and we&apos;ll create a custom plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:ads@quotecord.com"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl shadow-glow transition-all"
              >
                <Mail className="w-5 h-5" />
                ads@quotecord.com
              </a>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 glass hover:bg-dark-800 text-white font-medium py-3 px-8 rounded-xl transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Join Discord
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
