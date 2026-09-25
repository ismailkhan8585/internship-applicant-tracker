import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  let query = supabaseAdmin.from('applicants').select('*').order('date_applied', { ascending: false })
  if (status && status !== 'ALL') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((a) => ({
    Name: a.name,
    Email: a.email,
    Status: a.status,
    'Date Applied': new Date(a.date_applied).toLocaleDateString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    'Internship Post': a.internship_post,
    'CV Filename': a.cv_filename || '',
    'Confirmation Sent': a.confirmation_sent_at
      ? new Date(a.confirmation_sent_at).toLocaleDateString()
      : '',
    'Rejection Sent': a.rejection_sent_at
      ? new Date(a.rejection_sent_at).toLocaleDateString()
      : '',
    Notes: a.notes || '',
    Subject: a.subject || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 35 }, { wch: 14 }, { wch: 22 },
    { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 18 },
    { wch: 40 }, { wch: 40 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Applicants')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="mentortechz-applicants-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
