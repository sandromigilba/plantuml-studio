<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop overlay -->
    <div
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Modal Dialog Center -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl transition-all border border-slate-200 dark:border-slate-800 animate-fade-in"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <svg class="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Bagikan & Salin Diagram</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Salin tautan online atau kode diagram untuk dibagikan dengan rekan kerja.
            </p>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Share Options List -->
        <div class="space-y-4 mt-4">
          <!-- 1. Share URL (Hash) -->
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Tautan Berbagi Online</span>
              </span>
              <span class="text-[10px] text-slate-400">Kode tersimpan di URL hash</span>
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="text"
                readonly
                :value="shareUrl"
                class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                type="button"
                @click="copyText(shareUrl, 'link')"
                class="flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 transition-colors shadow-xs"
              >
                {{ copiedType === 'link' ? 'Tersalin!' : 'Salin' }}
              </button>
            </div>
          </div>

          <!-- 2. Direct Image URL -->
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Tautan Gambar Server</span>
              </span>
              <span class="text-[10px] text-slate-400">URL langsung PlantUML</span>
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="text"
                readonly
                :value="directUrl"
                class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                type="button"
                @click="copyText(directUrl, 'image')"
                class="flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors shadow-xs"
              >
                {{ copiedType === 'image' ? 'Tersalin!' : 'Salin' }}
              </button>
            </div>
          </div>

          <!-- 3. Copy Code Action -->
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Salin Teks Kode PlantUML</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Salin seluruh teks diagram yang ada di editor ke papan klip.
              </p>
            </div>
            <button
              type="button"
              @click="copyText(code, 'code')"
              class="px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-colors shadow-xs"
            >
              {{ copiedType === 'code' ? 'Tersalin!' : 'Salin Kode' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  shareUrl: string
  directUrl: string
  code: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copy', type: 'shareLink' | 'imageUrl' | 'code'): void
}>()

const copiedType = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const copyText = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedType.value = type
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedType.value = null
    }, 2000)
  } catch (e) {
    console.error('Gagal menyalin:', e)
  }
}
</script>
