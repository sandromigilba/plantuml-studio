<template>
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-30 select-none shadow-xs relative">
    <!-- Left Section: Logo, Projects Drawer Toggle, Active Project Title -->
    <div class="flex items-center space-x-3">
      <!-- Open Project Sidebar Button (Icon only) -->
      <button
        type="button"
        @click="emit('toggleSidebar')"
        class="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg"
        title="Daftar Proyek"
        aria-label="Buka daftar proyek"
      >
        <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      <!-- App Brand Logo -->
      <div class="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
        <img
          src="/logo-plantuml.png"
          alt="PlantUML Logo"
          class="w-7 h-7 object-contain rounded-md"
        />
        <span class="font-extrabold text-sm tracking-tight leading-none">
          <span class="bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">PlantUML</span>
          <span class="text-slate-600 dark:text-slate-300 font-light ml-1">Studio</span>
        </span>
      </div>

      <!-- Active Project Title -->
      <div class="hidden lg:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3 text-xs">
        <span class="text-slate-400 dark:text-slate-500">File:</span>
        <span class="font-semibold text-slate-700 dark:text-slate-200 max-w-[160px] truncate" :title="activeProjectName">
          {{ activeProjectName }}
        </span>
      </div>
    </div>

    <!-- Center Section: Template Selector (Dead-Center on desktop) -->
    <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
      <button
        type="button"
        @click="emit('openTemplate')"
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
        title="Pilih Template Diagram"
      >
        <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Template</span>
      </button>
    </div>

    <!-- Right Section: Export, Share, Theme (Desktop only; on mobile in sidebar) -->
    <div class="hidden md:flex items-center space-x-2">
      <!-- Unduh Modal Trigger -->
      <button
        type="button"
        @click="emit('openExport')"
        class="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg"
        title="Unduh Diagram"
        aria-label="Unduh Diagram"
      >
        <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      <!-- Bagikan Modal Trigger -->
      <button
        type="button"
        @click="emit('openShare')"
        class="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg"
        title="Bagikan Diagram"
        aria-label="Bagikan Diagram"
      >
        <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      <!-- Direct Theme Toggle -->
      <button
        type="button"
        @click="toggleTheme"
        class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        :aria-label="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
      >
        <svg v-if="isDark" class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  projectCount: number
  activeProjectName: string
}>()

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
  (e: 'openTemplate'): void
  (e: 'openExport'): void
  (e: 'openShare'): void
}>()

const { isDark, toggleTheme } = useTheme()
</script>
