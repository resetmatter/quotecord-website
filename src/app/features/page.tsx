import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Zap,
  Palette,
  Type,
  Image,
  Sparkles,
  Star,
  ArrowRight,
  Eye,
  MessageSquare,
  Save,
  Layers,
  Crown,
  Film,
  Infinity,
  Users,
  Moon,
  Sun
} from 'lucide-react'

export const metadata = {
  title: 'Features - Quotedis',
  description: 'Explore all the powerful features Quotedis offers to create stunning Discord quote images.',
}

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful features for
              <span className="gradient-text"> beautiful quotes</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Everything you need to create stunning quote images from your Discord messages.
              Start free, unlock more with Pro.
            </p>
          </div>

          {/* Core Features */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl icon-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-400" />
              </div>
              <h2 className="text-2xl font-semibold">Core Features</h2>
              <span className="text-sm text-dark-400 bg-dark-800/50 px-3 py-1 rounded-full">
                Free forever
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Instant Generation"
                description="Create beautiful quotes in seconds. Just right-click any message and select 'Create Quote'. No complex menus required."
              />
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="3 Beautiful Templates"
                description="Choose from Classic, Discord Screenshot, and Profile Background templates. Each designed to make your quotes stand out."
              />
              <FeatureCard
                icon={<Type className="w-6 h-6" />}
                title="19 Professional Fonts"
                description="Access our curated library of 19 fonts across 7 categories. From elegant serifs to modern sans-serifs."
              />
              <FeatureCard
                icon={<Sun className="w-6 h-6" />}
                title="Dark & Light Themes"
                description="Choose the perfect theme to match your aesthetic. Both themes are designed for maximum readability."
              />
              <FeatureCard
                icon={<Layers className="w-6 h-6" />}
                title="Portrait & Landscape"
                description="Generate quotes in either orientation. Perfect for different sharing platforms and use cases."
              />
              <FeatureCard
                icon={<Infinity className="w-6 h-6" />}
                title="Unlimited Quotes"
                description="No daily limits or quotas. Create as many quotes as you want, whenever you want."
              />
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl icon-bg-pro flex items-center justify-center">
                <Crown className="w-5 h-5 text-pro-gold" />
              </div>
              <h2 className="text-2xl font-semibold">Pro Features</h2>
              <span className="text-sm font-medium gradient-text-pro bg-pro-amber/10 px-3 py-1 rounded-full">
                Unlock more power
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Eye className="w-6 h-6" />}
                title="Preview Mode"
                description="See exactly how your quote will look before generating. Adjust settings and see changes in real-time."
                premium
              />
              <FeatureCard
                icon={<Film className="w-6 h-6" />}
                title="Animated GIFs"
                description="Automatically generate animated GIFs when the user has an animated avatar. Bring your quotes to life."
                premium
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Avatar Choice"
                description="Choose between the user's default avatar or their server-specific avatar for each quote."
                premium
              />
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Multi-Message Quotes"
                description="Combine up to 5 messages into a single quote. Perfect for conversations and threads."
                premium
              />
              <FeatureCard
                icon={<Save className="w-6 h-6" />}
                title="Save Presets"
                description="Save up to 10 preset configurations. Quickly apply your favorite settings to any quote."
                premium
              />
              <FeatureCard
                icon={<Star className="w-6 h-6" />}
                title="No Watermark"
                description="Export clean images without any branding or watermarks. Professional quality for any use."
                premium
              />
            </div>
          </div>

          {/* CTA */}
          <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-dark-400 mb-8 max-w-xl mx-auto">
                Add Quotedis to your Discord server and start creating beautiful quotes today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-3 px-8 rounded-xl transition-all shadow-glow-pro"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Pro
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/add"
                  className="flex items-center justify-center gap-2 bg-dark-800/50 hover:bg-dark-700/50 text-white font-semibold py-3 px-8 rounded-xl border border-dark-600 hover:border-brand-500/50 transition-all"
                >
                  Add to Discord - Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  premium = false
}: {
  icon: React.ReactNode
  title: string
  description: string
  premium?: boolean
}) {
  return (
    <div className={`glass rounded-2xl p-6 card-hover ${
      premium ? 'border-gradient-pro' : ''
    }`}>
      {premium && (
        <div className="flex justify-end mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-pro-amber/20 text-pro-gold text-xs font-semibold rounded">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        </div>
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        premium ? 'icon-bg-pro' : 'icon-bg'
      }`}>
        <span className={premium ? 'text-pro-gold' : 'text-brand-400'}>
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
