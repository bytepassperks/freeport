import type { Env } from '../../_lib'
import { hashToken, json, parseSessionCookie } from '../../_lib'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = parseSessionCookie(context.request)
  if (!token) return json({ authenticated: false, user: null })

  const session = await context.env.DB.prepare(
    `SELECT u.email, u.name, u.created_at, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ?1 AND datetime(s.expires_at) > CURRENT_TIMESTAMP`
  )
    .bind(await hashToken(token))
    .first<{
      email: string
      name: string | null
      created_at: string
      expires_at: string
    }>()
  if (!session) {
    await context.env.DB.prepare('DELETE FROM sessions WHERE id = ?1')
      .bind(await hashToken(token))
      .run()
    return json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  return json({
    user: {
      email: session.email,
      name: session.name,
      created_at: session.created_at
    }
  })
}
