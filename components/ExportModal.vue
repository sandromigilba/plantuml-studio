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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Unduh Diagram</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih format berkas yang ingin Anda unduh ke perangkat.
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

        <!-- Export Options List -->
        <div class="space-y-3 mt-4">
          <!-- SVG Option -->
          <button
            type="button"
            @click="handleExport('svg')"
            class="w-full flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-all text-left group"
          >
            <span class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              SVG
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Format Vektor (.svg)
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kualitas vektor tajam tanpa pecah saat diperbesar, ideal untuk web dan aplikasi desain.
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-500 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- PNG Option -->
          <button
            type="button"
            @click="handleExport('png')"
            class="w-full flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-all text-left group"
          >
            <span class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              PNG
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Format Gambar Raster (.png)
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Gambar resolusi tinggi siap pakai untuk dokumen Word, PDF, slide presentasi, atau pesan chat.
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-500 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- PUML Option -->
          <button
            type="button"
            @click="handleExport('puml')"
            class="w-full flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-all text-left group"
          >
            <span class="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              PUML
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Berkas Sumber (.puml)
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Menyimpan seluruh kode sumber teks diagram untuk diedit kembali di kemudian hari.
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-500 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'export', type: 'svg' | 'png' | 'puml'): void
}>()

const handleExport = (type: 'svg' | 'png' | 'puml') => {
  emit('export', type)
  emit('close')
}
</script>
