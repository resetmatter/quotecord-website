import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HelpCircle, MessageCircle, Mail, Book, ExternalLink } from 'lucide-react'

export default function SupportPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
            <p className="text-gray-400">
              Get help with DisQuote or contact us for any questions
            </p>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <a
              href="https://discord.gg/your-support-server"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-discord-darker border border-gray-800 rounded-xl p-6 hover:border-discord-blurple/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-discord-blurple/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-discord-blurple/30 transition-colors">
                <MessageCircle className="w-6 h-6 text-discord-blurple" />
              </div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Discord Support Server
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </h2>
              <p className="text-gray-400 text-sm">
                Join our community for quick help, feature requests, and updates
              </p>
            </a>

            <a
              href="mailto:support@disquote.app"
              className="bg-discord-darker border border-gray-800 rounded-xl p-6 hover:border-discord-blurple/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-discord-blurple/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-discord-blurple/30 transition-colors">
                <Mail className="w-6 h-6 text-discord-blurple" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Email Support</h2>
              <p className="text-gray-400 text-sm">
                For billing issues or private inquiries, email us at support@disquote.app
              </p>
            </a>
          </div>

          {/* FAQ */}
          <div className="bg-discord-darker border border-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Book className="w-5 h-5 text-discord-blurple" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
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
                answer="Animated GIFs are a Premium feature. When you create a quote from a user with an animated avatar, the bot will automatically generate a GIF instead of a PNG. Upgrade to Premium to unlock this feature."
              />
              <FAQItem
                question="Can I use DisQuote in DMs?"
                answer="Yes! DisQuote supports both guild install and user install modes. You can add it to your user account to use in DMs and group chats."
              />
              <FAQItem
                question="How do I cancel my subscription?"
                answer="Go to your Dashboard > Billing and click 'Manage Subscription'. This will take you to the Stripe billing portal where you can cancel, change plans, or update payment methods."
              />
              <FAQItem
                question="What happens when my subscription ends?"
                answer="You'll be downgraded to the free tier. You'll keep access to all core features but lose premium features like animated GIFs, preview mode, and watermark removal."
              />
              <FAQItem
                question="Is there a refund policy?"
                answer="We offer refunds within 7 days of purchase if you're not satisfied. Contact us at support@disquote.app with your Discord username and we'll process your refund."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-800 last:border-0 pb-6 last:pb-0">
      <h3 className="font-medium mb-2 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-discord-blurple mt-1 flex-shrink-0" />
        {question}
      </h3>
      <p className="text-gray-400 text-sm pl-6">{answer}</p>
    </div>
  )
}
