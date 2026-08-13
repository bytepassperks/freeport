<script setup lang="ts">
import { useRouter } from 'vitepress'
import { onMounted } from 'vue'
import {
  authUser,
  clearAuthUser,
  loadAuthUser
} from '../composables/authStatus'

const router = useRouter()

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  clearAuthUser()
  await router.go('/')
}

onMounted(loadAuthUser)
</script>

<template>
  <div class="auth-status flex items-center gap-2 text-sm">
    <template v-if="authUser">
      <span class="hidden max-w-36 truncate sm:inline">
        {{ authUser.name || authUser.email }}
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
