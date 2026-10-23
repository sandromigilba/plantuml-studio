<template>
  <div class="h-full w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: '/logo-plantuml.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300..900;1,300..900&family=Roboto+Mono:ital,wght@0,300..700;1,300..700&display=swap',
    },
  ],
})

// Initialize theme on app mount
const { initTheme } = useTheme()
onMounted(() => {
  initTheme()
})
</script>
