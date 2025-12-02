import Link from 'next/link'
import { Quote, Github, Twitter, Heart, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative border-t border-dark-800/50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Quote className="relative w-7 h-7 text-brand-400" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                quote<span className="text-brand-400">cord</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Transform Discord messages into stunning, shareable quote images. Quote this!
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-dark-300 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-dark-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5">
                  Pricing
                  <span className="px-1.5 py-0.5 bg-pro-amber/20 text-pro-gold text-xs rounded font-medium">Pro</span>
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/add" className="text-dark-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1">
                  Add to Discord
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-dark-300 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support#faq" className="text-dark-400 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin/global-flags" className="text-dark-500 hover:text-dark-400 text-sm transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-dark-300 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-dark-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-dark-500 text-sm">
              &copy; {new Date().getFullYear()} quotecord. All rights reserved.
            </p>
            <p className="text-dark-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-accent-pink" /> for the Discord community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
