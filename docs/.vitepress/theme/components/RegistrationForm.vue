<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed, ref } from 'vue'
import { brand } from '../../../../brand.config'

const route = useRoute()
const email = ref('')
const name = ref('')
const consent = ref(false)
const state = ref<'idle' | 'submitting' | 'success' | 'duplicate' | 'error'>(
  'idle'
)
const errorMessage = ref('')

const validEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)
const canSubmit = computed(
  () => validEmail.value && consent.value && state.value !== 'submitting'
)

async function submit() {
  if (!canSubmit.value) return

  state.value = 'submitting'
  errorMessage.value = ''

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        name: name.value.trim() || undefined,
        source: route.path
      })
    })
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Unable to register right now.')
    }

    state.value = result.duplicate ? 'duplicate' : 'success'
  } catch (error) {
    state.value = 'error'
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to register right now.'
  }
}
</script>

<template>
  <form
    class="border-$vp-c-divider bg-$vp-c-bg-alt max-w-xl rounded-xl border-2 border-solid p-6"
    @submit.prevent="submit"
  >
    <div class="space-y-4">
      <div>
        <label class="mb-1 block font-semibold" for="registration-email">
          Email address
        </label>
        <input
          id="registration-email"
          v-model="email"
          class="border-$vp-c-divider bg-$vp-c-bg border-2 border-solid rounded-lg w-full p-2.5"
          type="email"
          autocomplete="email"
          maxlength="254"
          required
          aria-describedby="registration-email-help"
        />
        <p id="registration-email-help" class="text-text-2 mt-1 text-sm">
          We will only use this to send occasional {{ brand.name }} updates.
        </p>
      </div>

      <div>
        <label class="mb-1 block font-semibold" for="registration-name">
          Name
          <span class="text-text-2 font-normal">(optional)</span>
        </label>
        <input
          id="registration-name"
          v-model="name"
          class="border-$vp-c-divider bg-$vp-c-bg border-2 border-solid rounded-lg w-full p-2.5"
          type="text"
          autocomplete="name"
          maxlength="200"
        />
      </div>

      <label class="flex items-start gap-2">
        <input v-model="consent" class="mt-1" type="checkbox" required />
        <span>I agree to receive occasional emails.</span>
      </label>

      <button
        class="bg-primary text-white rounded-lg px-4 py-2.5 font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        :disabled="!canSubmit"
      >
        {{ state === 'submitting' ? 'Registering…' : 'Register' }}
      </button>

      <p
        v-if="state === 'success'"
        class="text-green-600 dark:text-green-400"
        role="status"
      >
        You are registered. Thanks for signing up!
      </p>
      <p
        v-else-if="state === 'duplicate'"
        class="text-green-600 dark:text-green-400"
        role="status"
      >
        This email is already registered.
      </p>
      <p
        v-else-if="state === 'error'"
        class="text-red-600 dark:text-red-400"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>
  </form>
</template>
