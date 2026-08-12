import type { Env } from '../../_lib'
import { constantTimeEqual, escapeCsv, json } from '../../_lib'

function authorized(request: Request, expected: string) {
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  return (
    header.startsWith(prefix) &&
    constantTimeEqual(header.slice(prefix.length), expected)
  )
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!authorized(context.request, context.env.ADMIN_TOKEN)) {
    return json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await context.env.DB.prepare(
    `SELECT id, email, name, source, country, created_at
     FROM leads
     ORDER BY id ASC`
  ).all<{
    id: number
    email: string
    name: string | null
    source: string | null
    country: string | null
    created_at: string
  }>()

  const format =
    new URL(context.request.url).searchParams.get('format')?.toLowerCase() ??
    'json'
  if (format === 'json') {
    return json({ leads: rows.results })
  }

  if (format !== 'csv') {
    return json(
      { ok: false, error: 'format must be csv or json' },
      { status: 400 }
    )
  }

  const header = 'id,email,name,source,country,created_at'
  const lines = rows.results.map((row) =>
    [row.id, row.email, row.name, row.source, row.country, row.created_at]
      .map((value) => escapeCsv(String(value ?? '')))
      .join(',')
  )

  return new Response([header, ...lines].join('\r\n') + '\r\n', {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="fmhy-leads.csv"'
    }
  })
}
