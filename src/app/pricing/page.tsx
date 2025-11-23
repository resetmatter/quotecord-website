'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Check, X, Sparkles, HelpCircle } from 'lucide-react'

type BillingPeriod = 'monthly' | 'annual'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual')

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Start creating beautiful quotes for free. Upgrade to Premium for advanced features and no watermarks.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center bg-discord-darker rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-discord-blurple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-discord-blurple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-discord-green/20 text-discord-green px-2 py-0.5 rounded">
                  Save 37%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Tier */}
            <div className="bg-discord-darker border border-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-2">Free</h2>
              <p className="text-gray-400 mb-6">Perfect for casual users</p>
              <div className="text-4xl font-bold mb-8">
                $0<span className="text-lg text-gray-400">/forever</span>
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
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-discord-blurple/20 to-discord-darker border border-discord-blurple/50 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium-gold text-black text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Popular
              </div>

              <h2 className="text-2xl font-semibold mb-2">Premium</h2>
              <p className="text-gray-400 mb-6">For power users & content creators</p>
              <div className="text-4xl font-bold mb-2">
                {billingPeriod === 'monthly' ? (
                  <>$1.99<span className="text-lg text-gray-400">/month</span></>
                ) : (
                  <>$14.99<span className="text-lg text-gray-400">/year</span></>
                )}
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-sm text-discord-green mb-6">
                  That&apos;s only $1.25/month!
                </p>
              )}
              {billingPeriod === 'monthly' && (
                <p className="text-sm text-gray-400 mb-6">&nbsp;</p>
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
                className="block w-full bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-discord-darker rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold">Feature Comparison</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 font-medium">Feature</th>
                    <th className="text-center py-4 px-6 font-medium">Free</th>
                    <th className="text-center py-4 px-6 font-medium text-premium-gold">Premium</th>
                  </tr>
                </thead>
                <tbody>
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
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <FAQItem
                question="Can I cancel anytime?"
                answer="Yes! You can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express."
              />
              <FAQItem
                question="Is there a free trial?"
                answer="While we don't offer a traditional free trial, you can use all core features for free forever. Premium just unlocks additional power features."
              />
              <FAQItem
                question="Do I need to sign up to use the bot?"
                answer="No! You can use the free tier without signing up. Only sign up when you're ready to upgrade to Premium."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
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
        <Check className={`w-5 h-5 flex-shrink-0 ${premium ? 'text-premium-gold' : 'text-discord-green'}`} />
      ) : (
        <X className="w-5 h-5 flex-shrink-0 text-gray-600" />
      )}
      <span className={included ? (premium ? 'text-white' : 'text-gray-300') : 'text-gray-500'}>
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
    <tr className="border-b border-gray-800 last:border-0">
      <td className="py-4 px-6 text-gray-300">{feature}</td>
      <td className="text-center py-4 px-6">
        {typeof free === 'boolean' ? (
          free ? (
            <Check className="w-5 h-5 text-discord-green mx-auto" />
          ) : (
            <X className="w-5 h-5 text-gray-600 mx-auto" />
          )
        ) : (
          <span className="text-gray-400">{free}</span>
        )}
      </td>
      <td className="text-center py-4 px-6">
        {typeof premium === 'boolean' ? (
          premium ? (
            <Check className="w-5 h-5 text-premium-gold mx-auto" />
          ) : (
            <X className="w-5 h-5 text-gray-600 mx-auto" />
          )
        ) : (
          <span className="text-white">{premium}</span>
        )}
      </td>
    </tr>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-discord-dark border border-gray-800 rounded-lg p-6">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-discord-blurple" />
        {question}
      </h3>
      <p className="text-gray-400 text-sm">{answer}</p>
    </div>
  )
}
