import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { syncGmailInbox } from '@/lib/gmail-reader'

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await syncGmailInbox()
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Gmail sync error:', err)
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 })
  }
}
