import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getBaseUrl(request: NextRequest): string {
  // Get the host from headers (works with proxies like Railway)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'

  const actualHost = forwardedHost || host

  if (actualHost) {
    return `${protocol}://${actualHost}`
  }

  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_URL || 'https://quotecord.com'
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const baseUrl = getBaseUrl(request)

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  // If there's a code, exchange it for a session (PKCE flow)
  if (code) {
    try {
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError.message)
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
    }
  }

  // Redirect to dashboard - if using implicit flow, tokens will be in URL hash
  // and the dashboard's client-side code will handle them
  return NextResponse.redirect(`${baseUrl}/dashboard`)
}
