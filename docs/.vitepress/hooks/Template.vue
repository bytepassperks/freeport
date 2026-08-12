<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  image?: string
  brandName?: string
}>()
</script>

<template>
  <span
    tw="w-full h-full flex flex-col"
    :style="{
      backgroundImage: `url(${image})`,
      backgroundColor: '#0B1F33'
    }"
  >
    <span
      tw="p-12 w-full min-h-0 grow flex flex-col items-start justify-between"
    >
      <span tw="w-full flex justify-between items-center text-5xl font-medium">
        <span tw="flex items-center">
          <span tw="text-white ml-2 mt-1 font-semibold">
            {{ brandName }}
          </span>
        </span>
        <span
          tw="rounded-full px-5 py-2 text-2xl font-semibold"
          style="background-color: #1fa9a0; color: #ffffff"
        >
          curated links, no hosted files
        </span>
      </span>
      <span tw="w-full pr-56 flex flex-col items-start justify-end">
        <span style="color: #f7f9fb" tw="text-6xl font-bold" v-html="title" />
        <span style="color: #f2c879" tw="mt-2 text-4xl" v-html="description" />
      </span>
    </span>
  </span>
</template>
