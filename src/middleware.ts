import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Definér ruter der kræver authentication
const PROTECTED_ROUTES = ['/calendar']

// Definér auth-relaterede ruter
const AUTH_ROUTES = ['/login', '/signup', '/reset-password']

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Hvis brugeren prøver at tilgå beskyttede ruter uden at være logget ind
    if (!session && PROTECTED_ROUTES.includes(req.nextUrl.pathname)) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Hvis brugeren er på auth sider og er logget ind, redirect til kalender
    if (session && AUTH_ROUTES.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/calendar', req.url))
    }

    // Tilføj session info til response headers for debugging
    res.headers.set('x-session-status', session ? 'authenticated' : 'unauthenticated')
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Ved fejl, redirect til login med fejl parameter
    const errorUrl = new URL('/login', req.url)
    errorUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(errorUrl)
  }
}

// Angiv hvilke ruter middleware skal køre på
export const config = {
  matcher: [...PROTECTED_ROUTES, ...AUTH_ROUTES]
} 