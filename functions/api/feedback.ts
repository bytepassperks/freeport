import type { Env } from '../_lib'
import { hashIp, json } from '../_lib'

const MAX_BODY_BYTES = 16_384
const MAX_REQUESTS_PER_HOUR = 5
const TYPES = new Set(['suggestion', 'appreciation', 'other'])

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const contentType = context.request.headers.get('content-type')?.toLowerCase()
  if (!contentType?.startsWith('application/json')) {
    return json(
      { ok: false, error: 'Content-Type must be application/json' },
      { status: 400 }
    )
  }

  const body = await context.request.text()
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return json(
      { ok: false, error: 'Request body is too large' },
      { status: 413 }
    )
  }

  let input: Record<string, unknown>
  try {
    input = JSON.parse(body)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const message =
    typeof input.message === 'string' ? input.message.trim().slice(0, 1000) : ''
  const type = typeof input.type === 'string' ? input.type : ''
  const page =
    typeof input.page === 'string' ? input.page.trim().slice(0, 500) : ''
  if (!message || message.length < 5 || !TYPES.has(type) || !page) {
    return json({ ok: false, error: 'Invalid feedback' }, { status: 400 })
  }

  const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown'
  const ipHash = await hashIp(ip, context.env.IP_HASH_SALT)
  const recent = await context.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM feedback
     WHERE ip_hash = ?1 AND created_at >= datetime('now', '-1 hour')`
  )
    .bind(ipHash)
    .first<{ count: number }>()
  if ((recent?.count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return json(
      { ok: false, error: 'Too many feedback submissions. Try again later.' },
      { status: 429, headers: { 'retry-after': '3600' } }
    )
  }

  await context.env.DB.prepare(
    `INSERT INTO feedback
      (message, type, page, heading, contact, user_agent, country, ip_hash)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
  )
    .bind(
      message,
      type,
      page,
      typeof input.heading === 'string'
        ? input.heading.trim().slice(0, 500)
        : null,
      typeof input.contact === 'string'
        ? input.contact.trim().slice(0, 300)
        : null,
      context.request.headers.get('user-agent'),
      context.request.cf?.country ?? null,
      ipHash
    )
    .run()

  return json({ ok: true, status: 'ok' })
}
