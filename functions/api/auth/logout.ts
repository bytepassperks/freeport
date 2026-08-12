import type { Env } from '../../_lib'
import { hashToken, json, parseSessionCookie } from '../../_lib'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const token = parseSessionCookie(context.request)
  if (token) {
    await context.env.DB.prepare('DELETE FROM sessions WHERE id = ?1')
      .bind(await hashToken(token))
      .run()
  }
  return json(
    { ok: true },
    {
      headers: {
        'set-cookie':
          'fmhy_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax'
      }
    }
  )
}
