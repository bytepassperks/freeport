import type { Env } from '../_lib'
import { hashIp, json } from '../_lib'

const MAX_BODY_BYTES = 4096
const MAX_REQUESTS_PER_HOUR = 5
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const contentType = context.request.headers.get('content-type')?.toLowerCase()
  if (!contentType?.startsWith('application/json')) {
    return json(
      { ok: false, error: 'Content-Type must be application/json' },
      { status: 400 }
    )
  }

  const contentLength = Number(context.request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json(
      { ok: false, error: 'Request body is too large' },
      { status: 413 }
    )
  }

  const body = await context.request.text()
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return json(
      { ok: false, error: 'Request body is too large' },
      { status: 413 }
    )
  }

  let input: { email?: unknown; name?: unknown; source?: unknown }
  try {
    input = JSON.parse(body)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email =
    typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return json(
      { ok: false, error: 'Please enter a valid email address' },
      { status: 400 }
    )
  }

  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 200)
      : null
  const source =
    typeof input.source === 'string' && input.source.trim()
      ? input.source.trim().slice(0, 500)
      : null
  const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown'
  const ipHash = await hashIp(ip, context.env.IP_HASH_SALT)

  const recent = await context.env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM leads
     WHERE ip_hash = ?1 AND created_at >= datetime('now', '-1 hour')`
  )
    .bind(ipHash)
    .first<{ count: number }>()

  if ((recent?.count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return json(
      {
        ok: false,
        error: 'Too many registration attempts. Please try again later.'
      },
      {
        status: 429,
        headers: { 'retry-after': '3600' }
      }
    )
  }

  const result = await context.env.DB.prepare(
    `INSERT INTO leads (email, name, source, user_agent, country, ip_hash)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(email) DO NOTHING`
  )
    .bind(
      email,
      name,
      source,
      context.request.headers.get('user-agent'),
      context.request.cf?.country ?? null,
      ipHash
    )
    .run()

  return json({
    ok: true,
    ...(result.meta.changes === 0 && { duplicate: true })
  })
}
