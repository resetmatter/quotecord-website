'use client'

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
  Shield
} from 'lucide-react'

export default function AdvertisePage() {
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
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
              Get your brand in front of thousands of Discord users daily. Our native ad placements
              appear seamlessly within quote images shared across servers worldwide.
            </p>
            <a
              href="mailto:ads@quotecord.com"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl shadow-glow transition-all group"
            >
              <Mail className="w-5 h-5" />
              Contact Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
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

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-2xl font-semibold text-center mb-10">How Advertising Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Native Placement</h3>
                <p className="text-dark-400 text-sm">
                  Your ad text appears naturally at the bottom of quote images, integrated seamlessly
                  without disrupting the user experience.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tracked Performance</h3>
                <p className="text-dark-400 text-sm">
                  Get a custom tracking URL (quotecord.com/go/yourhandle) with full analytics including
                  impressions, clicks, and CTR.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Weighted Rotation</h3>
                <p className="text-dark-400 text-sm">
                  Your ads rotate with other campaigns based on weight priority. Purchase more weight
                  for increased impression share.
                </p>
              </div>
            </div>
          </div>

          {/* Why Advertise */}
          <div className="glass rounded-2xl p-8 mb-20">
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

          {/* Ad Formats */}
          <div className="mb-20">
            <h2 className="text-2xl font-semibold text-center mb-10">Ad Formats</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Full Text Ad</h3>
                <div className="bg-dark-900 rounded-xl p-4 mb-4">
                  <p className="text-sm text-dark-300 font-mono">
                    &quot;Sponsored by Logitech - Level up your setup at logitech.com&quot;
                  </p>
                </div>
                <p className="text-dark-400 text-sm">
                  Appears on classic and profile quote templates. Up to ~100 characters recommended.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Short Text Ad</h3>
                <div className="bg-dark-900 rounded-xl p-4 mb-4">
                  <p className="text-sm text-dark-300 font-mono">
                    &quot;Sponsored - logitech.com&quot;
                  </p>
                </div>
                <p className="text-dark-400 text-sm">
                  Appears on Discord and embed templates where space is limited. Up to ~50 characters.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="glass rounded-2xl p-10 text-center border border-brand-500/20">
            <h2 className="text-2xl font-semibold mb-4">Ready to Reach Discord Users?</h2>
            <p className="text-dark-400 mb-8 max-w-lg mx-auto">
              Contact us to discuss pricing, campaign goals, and how QuoteCord advertising can help grow your brand.
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
