import type { Env } from '../../_lib'
import {
  hashIp,
  hashPassword,
  hashToken,
  json,
  PASSWORD_ITERATIONS,
  randomToken,
  sessionCookie
} from '../../_lib'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BODY_BYTES = 8192
const DUMMY_SALT = new Uint8Array(16)

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (
    !context.request.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  ) {
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

  let input: { email?: unknown; password?: unknown }
  try {
    input = JSON.parse(body)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const email =
    typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  if (email.length > 254 || !EMAIL_PATTERN.test(email) || !password) {
    return json(
      { ok: false, error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  const ipHash = await hashIp(
    context.request.headers.get('cf-connecting-ip') ?? 'unknown',
    context.env.IP_HASH_SALT
  )
  const attempts = await context.env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM auth_attempts
     WHERE ip_hash = ?1 AND created_at >= datetime('now', '-1 hour')`
  )
    .bind(ipHash)
    .first<{ count: number }>()
  const emailAttempts = await context.env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM auth_attempts
     WHERE email = ?1 AND created_at >= datetime('now', '-1 hour')`
  )
    .bind(email)
    .first<{ count: number }>()
  if ((attempts?.count ?? 0) >= 10 || (emailAttempts?.count ?? 0) >= 10) {
    return json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }

  const user = await context.env.DB.prepare(
    `SELECT id, email, name, password_hash, password_salt, kdf_iterations, created_at
     FROM users WHERE email = ?1`
  )
    .bind(email)
    .first<{
      id: number
      email: string
      name: string | null
      password_hash: string
      password_salt: string
      kdf_iterations: number
      created_at: string
    }>()
  const salt = user
    ? Uint8Array.from(atob(user.password_salt), (character) =>
        character.charCodeAt(0)
      )
    : DUMMY_SALT
  const candidate = await hashPassword(
    password,
    salt,
    user?.kdf_iterations ?? PASSWORD_ITERATIONS
  )
  if (!user || candidate !== user.password_hash) {
    await context.env.DB.prepare(
      'INSERT INTO auth_attempts (email, ip_hash) VALUES (?1, ?2)'
    )
      .bind(email, ipHash)
      .run()
    return json(
      { ok: false, error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  const token = randomToken()
  const sessionId = await hashToken(token)
  await context.env.DB.batch([
    context.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, expires_at, user_agent, ip_hash)
       VALUES (?1, ?2, datetime('now', '+2592000 seconds'), ?3, ?4)`
    ).bind(
      sessionId,
      user.id,
      context.request.headers.get('user-agent'),
      ipHash
    ),
    context.env.DB.prepare(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?1`
    ).bind(user.id),
    context.env.DB.prepare('DELETE FROM auth_attempts WHERE email = ?1').bind(
      email
    )
  ])

  return json(
    {
      ok: true,
      user: { email: user.email, name: user.name, created_at: user.created_at }
    },
    { headers: { 'set-cookie': sessionCookie(token) } }
  )
}
