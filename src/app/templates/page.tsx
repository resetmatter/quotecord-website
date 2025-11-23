import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowRight, Sparkles, Type, Moon, Sun, Maximize2, Crown } from 'lucide-react'

export const metadata = {
  title: 'Templates - Quotecord',
  description: 'Explore the 3 professionally designed templates available in Quotecord.',
}

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Beautiful
              <span className="gradient-text"> templates</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Choose from 3 professionally designed templates to make your quotes stand out.
              All templates are free to use.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <TemplateCard
              name="Classic"
              description="Clean and elegant design with the quote prominently displayed. Perfect for inspirational or memorable quotes."
              features={['Centered text layout', 'Author with avatar', 'Minimal, clean design']}
              gradient="from-brand-500/20 to-accent-purple/20"
            />
            <TemplateCard
              name="Discord Screenshot"
              description="Mimics the look of an actual Discord message. Great for sharing conversations that look authentic."
              features={['Discord-style layout', 'Timestamp included', 'Familiar appearance']}
              gradient="from-accent-cyan/20 to-brand-500/20"
            />
            <TemplateCard
              name="Profile Background"
              description="Features a larger avatar with the quote as a background element. Ideal for highlighting the speaker."
              features={['Large avatar display', 'Quote overlay effect', 'Bold visual presence']}
              gradient="from-accent-pink/20 to-accent-purple/20"
            />
          </div>

          {/* Customization Options */}
          <div className="glass rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-semibold mb-6">Customize every template</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <div className="w-10 h-10 rounded-lg icon-bg flex items-center justify-center mb-3">
                  <Type className="w-5 h-5 text-brand-400" />
                </div>
                <div className="font-semibold mb-1">19 Fonts</div>
                <div className="text-sm text-dark-400">7 categories to match any style</div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <div className="w-10 h-10 rounded-lg icon-bg flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="font-semibold mb-1">2 Themes</div>
                <div className="text-sm text-dark-400">Dark and light modes</div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <div className="w-10 h-10 rounded-lg icon-bg flex items-center justify-center mb-3">
                  <Maximize2 className="w-5 h-5 text-brand-400" />
                </div>
                <div className="font-semibold mb-1">2 Orientations</div>
                <div className="text-sm text-dark-400">Portrait and landscape</div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700 border-gradient-pro">
                <div className="w-10 h-10 rounded-lg icon-bg-pro flex items-center justify-center mb-3">
                  <Crown className="w-5 h-5 text-pro-gold" />
                </div>
                <div className="font-semibold mb-1 flex items-center gap-2">
                  Avatar Choice
                  <span className="text-xs bg-pro-amber/20 text-pro-gold px-1.5 py-0.5 rounded">Pro</span>
                </div>
                <div className="text-sm text-dark-400">Default or server avatar</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Try all templates free</h2>
              <p className="text-dark-400 mb-8 max-w-xl mx-auto">
                All templates are available in the free tier. Add Quotecord to your server and start creating.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/add"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-glow hover:shadow-glow-lg"
                >
                  Add to Discord
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-bold py-3 px-8 rounded-xl transition-all shadow-glow-pro"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Pro
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

function TemplateCard({
  name,
  description,
  features,
  gradient
}: {
  name: string
  description: string
  features: string[]
  gradient: string
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden card-hover">
      {/* Preview placeholder */}
      <div className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <div className="text-center p-6">
          <div className="text-6xl font-bold text-white/20 mb-2">{name[0]}</div>
          <div className="text-sm text-dark-400 bg-dark-900/50 px-3 py-1 rounded-full inline-block">
            Preview
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-dark-400 text-sm mb-4">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="text-sm text-dark-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
