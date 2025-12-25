import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  User,
  Server,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Image,
  Palette,
  Settings,
  Share2,
  Sparkles,
  Users,
  Shield
} from 'lucide-react'

export const metadata = {
  title: 'Install Modes - QuoteCord',
  description: 'Understand the difference between User Install and Server Install modes for QuoteCord.',
}

export default function InstallModesPage() {
  return (
    <>
      <Header />
      <main className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Install
              <span className="gradient-text"> Modes</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              QuoteCord can be installed as a <strong className="text-white">User App</strong> or added to a <strong className="text-white">Server</strong>.
              Each mode has different capabilities.
            </p>
          </div>

          {/* Alert Banner */}
          <div className="glass rounded-2xl p-6 mb-10 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-amber-200 mb-1">Feature not working?</h2>
                <p className="text-dark-300 text-sm">
                  If a feature isn&apos;t working as expected, you may be using QuoteCord in <strong className="text-white">User Install</strong> mode.
                  Ask your server owner to add QuoteCord to the server for full functionality.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* User Install */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">User Install</h2>
                  <p className="text-dark-500 text-sm">Personal app</p>
                </div>
              </div>
              <p className="text-dark-400 text-sm mb-4">
                QuoteCord is installed to your Discord account. You can use it anywhere,
                but with limited features in servers where the bot isn&apos;t added.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Check className="w-4 h-4 text-success" />
                  Works in DMs & group chats
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Check className="w-4 h-4 text-success" />
                  Quote your own messages anywhere
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <X className="w-4 h-4 text-error" />
                  Limited in servers without bot
                </div>
              </div>
            </div>

            {/* Server Install */}
            <div className="glass rounded-2xl p-6 border border-brand-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <Server className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Server Install</h2>
                  <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
              </div>
              <p className="text-dark-400 text-sm mb-4">
                QuoteCord is added to the server by an admin. All members get
                full access to every feature.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Check className="w-4 h-4 text-success" />
                  All features available
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Check className="w-4 h-4 text-success" />
                  Quote any message in the server
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Check className="w-4 h-4 text-success" />
                  Server-wide settings & customization
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="glass rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold mb-6">Feature Comparison</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 pr-4 font-medium text-dark-300">Feature</th>
                    <th className="text-center py-3 px-4 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4 text-dark-400" />
                        <span>User Install</span>
                      </div>
                    </th>
                    <th className="text-center py-3 pl-4 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Server className="w-4 h-4 text-brand-400" />
                        <span>Server Install</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <FeatureRow
                    icon={<MessageCircle className="w-4 h-4" />}
                    feature="Quote your own messages"
                    userInstall={true}
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Users className="w-4 h-4" />}
                    feature="Quote other users' messages"
                    userInstall="limited"
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Image className="w-4 h-4" />}
                    feature="All templates & styles"
                    userInstall={true}
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Palette className="w-4 h-4" />}
                    feature="Custom themes & fonts"
                    userInstall={true}
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Sparkles className="w-4 h-4" />}
                    feature="Animated GIF quotes (Pro)"
                    userInstall={true}
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Share2 className="w-4 h-4" />}
                    feature="Share to channel"
                    userInstall="limited"
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Settings className="w-4 h-4" />}
                    feature="Server default settings"
                    userInstall={false}
                    serverInstall={true}
                  />
                  <FeatureRow
                    icon={<Shield className="w-4 h-4" />}
                    feature="Admin controls"
                    userInstall={false}
                    serverInstall={true}
                  />
                </tbody>
              </table>
            </div>

            <p className="text-xs text-dark-500 mt-4">
              * &quot;Limited&quot; means the feature may not work in all cases depending on Discord permissions and context.
            </p>
          </div>

          {/* CTA Section */}
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Want full functionality?</h2>
            <p className="text-dark-400 mb-6 max-w-lg mx-auto">
              Ask your server owner or admin to add QuoteCord to the server.
              Share the link below with them:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/add"
                className="group flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Server className="w-5 h-5" />
                Add to Server
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center gap-2 text-dark-400 text-sm">
                <span>or copy:</span>
                <code className="bg-dark-800 px-3 py-1.5 rounded-lg text-brand-400 select-all">
                  quotecord.com/add
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function FeatureRow({
  icon,
  feature,
  userInstall,
  serverInstall
}: {
  icon: React.ReactNode
  feature: string
  userInstall: boolean | 'limited'
  serverInstall: boolean | 'limited'
}) {
  const renderStatus = (status: boolean | 'limited') => {
    if (status === true) {
      return <Check className="w-5 h-5 text-success mx-auto" />
    } else if (status === 'limited') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4" />
          Limited
        </span>
      )
    } else {
      return <X className="w-5 h-5 text-dark-600 mx-auto" />
    }
  }

  return (
    <tr>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2 text-dark-300">
          <span className="text-dark-500">{icon}</span>
          {feature}
        </div>
      </td>
      <td className="py-3 px-4 text-center">{renderStatus(userInstall)}</td>
      <td className="py-3 pl-4 text-center">{renderStatus(serverInstall)}</td>
    </tr>
  )
}
