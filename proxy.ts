import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const protectedRoutes = ['/dashboard', '/email']
const publicRoutes = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r))

  const token = request.cookies.get('admin_token')?.value

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
      await jwtVerify(token, secret)
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  if (isPublic && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
      await jwtVerify(token, secret)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // invalid token — let them visit login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/email/:path*', '/login'],
}
