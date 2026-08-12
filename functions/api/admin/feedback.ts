import type { Env } from '../../_lib'
import { constantTimeEqual, escapeCsv, json } from '../../_lib'

function authorized(request: Request, expected: string) {
  const header = request.headers.get('authorization') ?? ''
  return (
    header.startsWith('Bearer ') &&
    constantTimeEqual(header.slice('Bearer '.length), expected)
  )
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!authorized(context.request, context.env.ADMIN_TOKEN)) {
    return json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await context.env.DB.prepare(
    `SELECT id, message, type, page, heading, contact, country, created_at
     FROM feedback ORDER BY id ASC`
  ).all()
  const format =
    new URL(context.request.url).searchParams.get('format')?.toLowerCase() ??
    'json'
  if (format === 'json') return json({ feedback: rows.results })
  if (format !== 'csv') {
    return json(
      { ok: false, error: 'format must be csv or json' },
      { status: 400 }
    )
  }

  const header = 'id,message,type,page,heading,contact,country,created_at'
  const lines = rows.results.map((row: Record<string, unknown>) =>
    [
      row.id,
      row.message,
      row.type,
      row.page,
      row.heading,
      row.contact,
      row.country,
      row.created_at
    ]
      .map((value) => escapeCsv(String(value ?? '')))
      .join(',')
  )
  return new Response(`${[header, ...lines].join('\r\n')}\r\n`, {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="freeport-feedback.csv"'
    }
  })
}
