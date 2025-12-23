import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-invert prose-dark max-w-none">
            <p className="text-dark-300 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-dark-300 mb-4">
                By accessing or using quotecord ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-dark-300 mb-4">
                quotecord is a Discord bot that allows users to create quote images from Discord messages.
                The Service includes both free and premium (Pro) features accessible through Discord and our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
              <p className="text-dark-300 mb-4">
                To access certain features of the Service, you must authenticate using your Discord account.
                By doing so, you authorize us to access certain Discord account information in accordance with
                Discord's terms of service and our Privacy Policy.
              </p>
              <p className="text-dark-300 mb-4">
                You are responsible for maintaining the security of your Discord account and any activities
                that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-dark-300 mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>Create content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                <li>Violate Discord's Terms of Service or Community Guidelines</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                <li>Use the Service for any commercial purpose without our express written consent</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Create quote images that infringe on intellectual property rights of others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Premium Subscription (Pro)</h2>
              <p className="text-dark-300 mb-4">
                quotecord Pro is a paid subscription service that provides additional features. By subscribing to Pro:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mb-4">
                <li>You agree to pay the applicable subscription fees</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Refunds are handled on a case-by-case basis; contact support for assistance</li>
                <li>We reserve the right to modify pricing with 30 days notice</li>
                <li>Payment processing is handled by Stripe, subject to their terms of service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-dark-300 mb-4">
                The Service and its original content, features, and functionality are owned by quotecord and
                are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-dark-300 mb-4">
                Quote images created using the Service remain the intellectual property of their respective
                creators, subject to the original content rights of the quoted messages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
              <p className="text-dark-300 mb-4">
                You retain ownership of any content you create using the Service. However, by using the Service,
                you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display
                your content solely for the purpose of operating and improving the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-dark-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
                ERROR-FREE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-dark-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUOTECORD SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
                WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p className="text-dark-300 mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice or
                liability, for any reason, including breach of these Terms. Upon termination, your right to
                use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-dark-300 mb-4">
                We reserve the right to modify these terms at any time. We will provide notice of significant
                changes by posting the new Terms on this page and updating the "Last updated" date. Your
                continued use of the Service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-dark-300 mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws, without
                regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
              <p className="text-dark-300 mb-4">
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:support@quotecord.com" className="text-brand-400 hover:text-brand-300 transition-colors">
                  support@quotecord.com
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
