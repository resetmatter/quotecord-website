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
  Layers
} from 'lucide-react'

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Powerful Features</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to create stunning quote images from your Discord messages
            </p>
          </div>

          {/* Core Features */}
          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 text-center">Core Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Instant Generation"
                description="Create beautiful quotes in seconds. Just right-click any message and select 'Create Quote'. No complex menus or settings required."
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
                icon={<Image className="w-6 h-6" />}
                title="Dark & Light Themes"
                description="Choose the perfect theme to match your aesthetic. Both themes are designed for maximum readability and visual appeal."
              />
              <FeatureCard
                icon={<Layers className="w-6 h-6" />}
                title="Portrait & Landscape"
                description="Generate quotes in either orientation. Perfect for different sharing platforms and use cases."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Unlimited Quotes"
                description="No daily limits or quotas. Create as many quotes as you want, whenever you want."
              />
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 bg-premium-gold/20 text-premium-gold px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                Premium Features
              </span>
              <h2 className="text-2xl font-semibold mt-4">Unlock More Power</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Eye className="w-6 h-6" />}
                title="Preview Mode"
                description="See exactly how your quote will look before generating. Adjust settings and see changes in real-time."
                premium
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Animated GIFs"
                description="Automatically generate animated GIFs when the user has an animated avatar. Bring your quotes to life."
                premium
              />
              <FeatureCard
                icon={<Image className="w-6 h-6" />}
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
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Add DisQuote to your Discord server and start creating beautiful quotes today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/add"
                className="bg-discord-blurple hover:bg-discord-blurple/80 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Add to Discord
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
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
    <div className={`rounded-xl p-6 border transition-colors ${
      premium
        ? 'bg-gradient-to-b from-premium-gold/10 to-discord-darker border-premium-gold/30 hover:border-premium-gold/50'
        : 'bg-discord-darker border-gray-800 hover:border-discord-blurple/50'
    }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        premium ? 'bg-premium-gold/20 text-premium-gold' : 'bg-discord-blurple/20 text-discord-blurple'
      }`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}
