import { NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'mentortechz2025'

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await createAdminToken()

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
