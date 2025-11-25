'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Check, X, Sparkles, ChevronDown, Crown, Star, ArrowRight, Zap } from 'lucide-react'

type BillingPeriod = 'monthly' | 'annual'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, transparent
              <span className="gradient-text-pro"> pricing</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Start creating beautiful quotes for free. Upgrade to Pro for advanced features and no watermarks.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center glass rounded-xl p-1.5">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'annual'
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Annual
                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded font-semibold">
                  -37%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Free Tier */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl icon-bg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Free</h2>
                  <p className="text-dark-400 text-sm">Perfect for casual users</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-dark-400">/forever</span>
              </div>

              <ul className="space-y-4 mb-8">
                <PricingItem included>Unlimited quote creation</PricingItem>
                <PricingItem included>All 3 templates</PricingItem>
                <PricingItem included>All 19 fonts</PricingItem>
                <PricingItem included>Dark & Light themes</PricingItem>
                <PricingItem included>Portrait & Landscape</PricingItem>
                <PricingItem included>High-quality PNG export</PricingItem>
                <PricingItem included>Default avatar</PricingItem>
                <PricingItem>Preview mode</PricingItem>
                <PricingItem>Animated GIF export</PricingItem>
                <PricingItem>Server avatar choice</PricingItem>
                <PricingItem>Multi-message quotes</PricingItem>
                <PricingItem>Saved presets</PricingItem>
                <PricingItem>No watermark</PricingItem>
              </ul>

              <Link
                href="/add"
                className="block w-full text-center bg-dark-800/50 hover:bg-dark-700/50 text-white font-semibold py-3 px-6 rounded-xl border border-dark-600 hover:border-brand-500/50 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative glass rounded-2xl p-8 border-gradient-pro">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-pro-amber to-pro-gold text-dark-900 text-sm font-bold rounded-full shadow-glow-pro">
                  <Star className="w-4 h-4" />
                  MOST POPULAR
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 rounded-xl icon-bg-pro flex items-center justify-center">
                  <Crown className="w-5 h-5 text-pro-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Pro</h2>
                  <p className="text-dark-400 text-sm">For power users & creators</p>
                </div>
              </div>

              <div className="mb-2">
                {billingPeriod === 'monthly' ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold gradient-text-pro">$1.99</span>
                    <span className="text-dark-400">/month</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold gradient-text-pro">$14.99</span>
                    <span className="text-dark-400">/year</span>
                  </div>
                )}
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-sm text-success mb-6">
                  That&apos;s only $1.25/month - save $9/year!
                </p>
              )}
              {billingPeriod === 'monthly' && (
                <p className="text-sm text-dark-400 mb-6">
                  or $14.99/year (save 37%)
                </p>
              )}

              <ul className="space-y-4 mb-8">
                <PricingItem included>Unlimited quote creation</PricingItem>
                <PricingItem included>All 3 templates</PricingItem>
                <PricingItem included>All 19 fonts</PricingItem>
                <PricingItem included>Dark & Light themes</PricingItem>
                <PricingItem included>Portrait & Landscape</PricingItem>
                <PricingItem included>High-quality PNG export</PricingItem>
                <PricingItem included premium>Preview mode</PricingItem>
                <PricingItem included premium>Animated GIF export</PricingItem>
                <PricingItem included premium>Server avatar choice</PricingItem>
                <PricingItem included premium>Multi-message quotes (up to 5)</PricingItem>
                <PricingItem included premium>Saved presets (up to 10)</PricingItem>
                <PricingItem included premium>No watermark</PricingItem>
              </ul>

              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-3 px-6 rounded-xl transition-all shadow-glow-pro"
              >
                <Sparkles className="w-5 h-5" />
                Get Pro
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="glass rounded-2xl overflow-hidden mb-20">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold">Feature Comparison</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-4 px-6 font-medium text-dark-300">Feature</th>
                    <th className="text-center py-4 px-6 font-medium text-dark-300">Free</th>
                    <th className="text-center py-4 px-6 font-medium gradient-text-pro">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <ComparisonRow feature="Quote Creation" free="Unlimited" premium="Unlimited" />
                  <ComparisonRow feature="Templates" free="All 3" premium="All 3" />
                  <ComparisonRow feature="Fonts" free="All 19" premium="All 19" />
                  <ComparisonRow feature="Themes" free="Dark & Light" premium="Dark & Light" />
                  <ComparisonRow feature="Orientations" free="Both" premium="Both" />
                  <ComparisonRow feature="Export Format" free="PNG" premium="PNG + GIF" />
                  <ComparisonRow feature="Avatar" free="Default only" premium="Default + Server" />
                  <ComparisonRow feature="Messages per Quote" free="1" premium="Up to 5" />
                  <ComparisonRow feature="Preview Mode" free={false} premium={true} />
                  <ComparisonRow feature="Saved Presets" free="0" premium="Up to 10" />
                  <ComparisonRow feature="Watermark" free="Yes" premium="No" />
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {[
                {
                  question: "Can I cancel anytime?",
                  answer: "Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express. Your payment info is secure and never stored on our servers."
                },
                {
                  question: "Is there a free trial?",
                  answer: "While we don't offer a traditional free trial, you can use all core features for free forever. Pro just unlocks additional power features."
                },
                {
                  question: "Do I need to sign up to use the bot?",
                  answer: "No! You can use the free tier without signing up. Only sign up when you're ready to upgrade to Pro."
                },
                {
                  question: "Can I switch between monthly and annual?",
                  answer: "Yes! You can switch between billing periods at any time. When switching to annual, you'll be prorated for any remaining time on your monthly plan."
                },
                {
                  question: "What happens to my presets if I cancel?",
                  answer: "Your presets are saved but won't be accessible until you resubscribe. We keep them for 90 days in case you decide to come back."
                }
              ].map((faq, index) => (
                <div key={index} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-800/30 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-dark-400 text-sm animate-slide-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function PricingItem({
  children,
  included = false,
  premium = false
}: {
  children: React.ReactNode
  included?: boolean
  premium?: boolean
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <Check className={`w-5 h-5 flex-shrink-0 ${premium ? 'text-pro-gold' : 'text-success'}`} />
      ) : (
        <X className="w-5 h-5 flex-shrink-0 text-dark-600" />
      )}
      <span className={included ? (premium ? 'text-white font-medium' : 'text-dark-300') : 'text-dark-500'}>
        {children}
      </span>
    </li>
  )
}

function ComparisonRow({
  feature,
  free,
  premium
}: {
  feature: string
  free: string | boolean
  premium: string | boolean
}) {
  return (
    <tr>
      <td className="py-4 px-6 text-dark-300">{feature}</td>
      <td className="text-center py-4 px-6">
        {typeof free === 'boolean' ? (
          free ? (
            <Check className="w-5 h-5 text-success mx-auto" />
          ) : (
            <X className="w-5 h-5 text-dark-600 mx-auto" />
          )
        ) : (
          <span className="text-dark-400">{free}</span>
        )}
      </td>
      <td className="text-center py-4 px-6">
        {typeof premium === 'boolean' ? (
          premium ? (
            <Check className="w-5 h-5 text-pro-gold mx-auto" />
          ) : (
            <X className="w-5 h-5 text-dark-600 mx-auto" />
          )
        ) : (
          <span className="text-white font-medium">{premium}</span>
        )}
      </td>
    </tr>
  )
}
