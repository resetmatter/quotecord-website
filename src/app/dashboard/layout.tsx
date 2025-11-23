'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Quote,
  Home,
  Settings,
  CreditCard,
  LogOut,
  Crown,
  Menu,
  X
} from 'lucide-react'
import { getCurrentUser, UserProfile } from '@/lib/user'
import { logout, supabase } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const initSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error)
        router.push('/login?error=' + encodeURIComponent(error.message))
        return
      }

      if (!session) {
        router.push('/login')
        return
      }

      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }

      const userData = await getCurrentUser()
      setUser(userData)
      setLoading(false)
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active'

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-mesh">
        <div className="text-center max-w-md">
          <div className="glass rounded-2xl p-8 mb-4">
            <h2 className="text-lg font-semibold text-error mb-2">Profile Not Found</h2>
            <p className="text-dark-400 text-sm mb-6">
              We couldn&apos;t load your profile data. This may happen if your account was not set up correctly.
            </p>
            <button
              onClick={handleLogout}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-xl transition-all"
            >
              Sign Out and Try Again
            </button>
          </div>
          <p className="text-xs text-dark-500">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-mesh">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass-darker
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-700">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Quote className="relative w-7 h-7 text-brand-400" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Quote<span className="text-brand-400">cord</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      pathname === item.href
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center gap-3 mb-4">
              {user?.discord_avatar ? (
                <Image
                  src={user.discord_avatar}
                  alt={user.discord_username || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.discord_username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.discord_username || 'User'}</p>
                <p className="text-xs text-dark-500 flex items-center gap-1">
                  {isPremium ? (
                    <>
                      <Crown className="w-3 h-3 text-pro-gold" />
                      <span className="text-pro-gold font-medium">Pro</span>
                    </>
                  ) : (
                    'Free'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 glass-darker">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-medium">Dashboard</span>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
