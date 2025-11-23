import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a code, exchange it for a session (PKCE flow)
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError.message)
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('error', exchangeError.message)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'Authentication failed. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to dashboard - if using implicit flow, tokens will be in URL hash
  // and the dashboard's client-side code will handle them
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
