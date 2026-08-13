<script setup lang="ts">
const openSearch = () => {
  document.querySelector<HTMLButtonElement>('.DocSearch-Button')?.click()
}
</script>

<template>
  <button class="freeport-hero-search" type="button" @click="openSearch">
    <span class="freeport-hero-search-icon" aria-hidden="true">⌕</span>
    <span class="freeport-hero-search-label">Search the directory</span>
    <kbd>Ctrl K</kbd>
  </button>
</template>
