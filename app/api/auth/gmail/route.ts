import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/gmail'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authUrl = getAuthUrl()
  return NextResponse.redirect(authUrl)
}
