'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  User,
  Server,
  ArrowRight,
  Globe,
  Users,
  MessageSquare,
  Image,
  Lock,
  HelpCircle,
  Zap,
  Trash2
} from 'lucide-react'

const CLIENT_ID = '1439621877285785711'
const SERVER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=2147485696&integration_type=0&scope=bot+applications.commands`
const USER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&integration_type=1&scope=applications.commands`

export default function InstallModesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
              Installation Guide
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              User Install vs
              <span className="gradient-text"> Server Install</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              quotecord supports two installation modes. Choose the one that fits your needs,
              or use both for the complete experience.
            </p>
          </div>

          {/* Install Mode Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* User Install */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl icon-bg flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">User Install</h2>
                  <p className="text-dark-400 text-sm">Personal use across Discord</p>
                </div>
              </div>

              <p className="text-dark-300 mb-6">
                Install quotecord to your personal Discord account. Use it anywhere—including
                servers where the bot isn&apos;t installed, group DMs, and direct messages.
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                  Best For
                </h3>
                <ul className="space-y-2">
                  <BestForItem icon={<Globe className="w-4 h-4" />}>
                    Using quotes anywhere on Discord
                  </BestForItem>
                  <BestForItem icon={<MessageSquare className="w-4 h-4" />}>
                    DMs and group chats
                  </BestForItem>
                  <BestForItem icon={<User className="w-4 h-4" />}>
                    Personal/individual use
                  </BestForItem>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                  Features
                </h3>
                <ul className="space-y-3">
                  <FeatureItem status="full">Basic Quote Creation</FeatureItem>
                  <FeatureItem status="full">All 4 Templates</FeatureItem>
                  <FeatureItem status="full">All 19 Fonts</FeatureItem>
                  <FeatureItem status="full">Dark/Light Themes</FeatureItem>
                  <FeatureItem status="full">All Privacy Modes</FeatureItem>
                  <FeatureItem status="full">Font Gallery (/fonts)</FeatureItem>
                  <FeatureItem status="full">Default Avatar</FeatureItem>
                  <FeatureItem status="partial">Multi-Message Quotes</FeatureItem>
                  <FeatureItem status="none">Server Avatar Selection</FeatureItem>
                  <FeatureItem status="none">Server Nicknames</FeatureItem>
                  <FeatureItem status="none">Delete Quote Button</FeatureItem>
                </ul>
              </div>

              <a
                href={USER_INSTALL_URL}
                className="group flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-glow"
              >
                <User className="w-5 h-5" />
                Install as User App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Server Install */}
            <div className="relative glass rounded-2xl p-8 border border-success/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-success text-white text-sm font-bold rounded-full">
                  <Zap className="w-4 h-4" />
                  FULL FEATURES
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Server className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Server Install</h2>
                  <p className="text-dark-400 text-sm">For communities & teams</p>
                </div>
              </div>

              <p className="text-dark-300 mb-6">
                Add quotecord to your server. All members can use it with full features,
                including server avatars, nicknames, and reliable multi-message quotes.
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                  Best For
                </h3>
                <ul className="space-y-2">
                  <BestForItem icon={<Users className="w-4 h-4" />}>
                    Server communities
                  </BestForItem>
                  <BestForItem icon={<Image className="w-4 h-4" />}>
                    Server avatars & nicknames
                  </BestForItem>
                  <BestForItem icon={<MessageSquare className="w-4 h-4" />}>
                    Multi-message quotes
                  </BestForItem>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">
                  Features
                </h3>
                <ul className="space-y-3">
                  <FeatureItem status="full">Basic Quote Creation</FeatureItem>
                  <FeatureItem status="full">All 4 Templates</FeatureItem>
                  <FeatureItem status="full">All 19 Fonts</FeatureItem>
                  <FeatureItem status="full">Dark/Light Themes</FeatureItem>
                  <FeatureItem status="full">All Privacy Modes</FeatureItem>
                  <FeatureItem status="full">Font Gallery (/fonts)</FeatureItem>
                  <FeatureItem status="full">Default Avatar</FeatureItem>
                  <FeatureItem status="full">Multi-Message Quotes</FeatureItem>
                  <FeatureItem status="full">Server Avatar Selection</FeatureItem>
                  <FeatureItem status="full">Server Nicknames</FeatureItem>
                  <FeatureItem status="full">Delete Quote Button</FeatureItem>
                </ul>
              </div>

              <a
                href={SERVER_INSTALL_URL}
                className="group flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Server className="w-5 h-5" />
                Add to Server
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="glass rounded-2xl overflow-hidden mb-20">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold">Feature Comparison</h2>
              <p className="text-dark-400 text-sm mt-1">
                See exactly what&apos;s available in each installation mode
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-4 px-6 font-medium text-dark-300">Feature</th>
                    <th className="text-center py-4 px-6 font-medium text-brand-400">
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        User Install
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-success">
                      <div className="flex items-center justify-center gap-2">
                        <Server className="w-4 h-4" />
                        Server Install
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <ComparisonRow feature="Basic Quote Creation" user="full" server="full" note="Works everywhere" />
                  <ComparisonRow feature="All 4 Templates" user="full" server="full" note="Classic, Discord, Profile L/P" />
                  <ComparisonRow feature="All 19 Fonts" user="full" server="full" note="Full font selection available" />
                  <ComparisonRow feature="Dark/Light Themes" user="full" server="full" note="No restrictions" />
                  <ComparisonRow feature="Privacy Modes" user="full" server="full" note="Public/Anonymous/Private/DM" />
                  <ComparisonRow feature="Font Gallery (/fonts)" user="full" server="full" note="Works in all contexts" />
                  <ComparisonRow feature="Default Avatar" user="full" server="full" note="Always uses global Discord avatar" />
                  <ComparisonRow feature="Server Avatar Selection" user="none" server="full" note="Requires guild member access" />
                  <ComparisonRow feature="Multi-Message Quotes" user="partial" server="full" note="Needs Read Message History permission" />
                  <ComparisonRow feature="Server Nicknames" user="none" server="full" note="Falls back to username" />
                  <ComparisonRow feature="Delete Quote Button" user="none" server="full" note="Bot needs Manage Messages permission" />
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-dark-700 bg-dark-900/50">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-dark-400">Fully supported</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-dark-400">May work but unreliable</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-dark-600" />
                  <span className="text-dark-400">Not available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why These Limitations */}
          <div className="glass rounded-2xl p-8 mb-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Why These Limitations?</h2>
                <p className="text-dark-400">
                  <strong className="text-white">User Install Mode</strong> = The bot is added to your personal
                  Discord account, not the server. Discord restricts what user-installed apps can access:
                </p>
              </div>
            </div>

            {/* Limitations Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 font-medium text-dark-300">Limitation</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-300">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <tr>
                    <td className="py-4 px-4 text-white font-medium">No Server Avatars</td>
                    <td className="py-4 px-4 text-dark-400">
                      Bot can&apos;t call <code className="bg-dark-800 px-1.5 py-0.5 rounded text-brand-400 text-sm">guild.members.fetch()</code> without server permissions
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-white font-medium">Multi-Message Unreliable</td>
                    <td className="py-4 px-4 text-dark-400">
                      Bot needs &quot;Read Message History&quot; permission to fetch other messages in channel
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-white font-medium">No Server Nicknames</td>
                    <td className="py-4 px-4 text-dark-400">
                      Can&apos;t access guild member data without server install
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-white font-medium">No Delete Button</td>
                    <td className="py-4 px-4 text-dark-400">
                      Bot needs &quot;Manage Messages&quot; permission to delete generated quotes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* User-Facing Info Box */}
          <div className="glass rounded-2xl p-8 mb-20 border border-brand-500/30">
            <h2 className="text-xl font-semibold mb-2">Some features require the bot to be installed on this server</h2>
            <p className="text-dark-300 mb-6">
              You&apos;re using quotecord as a User Install, which works great for basic quotes! However, these features need a server admin to add the bot:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Image className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span><strong className="text-white">Server avatar selection</strong> (your server-specific profile picture)</span>
              </li>
              <li className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span><strong className="text-white">Multi-message quotes</strong> (combining multiple messages)</span>
              </li>
              <li className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span><strong className="text-white">Server nickname display</strong></span>
              </li>
              <li className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span><strong className="text-white">Delete quote button</strong> (remove generated quotes)</span>
              </li>
            </ul>
            <a
              href={SERVER_INSTALL_URL}
              className="group inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-glow"
            >
              <Server className="w-4 h-4" />
              Add quotecord to Server
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {[
                {
                  question: "Can I use both installation modes?",
                  answer: "Yes! You can install quotecord as both a User App and add it to your server. This gives you the flexibility to use it anywhere while still having full features in your server."
                },
                {
                  question: "Why can't I see the server avatar option?",
                  answer: "If you're using User Install mode, the server avatar option won't appear because the bot can't access server member data. This is expected behavior, not a bug."
                },
                {
                  question: "Multi-message quotes aren't working. What's wrong?",
                  answer: "Multi-message quotes require the bot to have 'Read Message History' permission in the server. If you're using User Install, this feature may not work reliably. Ask a server admin to add the bot for consistent multi-message support."
                },
                {
                  question: "Why does my quote show my username instead of my nickname?",
                  answer: "Server nicknames are only available when the bot is installed on the server. With User Install, the bot falls back to your global Discord username."
                },
                {
                  question: "Which installation should I choose?",
                  answer: "If you want to use quotecord in DMs, group chats, or servers where you can't add bots—choose User Install. If you're a server admin and want all members to have full features—add it to your server. For the best experience, use both!"
                },
                {
                  question: "I'm a server admin. Should I add the bot even if members have User Install?",
                  answer: "Yes! Adding the bot to your server unlocks server avatars, nicknames, and reliable multi-message quotes for all members. It complements User Install rather than replacing it."
                }
              ].map((faq, index) => (
                <div key={index} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-800/30 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-dark-400 text-sm animate-slide-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
            <p className="text-dark-400 mb-8">
              Choose your installation method and start creating beautiful quotes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={USER_INSTALL_URL}
                className="group flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-glow"
              >
                <User className="w-5 h-5" />
                Install as User App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={SERVER_INSTALL_URL}
                className="group flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Server className="w-5 h-5" />
                Add to Server
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function BestForItem({
  icon,
  children
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-2 text-dark-300 text-sm">
      <span className="text-brand-400">{icon}</span>
      {children}
    </li>
  )
}

function FeatureItem({
  status,
  children
}: {
  status: 'full' | 'partial' | 'none'
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-3">
      {status === 'full' && <Check className="w-5 h-5 text-success flex-shrink-0" />}
      {status === 'partial' && <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />}
      {status === 'none' && <X className="w-5 h-5 text-dark-600 flex-shrink-0" />}
      <span className={status === 'none' ? 'text-dark-500' : 'text-dark-300'}>
        {children}
      </span>
    </li>
  )
}

function ComparisonRow({
  feature,
  user,
  server,
  note
}: {
  feature: string
  user: 'full' | 'partial' | 'none'
  server: 'full' | 'partial' | 'none'
  note?: string
}) {
  const getIcon = (status: 'full' | 'partial' | 'none') => {
    switch (status) {
      case 'full':
        return <Check className="w-5 h-5 text-success mx-auto" />
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-warning mx-auto" />
      case 'none':
        return <X className="w-5 h-5 text-dark-600 mx-auto" />
    }
  }

  return (
    <tr>
      <td className="py-4 px-6">
        <div className="text-dark-300">{feature}</div>
        {note && <div className="text-dark-500 text-xs mt-0.5">{note}</div>}
      </td>
      <td className="text-center py-4 px-6">{getIcon(user)}</td>
      <td className="text-center py-4 px-6">{getIcon(server)}</td>
    </tr>
  )
}
