import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // For dashboard routes, let client-side handle auth
  // This allows the client to process tokens from URL hash (implicit flow)
  // The dashboard layout will redirect to login if no session is found
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Only redirect if we're sure there's no session AND this isn't a fresh OAuth redirect
    // (OAuth redirects may have tokens in the hash which middleware can't see)
    if (!session) {
      // Check if this might be an OAuth redirect by looking at referer
      const referer = request.headers.get('referer') || ''
      const isOAuthRedirect = referer.includes('supabase.co') || referer.includes('discord.com')

      // If not an OAuth redirect, redirect to login
      if (!isOAuthRedirect) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      // Otherwise, let the request through for client-side session handling
    }
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
