'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  CreditCard,
  Bug,
  Lightbulb,
  User,
  HelpCircle,
  Book,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const CATEGORIES = [
  {
    id: 'billing',
    name: 'Billing',
    description: 'Payment issues, refunds, or subscription questions',
    icon: CreditCard,
  },
  {
    id: 'bug',
    name: 'Bug Report',
    description: 'Something not working as expected',
    icon: Bug,
  },
  {
    id: 'feature',
    name: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    icon: Lightbulb,
  },
  {
    id: 'account',
    name: 'Account Issue',
    description: 'Login problems or account-related questions',
    icon: User,
  },
  {
    id: 'other',
    name: 'Other',
    description: 'General inquiries and other questions',
    icon: HelpCircle,
  },
]

export default function SupportPage() {
  const [step, setStep] = useState<'category' | 'form' | 'success'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    discordUsername: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('category')
    setError(null)
  }

  const handleNewRequest = () => {
    setStep('category')
    setSelectedCategory(null)
    setFormData({ email: '', discordUsername: '', subject: '', message: '' })
    setError(null)
  }

  const selectedCategoryData = CATEGORIES.find((c) => c.id === selectedCategory)

  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Help &
              <span className="gradient-text"> Support</span>
            </h1>
            <p className="text-dark-400 text-lg">
              {step === 'category' && 'Select a category to get started'}
              {step === 'form' && 'Fill out the form below and we\'ll get back to you'}
              {step === 'success' && 'Your request has been submitted'}
            </p>
          </div>

          {/* Category Selection */}
          {step === 'category' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="glass rounded-2xl p-6 card-hover group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl icon-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-brand-400" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {category.name}
                      <ChevronRight className="w-4 h-4 text-dark-500 group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-dark-400 text-sm">{category.description}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Contact Form */}
          {step === 'form' && selectedCategoryData && (
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-8 mb-16">
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                    <selectedCategoryData.icon className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-medium text-brand-400">
                      {selectedCategoryData.name}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-dark-300 mb-2"
                      >
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="discord"
                        className="block text-sm font-medium text-dark-300 mb-2"
                      >
                        Discord Username{' '}
                        <span className="text-dark-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="discord"
                        value={formData.discordUsername}
                        onChange={(e) =>
                          setFormData({ ...formData, discordUsername: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-dark-300 mb-2"
                    >
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-dark-300 mb-2"
                    >
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="max-w-md mx-auto text-center mb-16">
              <div className="glass rounded-2xl p-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Request Submitted!</h2>
                <p className="text-dark-400 mb-6">
                  We&apos;ve received your message and will get back to you as soon as
                  possible. Please check your email for updates.
                </p>
                <button
                  onClick={handleNewRequest}
                  className="px-6 py-3 rounded-xl font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="glass rounded-2xl p-8" id="faq">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Book className="w-5 h-5 text-brand-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <FAQItem
                question="How do I create a quote?"
                answer="Right-click on any message in Discord, hover over 'Apps', and select 'Create Quote'. You can then customize the template, font, theme, and orientation before generating your quote."
              />
              <FAQItem
                question="Why isn't the bot responding?"
                answer="Make sure the bot has the necessary permissions in your server. It needs 'Use Application Commands' and 'Attach Files' permissions. If issues persist, try kicking and re-adding the bot."
              />
              <FAQItem
                question="How do I get animated GIF quotes?"
                answer="Animated GIFs are a Pro feature. When you create a quote from a user with an animated avatar, the bot will automatically generate a GIF instead of a PNG. Upgrade to Pro to unlock this feature."
              />
              <FAQItem
                question="Can I use quotecord in DMs?"
                answer="Yes! quotecord supports both guild install and user install modes. You can add it to your user account to use in DMs and group chats."
              />
              <FAQItem
                question="How do I cancel my subscription?"
                answer="Go to your Dashboard > Billing and click 'Manage Subscription'. This will take you to the Stripe billing portal where you can cancel, change plans, or update payment methods."
              />
              <FAQItem
                question="What happens when my subscription ends?"
                answer="You'll be downgraded to the free tier. You'll keep access to all core features but lose Pro features like animated GIFs, preview mode, and ad removal."
              />
              <FAQItem
                question="Is there a refund policy?"
                answer="We offer refunds within 7 days of purchase if you're not satisfied. Submit a billing request through the form above with your Discord username and we'll process your refund."
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-dark-700 last:border-0 pb-4 last:pb-0">
      <h3 className="font-medium mb-2 flex items-start gap-2">
        <ChevronRight className="w-4 h-4 text-brand-400 mt-1 flex-shrink-0" />
        {question}
      </h3>
      <p className="text-dark-400 text-sm pl-6">{answer}</p>
    </div>
  )
}
