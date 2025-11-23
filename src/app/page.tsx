import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Zap,
  Palette,
  Type,
  Image,
  Sparkles,
  Check,
  Star,
  ArrowRight,
  MousePointerClick,
  Wand2,
  Share2
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-discord-blurple/10 border border-discord-blurple/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-discord-blurple" />
            <span className="text-sm text-discord-blurple">Now with animated GIF support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Discord Messages into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-discord-blurple to-purple-500">
              Beautiful Quotes
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Transform any Discord message into stunning, shareable quote images in seconds.
            Right-click. Customize. Share.
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
              href="/features"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              See Features
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-discord-blurple">3</div>
              <div className="text-gray-400 text-sm">Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-discord-blurple">19</div>
              <div className="text-gray-400 text-sm">Fonts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-discord-blurple">2</div>
              <div className="text-gray-400 text-sm">Themes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-discord-blurple">Unlimited</div>
              <div className="text-gray-400 text-sm">Quotes</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-discord-darker/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-discord-blurple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="w-8 h-8 text-discord-blurple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Right-Click</h3>
              <p className="text-gray-400">
                Right-click any message in Discord and select &quot;Create Quote&quot;
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-discord-blurple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-8 h-8 text-discord-blurple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Customize</h3>
              <p className="text-gray-400">
                Choose your template, font, theme, and orientation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-discord-blurple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-discord-blurple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Share</h3>
              <p className="text-gray-400">
                Get your beautiful quote image instantly and share it anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to create stunning quote images from your Discord messages
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Generation"
              description="Create beautiful quotes in seconds with a simple right-click"
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="3 Templates"
              description="Classic, Discord Screenshot, and Profile Background styles"
            />
            <FeatureCard
              icon={<Type className="w-6 h-6" />}
              title="19 Fonts"
              description="Professional fonts across 7 categories for any style"
            />
            <FeatureCard
              icon={<Image className="w-6 h-6" />}
              title="Dark & Light Themes"
              description="Choose the perfect theme to match your aesthetic"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Animated GIFs"
              description="Auto-generates GIFs for animated avatars (Premium)"
              premium
            />
            <FeatureCard
              icon={<Star className="w-6 h-6" />}
              title="No Watermark"
              description="Clean exports without branding (Premium)"
              premium
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-discord-darker/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-center mb-12">
            Start free, upgrade when you need more power
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-discord-dark border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-400">/forever</span></div>

              <ul className="space-y-3 mb-8">
                <PricingFeature>Unlimited quote creation</PricingFeature>
                <PricingFeature>All 3 templates</PricingFeature>
                <PricingFeature>All 19 fonts</PricingFeature>
                <PricingFeature>Dark & Light themes</PricingFeature>
                <PricingFeature>Portrait & Landscape</PricingFeature>
                <PricingFeature>High-quality PNG export</PricingFeature>
              </ul>

              <Link
                href="/add"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-discord-blurple/20 to-transparent border border-discord-blurple/50 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium-gold text-black text-sm font-semibold px-3 py-1 rounded-full">
                Popular
              </div>

              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <div className="text-3xl font-bold mb-2">
                $1.99<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">or $14.99/year (save 37%)</p>

              <ul className="space-y-3 mb-8">
                <PricingFeature>Everything in Free</PricingFeature>
                <PricingFeature premium>Preview quotes before generating</PricingFeature>
                <PricingFeature premium>Animated GIF export</PricingFeature>
                <PricingFeature premium>Choose server avatar</PricingFeature>
                <PricingFeature premium>Multi-message quotes (up to 5)</PricingFeature>
                <PricingFeature premium>Save presets (up to 10)</PricingFeature>
                <PricingFeature premium>No watermark</PricingFeature>
              </ul>

              <Link
                href="/pricing"
                className="block w-full bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Beautiful Quotes?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of Discord users who are already creating stunning quote images.
          </p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 bg-discord-blurple hover:bg-discord-blurple/80 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            Add DisQuote to Discord
            <ArrowRight className="w-4 h-4" />
          </Link>
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
    <div className="bg-discord-darker border border-gray-800 rounded-xl p-6 hover:border-discord-blurple/50 transition-colors">
      <div className="w-12 h-12 bg-discord-blurple/20 rounded-lg flex items-center justify-center mb-4 text-discord-blurple">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        {title}
        {premium && (
          <span className="text-xs bg-premium-gold/20 text-premium-gold px-2 py-0.5 rounded">
            Premium
          </span>
        )}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function PricingFeature({
  children,
  premium = false
}: {
  children: React.ReactNode
  premium?: boolean
}) {
  return (
    <li className="flex items-center gap-3">
      <Check className={`w-5 h-5 flex-shrink-0 ${premium ? 'text-premium-gold' : 'text-discord-green'}`} />
      <span className={premium ? 'text-white' : 'text-gray-300'}>{children}</span>
    </li>
  )
}
