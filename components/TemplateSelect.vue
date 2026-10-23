<template>
  <div class="relative" ref="dropdownRef">
    <!-- Template Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <span>Template</span>
      <svg class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Template Menu Dropdown -->
    <div
      v-if="isOpen"
      class="absolute left-0 sm:left-auto mt-2 w-[290px] sm:w-80 max-h-[75vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-50 p-2 space-y-1 focus:outline-none animate-fade-in border border-slate-200 dark:border-slate-800"
    >
      <div class="px-2 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        Pilih Template Diagram
      </div>

      <button
        v-for="tmpl in DIAGRAM_TEMPLATES"
        :key="tmpl.id"
        type="button"
        @click="selectTemplate(tmpl)"
        class="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-brand-50 dark:hover:bg-slate-800 group transition-colors flex items-start space-x-2.5"
      >
        <span class="mt-0.5 p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-brand-100 group-hover:text-brand-700 dark:group-hover:bg-brand-950 dark:group-hover:text-brand-300">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {{ tmpl.name }}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {{ tmpl.description }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DIAGRAM_TEMPLATES, type DiagramTemplate } from '~/utils/templates'

const emit = defineEmits<{
  (e: 'select', template: DiagramTemplate): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

const selectTemplate = (template: DiagramTemplate) => {
  emit('select', template)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>
