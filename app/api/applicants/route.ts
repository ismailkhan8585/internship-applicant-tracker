import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const sort = searchParams.get('sort') || 'newest'

  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('applicants')
    .select('*', { count: 'exact' })

  if (status && status !== 'ALL') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (sort === 'newest') {
    query = query.order('date_applied', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('date_applied', { ascending: true })
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Supabase applicants fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    applicants: data || [],
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
