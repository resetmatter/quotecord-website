'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Quote, Menu, X, Sparkles } from 'lucide-react'
import { getSession } from '@/lib/supabase'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    getSession().then(session => {
      setIsLoggedIn(!!session)
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'glass-darker shadow-lg'
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Quote className="relative w-8 h-8 text-brand-400 group-hover:text-brand-300 transition-colors" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Quote<span className="text-brand-400">dis</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/features"
              className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/templates"
              className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all"
            >
              Templates
            </Link>
            <Link
              href="/support"
              className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all"
            >
              Support
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-glow hover:shadow-glow-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-dark-300 hover:text-white font-medium py-2.5 px-4 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/pricing"
                  className="group flex items-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold hover:from-pro-gold hover:to-pro-amber text-dark-900 font-semibold py-2.5 px-5 rounded-xl transition-all shadow-glow-pro"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Pro
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              <Link
                href="/features"
                className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/templates"
                className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/support"
                className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>

              <div className="mt-4 pt-4 border-t border-dark-700 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-4 rounded-xl transition-all text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-dark-300 hover:text-white font-medium py-3 px-4 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-pro-amber to-pro-gold text-dark-900 font-semibold py-3 px-4 rounded-xl transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Get Pro
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
