<script setup lang="ts">
import { useRouter } from 'vitepress'
import { onMounted, ref } from 'vue'

const router = useRouter()
const user = ref<{ email: string; name: string | null } | null>(null)

async function loadUser() {
  const response = await fetch('/api/auth/me')
  if (response.ok) user.value = (await response.json()).user
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  user.value = null
  await router.go('/')
}

onMounted(loadUser)
</script>

<template>
  <div class="auth-status flex items-center gap-2 text-sm">
    <template v-if="user">
      <span class="hidden max-w-36 truncate sm:inline">
        {{ user.name || user.email }}
      </span>
      <button class="VPButton medium alt" type="button" @click="logout">
        Log out
      </button>
    </template>
    <template v-else>
      <a class="auth-status-link" href="/login">Log in</a>
    </template>
  </div>
</template>
