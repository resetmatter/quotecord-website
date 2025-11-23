import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Sparkles,
  Zap,
  Palette,
  Image,
  ArrowRight,
  Check,
  Star,
  MousePointer,
  Sliders,
  Share2,
  Crown,
  Film,
  Eye,
  Users,
  Save,
  Layers,
  ChevronRight
} from 'lucide-react'

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left side - Text content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700 mb-8 animate-fade-in">
                  <Sparkles className="w-4 h-4 text-pro-gold" />
                  <span className="text-sm text-dark-200">
                    Pro now available
                  </span>
                  <ChevronRight className="w-4 h-4 text-dark-400" />
                </div>

                {/* Main headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
                  Turn Discord messages into{' '}
                  <span className="gradient-text">shareable art</span>
                </h1>

                <p className="text-lg sm:text-xl text-dark-300 mb-8 animate-slide-up max-w-xl mx-auto lg:mx-0" style={{ animationDelay: '100ms' }}>
                  Right-click any message. Pick your style. Get a stunning quote image in seconds.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <Link
                    href="/pricing"
                    className="group flex items-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-4 px-8 rounded-xl transition-all shadow-glow-pro text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get Pro
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/add"
                    className="group flex items-center gap-2 bg-dark-800/50 hover:bg-dark-700/50 text-white font-semibold py-4 px-8 rounded-xl border border-dark-600 hover:border-brand-500/50 transition-all text-lg"
                  >
                    Add to Discord - Free
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6 text-dark-400 text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-pro-gold fill-pro-gold" />
                      ))}
                    </div>
                    <span>Loved by thousands</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-dark-700" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>10,000+ servers</span>
                  </div>
                </div>
              </div>

              {/* Right side - Quote card showcase */}
              <div className="relative animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="glass rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-accent-purple flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-white">Discord User</div>
                      <div className="text-dark-400 text-sm">Today at 4:20 PM</div>
                    </div>
                  </div>
                  <p className="text-xl text-white leading-relaxed mb-6">
                    &ldquo;This bot is incredible! Finally a way to share our best server moments.&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-dark-400 text-sm pt-4 border-t border-dark-700">
                    <span className="text-brand-400 font-medium">quotecord</span>
                    <span>Classic Template</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Three clicks to perfect quotes
              </h2>
              <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                No complicated setup. No learning curve. Just beautiful quotes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: MousePointer,
                  title: 'Right-click',
                  description: 'Select any message in Discord and choose "Create Quote" from the context menu'
                },
                {
                  step: '02',
                  icon: Sliders,
                  title: 'Customize',
                  description: 'Pick from templates, fonts, themes, and orientations to match your style'
                },
                {
                  step: '03',
                  icon: Share2,
                  title: 'Share',
                  description: 'Get your quote instantly as PNG or animated GIF with Pro'
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="glass rounded-2xl p-8 card-hover h-full">
                    <div className="text-6xl font-bold text-dark-800 mb-4">{item.step}</div>
                    <div className="w-12 h-12 rounded-xl icon-bg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-brand-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-dark-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 relative bg-dark-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                Powerful features for everyone. Premium upgrades for power users.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Free Features */}
              {[
                {
                  icon: Palette,
                  title: '19 Custom Fonts',
                  description: 'From elegant serifs to modern sans-serifs across 7 categories'
                },
                {
                  icon: Layers,
                  title: '3 Templates',
                  description: 'Classic, Discord Screenshot, and Profile Background styles'
                },
                {
                  icon: Image,
                  title: 'Multiple Formats',
                  description: 'Portrait and landscape orientations with dark & light themes'
                },
                {
                  icon: Zap,
                  title: 'Instant Generation',
                  description: 'High-quality PNG exports in seconds, unlimited usage'
                }
              ].map((feature, index) => (
                <div key={index} className="glass rounded-2xl p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl icon-bg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm">{feature.description}</p>
                </div>
              ))}

              {/* Pro Features */}
              {[
                {
                  icon: Film,
                  title: 'Animated GIFs',
                  description: 'Auto-generate animated quotes when users have animated avatars',
                  pro: true
                },
                {
                  icon: Eye,
                  title: 'Preview Mode',
                  description: 'See exactly how your quote will look before generating',
                  pro: true
                },
                {
                  icon: Users,
                  title: 'Multi-Message',
                  description: 'Combine up to 5 messages into a single beautiful quote',
                  pro: true
                },
                {
                  icon: Save,
                  title: 'Save Presets',
                  description: 'Save up to 10 custom configurations for one-click quoting',
                  pro: true
                }
              ].map((feature, index) => (
                <div key={index} className="relative glass rounded-2xl p-6 card-hover border-gradient-pro overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pro-amber/20 text-pro-gold text-xs font-semibold rounded">
                      <Crown className="w-3 h-3" />
                      PRO
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl icon-bg-pro flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-pro-gold" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                View all features
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-24 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                Start free, upgrade when you need more power
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="glass rounded-2xl p-8">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-dark-400">forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited quote creation',
                    'All 3 templates',
                    'All 19 fonts',
                    'Dark & light themes',
                    'PNG export'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-dark-300">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/add"
                  className="block w-full text-center bg-dark-800/50 hover:bg-dark-700/50 text-white font-semibold py-3 px-6 rounded-xl border border-dark-600 hover:border-brand-500/50 transition-all"
                >
                  Add to Discord
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
                <h3 className="text-xl font-semibold mb-2 mt-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold gradient-text-pro">$1.99</span>
                  <span className="text-dark-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Free',
                    'Animated GIF export',
                    'Preview before generating',
                    'Multi-message quotes (up to 5)',
                    'Save presets (up to 10)',
                    'Server avatar selection',
                    'No watermark'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-dark-300">
                      <Check className="w-5 h-5 text-pro-gold flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-3 px-6 rounded-xl transition-all shadow-glow-pro"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Pro
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-center text-dark-400 text-sm mt-3">
                  or $14.99/year (save 37%)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative glass rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to create beautiful quotes?
                </h2>
                <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of Discord users who trust Quotecord to capture their favorite moments.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/pricing"
                    className="group flex items-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-4 px-8 rounded-xl transition-all shadow-glow-pro text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start with Pro
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/add"
                    className="text-dark-300 hover:text-white font-medium transition-colors"
                  >
                    or try free first
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
