import { ref } from 'vue'

export type AuthUser = {
  email: string
  name: string | null
}

export const authUser = ref<AuthUser | null>(null)

let userLoaded = false
let userRequest: Promise<void> | null = null

export async function loadAuthUser() {
  if (userLoaded) return
  if (!userRequest) {
    userRequest = (async () => {
      const response = await fetch('/api/auth/me')
      if (response.ok) authUser.value = (await response.json()).user ?? null
      userLoaded = true
    })()
  }
  await userRequest
}

export function clearAuthUser() {
  authUser.value = null
  userLoaded = true
}
