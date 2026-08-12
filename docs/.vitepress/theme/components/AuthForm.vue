<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ mode: 'login' | 'register' }>()
const email = ref('')
const name = ref('')
const password = ref('')
const state = ref<'idle' | 'submitting' | 'error'>('idle')
const errorMessage = ref('')
const validEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)
const validPassword = computed(
  () =>
    props.mode === 'login' ||
    (password.value.length >= 10 &&
      password.value.length <= 200 &&
      password.value.trim() === password.value)
)
const canSubmit = computed(
  () => validEmail.value && validPassword.value && state.value !== 'submitting'
)

async function submit() {
  if (!canSubmit.value) return
  state.value = 'submitting'
  errorMessage.value = ''
  try {
    const response = await fetch(`/api/auth/${props.mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
        ...(props.mode === 'register' && {
          name: name.value.trim() || undefined
        })
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to continue.')
    window.location.href = '/'
  } catch (error) {
    state.value = 'error'
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to continue.'
  }
}
</script>

<template>
  <form
    class="border-$vp-c-divider bg-$vp-c-bg-alt max-w-xl rounded-xl border-2 border-solid p-6"
    @submit.prevent="submit"
  >
    <div class="space-y-4">
      <div v-if="props.mode === 'register'">
        <label class="mb-1 block font-semibold" for="auth-name">
          Name
          <span class="text-text-2 font-normal">(optional)</span>
        </label>
        <input
          id="auth-name"
          v-model="name"
          class="border-$vp-c-divider bg-$vp-c-bg w-full rounded-lg border-2 border-solid p-2.5"
          type="text"
          autocomplete="name"
          maxlength="200"
        />
      </div>
      <div>
        <label class="mb-1 block font-semibold" for="auth-email">
          Email address
        </label>
        <input
          id="auth-email"
          v-model="email"
          class="border-$vp-c-divider bg-$vp-c-bg w-full rounded-lg border-2 border-solid p-2.5"
          type="email"
          autocomplete="email"
          maxlength="254"
          required
        />
      </div>
      <div>
        <label class="mb-1 block font-semibold" for="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          v-model="password"
          class="border-$vp-c-divider bg-$vp-c-bg w-full rounded-lg border-2 border-solid p-2.5"
          type="password"
          autocomplete="new-password"
          minlength="10"
          maxlength="200"
          required
        />
        <p v-if="props.mode === 'register'" class="text-text-2 mt-1 text-sm">
          Use 10–200 characters without leading or trailing spaces.
        </p>
      </div>
      <button
        class="bg-primary rounded-lg px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        :disabled="!canSubmit"
      >
        {{
          state === 'submitting'
            ? 'Please wait…'
            : props.mode === 'register'
              ? 'Create account'
              : 'Log in'
        }}
      </button>
      <p
        v-if="state === 'error'"
        class="text-red-600 dark:text-red-400"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>
  </form>
</template>
