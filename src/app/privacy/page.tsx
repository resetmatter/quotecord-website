import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-invert prose-dark max-w-none">
            <p className="text-dark-300 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-dark-300 mb-4">
                Quotecord ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Discord
                bot and website (collectively, the "Service").
              </p>
              <p className="text-dark-300 mb-4">
                By using the Service, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">2.1 Information from Discord</h3>
              <p className="text-dark-300 mb-4">When you authenticate with Discord or use our bot, we may collect:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Discord user ID and username</li>
                <li>Discord avatar URL</li>
                <li>Email address (for account identification)</li>
                <li>Server (guild) IDs where the bot is used</li>
                <li>Message content when you invoke the quote command</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.2 Payment Information</h3>
              <p className="text-dark-300 mb-4">
                For Pro subscriptions, payment processing is handled by Stripe. We do not store your full
                credit card number. We receive and store:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Stripe customer ID</li>
                <li>Subscription status and billing period</li>
                <li>Last four digits of payment method (for display purposes)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.3 Automatically Collected Information</h3>
              <p className="text-dark-300 mb-4">
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-dark-300 mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Provide, operate, and maintain the Service</li>
                <li>Process your transactions and manage subscriptions</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Generate quote images from Discord messages</li>
                <li>Improve, personalize, and expand our Service</li>
                <li>Communicate with you about updates, support, and promotional offers</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p className="text-dark-300 mb-4">
                Your data is stored securely using Supabase, which provides enterprise-grade security
                including encryption at rest and in transit. We implement appropriate technical and
                organizational measures to protect your personal information.
              </p>
              <p className="text-dark-300 mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure.
                While we strive to use commercially acceptable means to protect your information, we cannot
                guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-dark-300 mb-4">We use the following third-party services:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">Discord</h3>
              <p className="text-dark-300 mb-4">
                For authentication and bot functionality. Subject to{' '}
                <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Discord's Privacy Policy
                </a>.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">Stripe</h3>
              <p className="text-dark-300 mb-4">
                For payment processing. Subject to{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Stripe's Privacy Policy
                </a>.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">Supabase</h3>
              <p className="text-dark-300 mb-4">
                For database and authentication services. Subject to{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Supabase's Privacy Policy
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-dark-300 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes
                outlined in this Privacy Policy:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Account data: Retained while your account is active</li>
                <li>Message content: Processed temporarily and not stored after quote generation</li>
                <li>Payment records: Retained as required by law and for accounting purposes</li>
                <li>Usage logs: Retained for up to 90 days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-dark-300 mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-dark-300 mb-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:support@quotecord.app" className="text-brand-400 hover:text-brand-300 transition-colors">
                  support@quotecord.app
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-dark-300 mb-4">
                The Service is not intended for users under 13 years of age (or the minimum age required
                by Discord's Terms of Service in your jurisdiction). We do not knowingly collect personal
                information from children under 13. If we learn we have collected such information, we will
                delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-dark-300 mb-4">
                Your information may be transferred to and processed in countries other than your country
                of residence. These countries may have different data protection laws. By using the Service,
                you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-dark-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of significant
                changes by posting the new policy on this page and updating the "Last updated" date. We
                encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-dark-300 mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-dark-300 mb-4">
                Email:{' '}
                <a href="mailto:support@quotecord.app" className="text-brand-400 hover:text-brand-300 transition-colors">
                  support@quotecord.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
