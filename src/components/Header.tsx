'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquareQuote, Menu, X } from 'lucide-react'
import { getSession } from '@/lib/supabase'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    getSession().then(session => {
      setIsLoggedIn(!!session)
    })
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-discord-darker/80 backdrop-blur-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <MessageSquareQuote className="w-8 h-8 text-discord-blurple" />
            <span className="font-bold text-xl">DisQuote</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/templates" className="text-gray-300 hover:text-white transition-colors">
              Templates
            </Link>
            <Link href="/support" className="text-gray-300 hover:text-white transition-colors">
              Support
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/add"
                  className="bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add to Discord
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/templates" className="text-gray-300 hover:text-white transition-colors">
                Templates
              </Link>
              <Link href="/support" className="text-gray-300 hover:text-white transition-colors">
                Support
              </Link>
              <div className="pt-4 border-t border-gray-800 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-white transition-colors py-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/add"
                      className="bg-discord-blurple hover:bg-discord-blurple/80 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      Add to Discord
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
