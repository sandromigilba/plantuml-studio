<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
    <!-- Top Application Toolbar -->
    <Toolbar
      :project-count="projects.length"
      :active-project-name="activeProject?.name || 'Diagram'"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      @open-template="isTemplateModalOpen = true"
      @open-export="isExportModalOpen = true"
      @open-share="isShareModalOpen = true"
    />

    <!-- Main Workspace Container (Split Pane on desktop, Tabbed on mobile) -->
    <main class="flex-1 flex overflow-hidden relative pb-14 md:pb-0" ref="containerRef">
      <!-- Left Pane: Code Editor -->
      <section
        :style="isDesktop ? { width: `${splitPercent}%` } : {}"
        :class="[
          'h-full flex flex-col flex-shrink-0 transition-none',
          !isDesktop && mobileTab !== 'editor' ? 'hidden' : 'w-full md:w-auto'
        ]"
        aria-label="Editor Kode PlantUML"
      >
        <CodeEditor
          ref="codeEditorRef"
          v-model="code"
          :is-loading="isEffectiveLoading"
          @render="handleManualRender"
          @change="onCodeChange"
        />
      </section>

      <!-- Draggable Splitter Divider (Desktop only) -->
      <div
        v-if="isDesktop"
        @mousedown="startResize"
        class="w-1.5 hover:w-2 bg-slate-200 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 cursor-col-resize flex-shrink-0 transition-all z-20 flex items-center justify-center group"
        title="Geser untuk mengubah ukuran panel (Klik ganda untuk reset 25%)"
        @dblclick="resetSplit"
      >
        <div class="h-8 w-0.5 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors"></div>
      </div>

      <!-- Right Pane: Diagram Preview -->
      <section
        :style="isDesktop ? { width: `${100 - splitPercent}%` } : {}"
        :class="[
          'h-full flex flex-col flex-1 overflow-hidden transition-none',
          !isDesktop && mobileTab !== 'preview' ? 'hidden' : 'w-full'
        ]"
        aria-label="Pratinjau Diagram"
      >
        <DiagramPreview
          ref="diagramPreviewRef"
          :rendered-data="renderedData"
          :format="format"
          :is-loading="isEffectiveLoading"
          :is-error="isError"
          :is-syntax-error="isSyntaxError"
          :error-message="errorMessage"
          :direct-url="directUrl"
          :fit-trigger="fitTrigger"
          @retry="handleManualRender"
          @rendered="onPreviewRendered"
          @undo="codeEditorRef?.undo()"
          @redo="codeEditorRef?.redo()"
        />
      </section>
    </main>

    <!-- Mobile Bottom Navigation Bar (Phone & Tablet) -->
    <nav
      v-if="!isDesktop"
      class="fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-8 z-30 backdrop-blur-md shadow-lg"
      aria-label="Navigasi Mobile"
    >
      <!-- Tab Editor -->
      <button
        type="button"
        @click="mobileTab = 'editor'"
        :class="[
          mobileTab === 'editor'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 font-medium',
          'flex flex-col items-center justify-center py-1 transition-colors'
        ]"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span class="text-[11px]">Editor</span>
      </button>

      <!-- Tab Preview -->
      <button
        type="button"
        @click="mobileTab = 'preview'"
        :class="[
          mobileTab === 'preview'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 font-medium',
          'flex flex-col items-center justify-center py-1 transition-colors'
        ]"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="text-[11px]">Preview</span>
      </button>
    </nav>

    <!-- Project Drawer Sidebar -->
    <ProjectSidebar
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
      @selected="onProjectSelected"
      @open-template="isTemplateModalOpen = true"
      @open-export="isExportModalOpen = true"
      @open-share="isShareModalOpen = true"
    />

    <!-- Dialog Modals (Template, Export, Share) -->
    <TemplateModal
      :is-open="isTemplateModalOpen"
      @close="isTemplateModalOpen = false"
      @select="onSelectTemplate"
    />

    <ExportModal
      :is-open="isExportModalOpen"
      @close="isExportModalOpen = false"
      @export="onExport"
    />

    <ShareModal
      :is-open="isShareModalOpen"
      :share-url="getShareUrl()"
      :direct-url="directUrl"
      :code="code"
      @close="isShareModalOpen = false"
      @copy="onCopy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import plantumlEncoder from 'plantuml-encoder'
import { usePlantUml } from '~/composables/usePlantUml'
import { useProjects, type Project } from '~/composables/useProjects'
import type { DiagramTemplate } from '~/utils/templates'

// Page Meta & SEO
useHead({
  title: 'PlantUML Studio',
  link: [
    { rel: 'icon', type: 'image/png', href: '/logo-plantuml.png' },
  ],
  meta: [
    { name: 'description', content: 'Aplikasi editor kode PlantUML interaktif dengan auto-render live, zoom, pan, ekspor SVG/PNG, dan penyimpanan lokal.' },
  ],
})

const {
  code,
  format,
  isLoading,
  isError,
  isSyntaxError,
  errorMessage,
  renderedData,
  directUrl,
  renderNow,
  triggerAutoRender,
  downloadPuml,
  downloadSvg,
  downloadPng,
  copyToClipboard,
  getShareUrl,
} = usePlantUml()

const {
  projects,
  activeProjectId,
  activeProject,
  initProjects,
  updateProjectCode,
} = useProjects()

// UI state
const isSidebarOpen = ref(false)
const isTemplateModalOpen = ref(false)
const isExportModalOpen = ref(false)
const isShareModalOpen = ref(false)
const fitTrigger = ref(0)
const diagramPreviewRef = ref<any>(null)
const codeEditorRef = ref<any>(null)
const mobileTab = ref<'editor' | 'preview'>('editor')
const splitPercent = ref(25) // Default 25% (seperempat layar)
const isDesktop = ref(true)
const isResizing = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Precise rendering lifecycle tracking so loading icon doesn't stop prematurely
const isPreviewRendered = ref(true)
let renderSafetyTimer: ReturnType<typeof setTimeout> | null = null

const isEffectiveLoading = computed(() => isLoading.value || !isPreviewRendered.value)

const onPreviewRendered = () => {
  if (renderSafetyTimer) {
    clearTimeout(renderSafetyTimer)
    renderSafetyTimer = null
  }
  isPreviewRendered.value = true
}

const startRenderWait = () => {
  isPreviewRendered.value = false
  if (renderSafetyTimer) clearTimeout(renderSafetyTimer)
  renderSafetyTimer = setTimeout(() => {
    isPreviewRendered.value = true
  }, 4000)
}

watch(isLoading, (loading) => {
  if (loading) {
    startRenderWait()
  } else if (isError.value || isSyntaxError.value || !renderedData.value) {
    onPreviewRendered()
  }
})

const showToast = (_msg: string) => {
  // Notifications disabled as requested
}

// Check window width for responsive split vs mobile tab
const checkResponsive = () => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= 768
  }
}

// Split pane resizing logic
const startResize = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', endResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value || !containerRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - containerRect.left
  const totalWidth = containerRect.width
  let newPercent = (mouseX / totalWidth) * 100

  // Constrain between 15% and 80%
  newPercent = Math.max(15, Math.min(80, newPercent))
  splitPercent.value = Number(newPercent.toFixed(1))
}

const endResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', endResize)
}

const resetSplit = () => {
  splitPercent.value = 25
}

// Code Change & Autosave
const onCodeChange = (newCode: string) => {
  // Autosave to active project
  if (activeProjectId.value) {
    updateProjectCode(activeProjectId.value, newCode)
  }
  // Auto-render with debounce 600ms
  triggerAutoRender(600)
}

// Manual Render button or Ctrl+Enter
const handleManualRender = () => {
  startRenderWait()
  renderNow()
}

// Template selection
const onSelectTemplate = async (template: DiagramTemplate) => {
  startRenderWait()
  code.value = template.code
  if (activeProjectId.value) {
    updateProjectCode(activeProjectId.value, template.code)
  }
  await renderNow()
  fitTrigger.value++
  showToast(`Template "${template.name}" berhasil diterapkan`)
}

// Project selection from sidebar
const onProjectSelected = async (project: Project) => {
  startRenderWait()
  code.value = project.code
  isSidebarOpen.value = false
  await renderNow()
  fitTrigger.value++
  showToast(`Membuka proyek "${project.name}"`)
}

// Export actions
const onExport = (type: 'svg' | 'png' | 'puml') => {
  const projName = activeProject.value?.name || 'diagram'
  if (type === 'svg') {
    downloadSvg(projName)
    showToast('Mengunduh diagram SVG...')
  } else if (type === 'png') {
    downloadPng(projName)
    showToast('Mengunduh diagram PNG...')
  } else if (type === 'puml') {
    downloadPuml(projName)
    showToast('Mengunduh sumber .puml...')
  }
}

// Copy actions
const onCopy = async (type: 'shareLink' | 'imageUrl' | 'code') => {
  if (type === 'shareLink') {
    const shareUrl = getShareUrl()
    const ok = await copyToClipboard(shareUrl)
    if (ok) showToast('Link berbagi disalin ke papan klip!')
  } else if (type === 'imageUrl') {
    if (directUrl.value) {
      const ok = await copyToClipboard(directUrl.value)
      if (ok) showToast('URL gambar PlantUML disalin!')
    } else {
      showToast('URL gambar belum tersedia')
    }
  } else if (type === 'code') {
    const ok = await copyToClipboard(code.value)
    if (ok) showToast('Kode PlantUML disalin!')
  }
}

// Auto-fit preview when mobile tab switches to preview
watch(mobileTab, (tab) => {
  if (tab === 'preview') {
    nextTick(() => {
      fitTrigger.value++
    })
  }
})

// Lifecycle: mount, read URL hash, initialize projects & render
onMounted(async () => {
  checkResponsive()
  window.addEventListener('resize', checkResponsive)

  // 1. Check if URL hash contains shared code: #code=... or #...
  let initialCode = ''
  if (window.location.hash) {
    try {
      const hashStr = window.location.hash.substring(1)
      const encParam = hashStr.startsWith('code=') ? hashStr.replace('code=', '') : hashStr
      if (encParam) {
        initialCode = plantumlEncoder.decode(encParam)
        if (initialCode) {
          showToast('Diagram dimuat dari link berbagi!')
        }
      }
    } catch (e) {
      console.warn('Gagal membaca kode dari URL hash:', e)
    }
  }

  // 2. Initialize projects in localStorage
  initProjects(initialCode)

  // 3. Load active project into editor
  if (initialCode) {
    code.value = initialCode
  } else if (activeProject.value) {
    code.value = activeProject.value.code
  }

  // 4. Initial Render & auto-fit to screen
  startRenderWait()
  await nextTick()
  await renderNow()
  fitTrigger.value++
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkResponsive)
    window.removeEventListener('mousemove', onResize)
    window.removeEventListener('mouseup', endResize)
  }
})
</script>
