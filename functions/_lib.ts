export interface Env {
  DB: D1Database
  ADMIN_TOKEN: string
  IP_HASH_SALT: string
}

export const PASSWORD_ITERATIONS = 100_000
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export const json = (body: unknown, init: ResponseInit = {}) =>
  Response.json(body, {
    ...init,
    headers: {
      'cache-control': 'no-store',
      ...init.headers
    }
  })

export async function hashIp(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${ip}${salt}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

export async function hashPassword(
  password: string,
  salt: Uint8Array,
  iterations = PASSWORD_ITERATIONS
) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256
  )
  return toBase64(new Uint8Array(bits))
}

export function randomBytes(size: number) {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytes
}

export function randomToken() {
  return [...randomBytes(32)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token)
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function parseSessionCookie(request: Request) {
  const value = request.headers.get('cookie') ?? ''
  return value
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('fmhy_session='))
    ?.slice('fmhy_session='.length)
}

export function sessionCookie(token: string, maxAge = SESSION_MAX_AGE_SECONDS) {
  return `fmhy_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`
}

export function constantTimeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index++) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }

  return difference === 0
}

export function escapeCsv(value: string | null) {
  const text = value ?? ''
  return `"${text.replaceAll('"', '""')}"`
}
