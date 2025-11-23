import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Quote Templates</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose from 3 professionally designed templates to make your quotes stand out
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <TemplateCard
              name="Classic"
              description="Clean and elegant design with the quote prominently displayed. Perfect for inspirational or memorable quotes."
              features={['Centered text', 'Author with avatar', 'Minimal design']}
            />
            <TemplateCard
              name="Discord Screenshot"
              description="Mimics the look of an actual Discord message. Great for sharing conversations that look authentic."
              features={['Discord-style layout', 'Timestamp included', 'Familiar look']}
            />
            <TemplateCard
              name="Profile Background"
              description="Features a larger avatar with the quote as a background element. Ideal for highlighting the speaker."
              features={['Large avatar', 'Quote overlay', 'Bold presence']}
            />
          </div>

          {/* Customization Info */}
          <div className="bg-discord-darker border border-gray-800 rounded-xl p-8 mb-12">
            <h2 className="text-xl font-semibold mb-4">Customization Options</h2>
            <p className="text-gray-400 mb-6">
              Every template can be customized with these options:
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="font-medium mb-1">19 Fonts</div>
                <div className="text-sm text-gray-400">7 categories to choose from</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="font-medium mb-1">2 Themes</div>
                <div className="text-sm text-gray-400">Dark and Light modes</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="font-medium mb-1">2 Orientations</div>
                <div className="text-sm text-gray-400">Portrait and Landscape</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="font-medium mb-1">Avatar Choice</div>
                <div className="text-sm text-gray-400">Default or server (Premium)</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Try All Templates Free</h2>
            <p className="text-gray-400 mb-8">
              All templates are available in the free tier. Add DisQuote to your server now.
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 bg-discord-blurple hover:bg-discord-blurple/80 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Add to Discord
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function TemplateCard({
  name,
  description,
  features
}: {
  name: string
  description: string
  features: string[]
}) {
  return (
    <div className="bg-discord-darker border border-gray-800 rounded-xl overflow-hidden hover:border-discord-blurple/50 transition-colors">
      {/* Preview placeholder */}
      <div className="aspect-square bg-gray-800 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl font-bold text-gray-600 mb-2">{name[0]}</div>
          <div className="text-sm text-gray-500">Template Preview</div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <ul className="space-y-1">
          {features.map((feature, i) => (
            <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-1 h-1 bg-discord-blurple rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
