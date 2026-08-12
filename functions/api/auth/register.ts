import type { Env } from '../../_lib'
import {
  hashIp,
  hashPassword,
  hashToken,
  json,
  PASSWORD_ITERATIONS,
  randomBytes,
  randomToken,
  sessionCookie
} from '../../_lib'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BODY_BYTES = 8192

function validPassword(password: string) {
  return (
    password.length >= 10 &&
    password.length <= 200 &&
    password.trim() === password
  )
}

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

  let input: { email?: unknown; name?: unknown; password?: unknown }
  try {
    input = JSON.parse(body)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email =
    typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return json(
      { ok: false, error: 'Please enter a valid email address' },
      { status: 400 }
    )
  }
  if (!validPassword(password)) {
    return json(
      {
        ok: false,
        error:
          'Password must be 10–200 characters without leading or trailing spaces'
      },
      { status: 400 }
    )
  }

  const existing = await context.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?1'
  )
    .bind(email)
    .first()
  if (existing) {
    return json(
      { ok: false, error: 'An account already exists for this email' },
      { status: 409 }
    )
  }

  const salt = randomBytes(16)
  const passwordHash = await hashPassword(password, salt)
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 200)
      : null
  const userAgent = context.request.headers.get('user-agent')
  const ipHash = await hashIp(
    context.request.headers.get('cf-connecting-ip') ?? 'unknown',
    context.env.IP_HASH_SALT
  )

  await context.env.DB.prepare(
    `INSERT INTO users (email, name, password_hash, password_salt, kdf_iterations)
     VALUES (?1, ?2, ?3, ?4, ?5)`
  )
    .bind(
      email,
      name,
      passwordHash,
      btoa(String.fromCharCode(...salt)),
      PASSWORD_ITERATIONS
    )
    .run()
  const user = await context.env.DB.prepare(
    'SELECT id, created_at FROM users WHERE email = ?1'
  )
    .bind(email)
    .first<{ id: number; created_at: string }>()
  if (!user) {
    return json(
      { ok: false, error: 'Unable to create account' },
      { status: 500 }
    )
  }
  const token = randomToken()
  const sessionId = await hashToken(token)
  await context.env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, user_agent, ip_hash)
     VALUES (?1, ?2, datetime('now', '+2592000 seconds'), ?3, ?4)`
  )
    .bind(sessionId, user.id, userAgent, ipHash)
    .run()

  return json(
    { ok: true, user: { email, name, created_at: user.created_at } },
    { headers: { 'set-cookie': sessionCookie(token) } }
  )
}
