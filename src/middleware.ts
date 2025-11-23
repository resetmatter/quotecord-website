import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Dashboard routes: let client-side handle all auth
  // The dashboard layout will check session and redirect to login if needed
  // This is necessary because implicit flow tokens in URL hash aren't visible to middleware
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return res
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
