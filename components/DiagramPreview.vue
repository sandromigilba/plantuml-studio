<template>
  <div class="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative select-none">
    <!-- Preview Header Controls -->
    <div class="flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10 backdrop-blur-sm">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Preview</span>

        <!-- Loading indicator: icon only -->
        <svg v-if="isLoading" class="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" title="Memuat...">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Zoom, Pan & Object Controls -->
      <div class="flex items-center space-x-1">
        <!-- Undo Button -->
        <button
          type="button"
          @click="handleUndo"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Urungkan (Undo)"
          aria-label="Urungkan (Undo)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v6h6" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
        </button>

        <!-- Redo Button -->
        <button
          type="button"
          @click="handleRedo"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Ulangi (Redo)"
          aria-label="Ulangi (Redo)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7v6h-6" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
        </button>

        <!-- Zoom Out -->
        <button
          type="button"
          @click="zoomOut"
          :disabled="zoom <= 0.2"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-30 transition-colors"
          title="Perkecil (-)"
          aria-label="Perkecil"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>

        <!-- Current Zoom Percentage -->
        <button
          type="button"
          @click="resetZoom"
          class="px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md min-w-[52px] text-center transition-colors"
          title="Klik untuk reset zoom (100%)"
        >
          {{ Math.round(zoom * 100) }}%
        </button>

        <!-- Zoom In -->
        <button
          type="button"
          @click="zoomIn"
          :disabled="zoom >= 5.0"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-30 transition-colors"
          title="Perbesar (+)"
          aria-label="Perbesar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <!-- Fit to Screen -->
        <button
          type="button"
          @click="fitToScreen"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Sesuaikan ke Layar (Fit to Screen)"
          aria-label="Sesuaikan ke Layar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <!-- Direct Server Link -->
        <a
          v-if="directUrl"
          :href="directUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Buka gambar langsung di tab baru"
          aria-label="Buka gambar di tab baru"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>

    <!-- Canvas Viewport for Pan, Zoom & Object Dragging -->
    <div
      ref="viewportRef"
      @mousedown="handleMouseDown"
      @wheel.prevent="handleWheel"
      @touchstart.passive="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
      :class="[
        'flex-1 w-full h-full overflow-hidden relative flex items-center justify-center p-6 touch-none',
        isPanning ? 'cursor-grabbing' : 'cursor-grab',
        'bg-dots-pattern'
      ]"
    >
      <!-- Empty State -->
      <div
        v-if="!renderedData && !isLoading"
        class="text-center p-8 max-w-sm mx-auto text-slate-400 dark:text-slate-500"
      >
        <svg class="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm font-medium">Belum ada diagram yang dirender</p>
        <p class="text-xs mt-1">Tulis kode PlantUML di editor atau pilih salah satu template contoh di atas.</p>
      </div>

      <!-- Rendered Diagram Container (Pan & Zoom Transformed) -->
      <div
        ref="contentRef"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning || isResizingPaper ? 'none' : 'transform 0.08s ease-out',
        }"
        class="max-w-none transition-shadow duration-300"
      >
        <!-- SVG Render on Resizable White Paper Background -->
        <div
          v-if="format === 'svg' && renderedData"
          ref="paperRef"
          :style="{
            width: paperWidth ? `${paperWidth}px` : 'auto',
            height: paperHeight ? `${paperHeight}px` : 'auto',
            minWidth: '80px',
            minHeight: '60px',
          }"
          class="diagram-svg-container relative shadow-xl rounded-lg bg-white p-6 border border-slate-200 dark:border-slate-800 transition-shadow select-none group overflow-hidden flex items-center justify-center"
        >
          <div
            :style="{
              transform: (contentShiftX || contentShiftY) ? `translate(${contentShiftX}px, ${contentShiftY}px)` : 'none',
              transition: isResizingPaper ? 'none' : 'transform 0.08s ease-out'
            }"
            v-html="renderedData"
            class="w-full h-full flex items-center justify-center overflow-visible pointer-events-auto"
          ></div>

          <!-- Top Resize Handle (Atas) -->
          <div
            @mousedown.stop.prevent="startPaperResize($event, 'top')"
            @touchstart.stop.passive="startPaperTouchResize($event, 'top')"
            @dblclick.stop="resetPaperSize"
            class="absolute top-0 left-3 right-3 h-3 cursor-ns-resize flex items-start justify-center group/top z-20"
            title="Tarik sisi atas untuk mengurangi/menambah batas kertas (Klik ganda untuk reset)"
          >
            <div class="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover/top:bg-brand-500 transition-colors mt-0.5 opacity-60 group-hover/top:opacity-100"></div>
          </div>

          <!-- Bottom Resize Handle (Bawah) -->
          <div
            @mousedown.stop.prevent="startPaperResize($event, 'bottom')"
            @touchstart.stop.passive="startPaperTouchResize($event, 'bottom')"
            @dblclick.stop="resetPaperSize"
            class="absolute bottom-0 left-3 right-3 h-3 cursor-ns-resize flex items-end justify-center group/bottom z-20"
            title="Tarik sisi bawah untuk mengurangi/menambah batas kertas (Klik ganda untuk reset)"
          >
            <div class="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover/bottom:bg-brand-500 transition-colors mb-0.5 opacity-60 group-hover/bottom:opacity-100"></div>
          </div>

          <!-- Left Resize Handle (Kiri) -->
          <div
            @mousedown.stop.prevent="startPaperResize($event, 'left')"
            @touchstart.stop.passive="startPaperTouchResize($event, 'left')"
            @dblclick.stop="resetPaperSize"
            class="absolute left-0 top-3 bottom-3 w-3 cursor-ew-resize flex items-center justify-start group/left z-20"
            title="Tarik sisi kiri untuk mengurangi/menambah batas kertas (Klik ganda untuk reset)"
          >
            <div class="h-12 w-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover/left:bg-brand-500 transition-colors ml-0.5 opacity-60 group-hover/left:opacity-100"></div>
          </div>

          <!-- Right Resize Handle (Kanan) -->
          <div
            @mousedown.stop.prevent="startPaperResize($event, 'right')"
            @touchstart.stop.passive="startPaperTouchResize($event, 'right')"
            @dblclick.stop="resetPaperSize"
            class="absolute right-0 top-3 bottom-3 w-3 cursor-ew-resize flex items-center justify-end group/right z-20"
            title="Tarik sisi kanan untuk mengurangi/menambah batas kertas (Klik ganda untuk reset)"
          >
            <div class="h-12 w-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover/right:bg-brand-500 transition-colors mr-0.5 opacity-60 group-hover/right:opacity-100"></div>
          </div>

          <!-- Bottom-Right Corner Handle (Sudut) -->
          <div
            @mousedown.stop.prevent="startPaperResize($event, 'se')"
            @touchstart.stop.passive="startPaperTouchResize($event, 'se')"
            @dblclick.stop="resetPaperSize"
            class="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 text-slate-400 hover:text-brand-600 active:text-brand-700 transition-colors z-20"
            title="Tarik sudut untuk mengubah ukuran bebas (Klik ganda untuk reset)"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="19" cy="19" r="1.8" />
              <circle cx="14" cy="19" r="1.8" />
              <circle cx="19" cy="14" r="1.8" />
              <circle cx="9" cy="19" r="1.8" />
              <circle cx="14" cy="14" r="1.8" />
              <circle cx="19" cy="9" r="1.8" />
            </svg>
          </div>
        </div>

        <!-- PNG Render -->
        <img
          v-else-if="format === 'png' && renderedData"
          :src="renderedData"
          @load="onImgLoad"
          @error="onImgError"
          alt="Hasil Render PlantUML"
          class="shadow-xl rounded-lg bg-white p-4 max-w-none border border-slate-200 dark:border-slate-800"
        />
      </div>

      <!-- Quick Hint Overlay in Bottom Corner -->
      <div class="absolute bottom-3 right-3 text-[11px] text-slate-400 dark:text-slate-500 bg-white/70 dark:bg-slate-900/70 px-2 py-1 rounded backdrop-blur border border-slate-200/50 dark:border-slate-800/50 pointer-events-none">
        Scroll: Zoom • Drag Objek: Pindahkan • Drag Kanvas: Geser
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { DiagramFormat } from '~/composables/usePlantUml'

const props = defineProps<{
  renderedData: string
  format: DiagramFormat
  isLoading?: boolean
  isError?: boolean
  isSyntaxError?: boolean
  errorMessage?: string | null
  directUrl?: string
  fitTrigger?: number
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'rendered'): void
  (e: 'undo'): void
  (e: 'redo'): void
}>()

const viewportRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

// Pan & Zoom states
const zoom = ref(1.0)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const startCoords = { x: 0, y: 0 }

// Object dragging states & history (Undo/Redo)
interface DragHistoryEntry {
  el: SVGGraphicsElement
  baseTransform: string
  oldDx: number
  oldDy: number
  newDx: number
  newDy: number
}

const undoStack = ref<DragHistoryEntry[]>([])
const redoStack = ref<DragHistoryEntry[]>([])

let activeDragEl: SVGGraphicsElement | null = null
let dragStartCoords = { x: 0, y: 0 }
let initialTransform = { dx: 0, dy: 0 }
let dragStartDx = 0
let dragStartDy = 0
let baseTransform = ''

const pushDragHistory = (entry: DragHistoryEntry) => {
  undoStack.value.push(entry)
  redoStack.value = []
}

const applyElementPosition = (el: SVGGraphicsElement, base: string, dx: number, dy: number) => {
  if (!el || !el.isConnected) return
  if (dx === 0 && dy === 0) {
    if (base) {
      el.setAttribute('transform', base)
    } else {
      el.removeAttribute('transform')
    }
    el.removeAttribute('data-dx')
    el.removeAttribute('data-dy')
  } else {
    el.setAttribute('data-dx', dx.toString())
    el.setAttribute('data-dy', dy.toString())
    el.setAttribute('transform', `${base} translate(${dx}, ${dy})`.trim())
  }

  const svg = el.closest('svg')
  if (svg) {
    updateConnectedLinks(svg, el)
  }
}

const handleUndo = () => {
  if (undoStack.value.length > 0) {
    const entry = undoStack.value.pop()!
    applyElementPosition(entry.el, entry.baseTransform, entry.oldDx, entry.oldDy)
    redoStack.value.push(entry)
  } else {
    emit('undo')
  }
}

const handleRedo = () => {
  if (redoStack.value.length > 0) {
    const entry = redoStack.value.pop()!
    applyElementPosition(entry.el, entry.baseTransform, entry.newDx, entry.newDy)
    undoStack.value.push(entry)
  } else {
    emit('redo')
  }
}

// Paper resize states (Top, Right, Bottom, Left, SE corner)
type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'se'

const paperRef = ref<HTMLDivElement | null>(null)
const paperWidth = ref<number | null>(null)
const paperHeight = ref<number | null>(null)
const contentShiftX = ref<number>(0)
const contentShiftY = ref<number>(0)

let isResizingPaper = false
let currentResizeEdge: ResizeEdge = 'se'
let resizeStartX = 0
let resizeStartY = 0
let initialPaperW = 0
let initialPaperH = 0
let initialShiftX = 0
let initialShiftY = 0
let initialPanX = 0
let initialPanY = 0

const startPaperResize = (e: MouseEvent, edge: ResizeEdge = 'se') => {
  if (e.button !== 0 || !paperRef.value) return
  isResizingPaper = true
  currentResizeEdge = edge
  resizeStartX = e.clientX
  resizeStartY = e.clientY

  const rect = paperRef.value.getBoundingClientRect()
  initialPaperW = rect.width / zoom.value
  initialPaperH = rect.height / zoom.value
  initialShiftX = contentShiftX.value
  initialShiftY = contentShiftY.value
  initialPanX = panX.value
  initialPanY = panY.value

  paperWidth.value = Math.round(initialPaperW)
  paperHeight.value = Math.round(initialPaperH)

  window.addEventListener('mousemove', onPaperResize)
  window.addEventListener('mouseup', endPaperResize)
}

const onPaperResize = (e: MouseEvent) => {
  if (!isResizingPaper) return
  const deltaX = (e.clientX - resizeStartX) / zoom.value
  const deltaY = (e.clientY - resizeStartY) / zoom.value
  applyResizeDelta(deltaX, deltaY)
}

const startPaperTouchResize = (e: TouchEvent, edge: ResizeEdge = 'se') => {
  if (e.touches.length !== 1 || !paperRef.value) return
  isResizingPaper = true
  currentResizeEdge = edge
  const touch = e.touches[0]
  resizeStartX = touch.clientX
  resizeStartY = touch.clientY

  const rect = paperRef.value.getBoundingClientRect()
  initialPaperW = rect.width / zoom.value
  initialPaperH = rect.height / zoom.value
  initialShiftX = contentShiftX.value
  initialShiftY = contentShiftY.value
  initialPanX = panX.value
  initialPanY = panY.value

  paperWidth.value = Math.round(initialPaperW)
  paperHeight.value = Math.round(initialPaperH)

  window.addEventListener('touchmove', onPaperTouchResize)
  window.addEventListener('touchend', endPaperTouchResize)
}

const onPaperTouchResize = (e: TouchEvent) => {
  if (!isResizingPaper || e.touches.length !== 1) return
  const touch = e.touches[0]
  const deltaX = (touch.clientX - resizeStartX) / zoom.value
  const deltaY = (touch.clientY - resizeStartY) / zoom.value
  applyResizeDelta(deltaX, deltaY)
}

const applyResizeDelta = (deltaX: number, deltaY: number) => {
  const minW = 80
  const minH = 60

  if (currentResizeEdge === 'right') {
    const newW = Math.max(minW, Math.round(initialPaperW + deltaX))
    const actualDeltaW = newW - initialPaperW
    paperWidth.value = newW
    panX.value = Number((initialPanX + actualDeltaW / 2).toFixed(2))
    contentShiftX.value = Number((initialShiftX - actualDeltaW / 2).toFixed(2))
  } else if (currentResizeEdge === 'left') {
    const newW = Math.max(minW, Math.round(initialPaperW - deltaX))
    const actualDeltaW = newW - initialPaperW
    paperWidth.value = newW
    panX.value = Number((initialPanX - actualDeltaW / 2).toFixed(2))
    contentShiftX.value = Number((initialShiftX + actualDeltaW / 2).toFixed(2))
  } else if (currentResizeEdge === 'bottom') {
    const newH = Math.max(minH, Math.round(initialPaperH + deltaY))
    const actualDeltaH = newH - initialPaperH
    paperHeight.value = newH
    panY.value = Number((initialPanY + actualDeltaH / 2).toFixed(2))
    contentShiftY.value = Number((initialShiftY - actualDeltaH / 2).toFixed(2))
  } else if (currentResizeEdge === 'top') {
    const newH = Math.max(minH, Math.round(initialPaperH - deltaY))
    const actualDeltaH = newH - initialPaperH
    paperHeight.value = newH
    panY.value = Number((initialPanY - actualDeltaH / 2).toFixed(2))
    contentShiftY.value = Number((initialShiftY + actualDeltaH / 2).toFixed(2))
  } else if (currentResizeEdge === 'se') {
    const newW = Math.max(minW, Math.round(initialPaperW + deltaX))
    const newH = Math.max(minH, Math.round(initialPaperH + deltaY))
    const actualDeltaW = newW - initialPaperW
    const actualDeltaH = newH - initialPaperH
    paperWidth.value = newW
    paperHeight.value = newH
    panX.value = Number((initialPanX + actualDeltaW / 2).toFixed(2))
    panY.value = Number((initialPanY + actualDeltaH / 2).toFixed(2))
    contentShiftX.value = Number((initialShiftX - actualDeltaW / 2).toFixed(2))
    contentShiftY.value = Number((initialShiftY - actualDeltaH / 2).toFixed(2))
  }
}

const endPaperResize = () => {
  isResizingPaper = false
  window.removeEventListener('mousemove', onPaperResize)
  window.removeEventListener('mouseup', endPaperResize)
}

const endPaperTouchResize = () => {
  isResizingPaper = false
  window.removeEventListener('touchmove', onPaperTouchResize)
  window.removeEventListener('touchend', endPaperTouchResize)
}

const resetPaperSize = () => {
  paperWidth.value = null
  paperHeight.value = null
  contentShiftX.value = 0
  contentShiftY.value = 0
}

const zoomIn = () => {
  zoom.value = Math.min(5.0, Number((zoom.value + 0.15).toFixed(2)))
}

const zoomOut = () => {
  zoom.value = Math.max(0.2, Number((zoom.value - 0.15).toFixed(2)))
}

const resetZoom = () => {
  zoom.value = 1.0
  panX.value = 0
  panY.value = 0
}

const fitToScreen = () => {
  if (!viewportRef.value || !contentRef.value) return

  const vpRect = viewportRef.value.getBoundingClientRect()
  if (vpRect.width <= 0 || vpRect.height <= 0) return

  const contentEl = contentRef.value.firstElementChild as HTMLElement | null

  if (!contentEl) {
    resetZoom()
    return
  }

  // Get SVG or image dimensions
  let contentWidth = contentEl.scrollWidth || contentEl.clientWidth || 0
  let contentHeight = contentEl.scrollHeight || contentEl.clientHeight || 0

  const svgEl = contentEl.querySelector('svg')
  if (svgEl) {
    let naturalSvgWidth = 0
    let naturalSvgHeight = 0

    if (svgEl.viewBox && svgEl.viewBox.baseVal && svgEl.viewBox.baseVal.width > 0) {
      naturalSvgWidth = svgEl.viewBox.baseVal.width
      naturalSvgHeight = svgEl.viewBox.baseVal.height
    } else {
      const wAttr = parseFloat(svgEl.getAttribute('width') || '0')
      const hAttr = parseFloat(svgEl.getAttribute('height') || '0')
      if (wAttr > 0 && hAttr > 0) {
        naturalSvgWidth = wAttr
        naturalSvgHeight = hAttr
      }
    }

    if (naturalSvgWidth > 0 && naturalSvgHeight > 0) {
      // Add paper padding: p-6 = 24px each side = 48px total
      const totalPaperW = naturalSvgWidth + 48
      const totalPaperH = naturalSvgHeight + 48
      contentWidth = Math.max(contentWidth, totalPaperW)
      contentHeight = Math.max(contentHeight, totalPaperH)
    }
  } else {
    const imgEl = contentEl.tagName === 'IMG' ? (contentEl as HTMLImageElement) : contentEl.querySelector('img')
    if (imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
      contentWidth = Math.max(contentWidth, imgEl.naturalWidth + 32)
      contentHeight = Math.max(contentHeight, imgEl.naturalHeight + 32)
    }
  }

  if (contentWidth <= 0 || contentHeight <= 0) {
    requestAnimationFrame(() => {
      const el = contentRef.value?.firstElementChild as HTMLElement | null
      if (el && (el.scrollWidth > 0 || el.clientWidth > 0)) {
        fitToScreen()
      }
    })
    return
  }

  const padding = 80 // px buffer
  const availWidth = Math.max(100, vpRect.width - padding)
  const availHeight = Math.max(100, vpRect.height - padding)

  if (contentWidth > 0 && contentHeight > 0) {
    const scaleX = availWidth / contentWidth
    const scaleY = availHeight / contentHeight
    const targetScale = Math.min(scaleX, scaleY, 1.25)
    zoom.value = Math.max(0.2, Number(targetScale.toFixed(2)))
    panX.value = 0
    panY.value = 0
  } else {
    resetZoom()
  }
}

const resetAndFitToScreen = () => {
  resetPaperSize()
  resetObjectPositions()
  nextTick(() => {
    requestAnimationFrame(() => {
      fitToScreen()
      requestAnimationFrame(() => {
        emit('rendered')
      })
    })
  })
}

// Mouse wheel zoom
const handleWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(5.0, Math.max(0.2, Number((zoom.value + delta).toFixed(2))))
  zoom.value = newZoom
}

// Draggable object identification
const findDraggableTarget = (target: Element): SVGGraphicsElement | null => {
  if (!target || target.tagName === 'svg' || target.classList.contains('diagram-svg-container')) {
    return null
  }

  // Check if inside an element already marked .draggable-object
  const marked = target.closest('.draggable-object')
  if (marked && marked instanceof SVGGraphicsElement) {
    return marked
  }

  // Check if inside an entity, cluster, or semantic group
  const entityGroup = target.closest('g.entity, g.cluster, g[id^="ent"], g[id^="elem"], g[data-qualified-name]')
  if (entityGroup && entityGroup instanceof SVGGraphicsElement) {
    return entityGroup
  }

  // Check if inside a direct child group of the main SVG container
  const childGroup = target.closest('svg > g > g')
  if (childGroup && childGroup instanceof SVGGraphicsElement) {
    return childGroup
  }

  // Check if direct child of main SVG container
  const mainG = target.closest('svg > g')
  if (mainG && target.parentElement === mainG && target instanceof SVGGraphicsElement) {
    return target
  }

  return null
}

// Start dragging an individual SVG object
const startObjectDrag = (el: SVGGraphicsElement, e: MouseEvent) => {
  activeDragEl = el
  el.classList.add('is-dragging')

  dragStartCoords.x = e.clientX
  dragStartCoords.y = e.clientY

  initialTransform.dx = parseFloat(el.getAttribute('data-dx') || '0')
  initialTransform.dy = parseFloat(el.getAttribute('data-dy') || '0')
  dragStartDx = initialTransform.dx
  dragStartDy = initialTransform.dy

  if (!el.hasAttribute('data-base-transform')) {
    const rawTransform = el.getAttribute('transform') || ''
    el.setAttribute('data-base-transform', rawTransform)
    baseTransform = rawTransform
  } else {
    baseTransform = el.getAttribute('data-base-transform') || ''
  }

  window.addEventListener('mousemove', onObjectDrag)
  window.addEventListener('mouseup', endObjectDrag)
}

const onObjectDrag = (e: MouseEvent) => {
  if (!activeDragEl) return

  const deltaX = (e.clientX - dragStartCoords.x) / zoom.value
  const deltaY = (e.clientY - dragStartCoords.y) / zoom.value

  const newDx = initialTransform.dx + deltaX
  const newDy = initialTransform.dy + deltaY

  activeDragEl.setAttribute('data-dx', newDx.toString())
  activeDragEl.setAttribute('data-dy', newDy.toString())
  activeDragEl.setAttribute('transform', `${baseTransform} translate(${newDx}, ${newDy})`.trim())

  // Update connected lines & arrowheads
  const svg = activeDragEl.closest('svg')
  if (svg) {
    updateConnectedLinks(svg, activeDragEl)
  }
}

const endObjectDrag = () => {
  if (activeDragEl) {
    const finalDx = parseFloat(activeDragEl.getAttribute('data-dx') || '0')
    const finalDy = parseFloat(activeDragEl.getAttribute('data-dy') || '0')

    if (Math.abs(finalDx - dragStartDx) > 0.5 || Math.abs(finalDy - dragStartDy) > 0.5) {
      pushDragHistory({
        el: activeDragEl,
        baseTransform: baseTransform,
        oldDx: dragStartDx,
        oldDy: dragStartDy,
        newDx: finalDx,
        newDy: finalDy,
      })
    }

    activeDragEl.classList.remove('is-dragging')
    activeDragEl = null
  }
  window.removeEventListener('mousemove', onObjectDrag)
  window.removeEventListener('mouseup', endObjectDrag)
}

// Update all connector lines and arrowheads linked to the dragged entity
const updateConnectedLinks = (svg: SVGSVGElement, entEl: SVGGraphicsElement) => {
  const entId = entEl.id
  if (!entId) return

  // Query all link groups connected to this entity
  const links = svg.querySelectorAll<SVGGElement>(
    `g.link[data-entity-1="${entId}"], g.link[data-entity-2="${entId}"]`
  )

  links.forEach((link) => {
    const ent1Id = link.getAttribute('data-entity-1') || ''
    const ent2Id = link.getAttribute('data-entity-2') || ''

    const ent1 = svg.getElementById(ent1Id) as SVGGraphicsElement | null
    const ent2 = svg.getElementById(ent2Id) as SVGGraphicsElement | null

    const dx1 = parseFloat(ent1?.getAttribute('data-dx') || '0')
    const dy1 = parseFloat(ent1?.getAttribute('data-dy') || '0')
    const dx2 = parseFloat(ent2?.getAttribute('data-dx') || '0')
    const dy2 = parseFloat(ent2?.getAttribute('data-dy') || '0')

    // 1. Update <path> curve
    const path = link.querySelector('path')
    if (path) {
      if (!path.hasAttribute('data-orig-d')) {
        path.setAttribute('data-orig-d', path.getAttribute('d') || '')
      }
      const origD = path.getAttribute('data-orig-d') || ''
      const coords = origD.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || []
      const numPairs = coords.length / 2

      if (numPairs > 0) {
        let idx = 0
        const newD = origD.replace(/[-+]?[0-9]*\.?[0-9]+/g, () => {
          const i = Math.floor(idx / 2)
          const isX = idx % 2 === 0
          const t = numPairs > 1 ? i / (numPairs - 1) : 0
          const origVal = coords[idx]
          const delta = isX ? (1 - t) * dx1 + t * dx2 : (1 - t) * dy1 + t * dy2
          idx++
          return Number((origVal + delta).toFixed(2)).toString()
        })
        path.setAttribute('d', newD)

        // 2. Update <polygon> (arrowhead / endpoint marker)
        const polygons = link.querySelectorAll('polygon')
        polygons.forEach((polygon) => {
          if (!polygon.hasAttribute('data-orig-points')) {
            polygon.setAttribute('data-orig-points', polygon.getAttribute('points') || '')
          }
          const origPoints = polygon.getAttribute('data-orig-points') || ''
          const polyCoords = origPoints.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || []
          if (polyCoords.length >= 2) {
            const polyX = polyCoords[0]
            const polyY = polyCoords[1]
            const distToStart = Math.hypot(polyX - coords[0], polyY - coords[1])
            const distToEnd = Math.hypot(polyX - coords[coords.length - 2], polyY - coords[coords.length - 1])
            const isAtEnd = distToEnd <= distToStart
            const pDx = isAtEnd ? dx2 : dx1
            const pDy = isAtEnd ? dy2 : dy1

            let pIdx = 0
            const newPoints = origPoints.replace(/[-+]?[0-9]*\.?[0-9]+/g, () => {
              const isX = pIdx % 2 === 0
              const origVal = polyCoords[pIdx]
              const delta = isX ? pDx : pDy
              pIdx++
              return Number((origVal + delta).toFixed(2)).toString()
            })
            polygon.setAttribute('points', newPoints)
          }
        })
      }
    }

    // 3. Update <text> (line label)
    const text = link.querySelector('text')
    if (text) {
      if (!text.hasAttribute('data-orig-x')) {
        text.setAttribute('data-orig-x', text.getAttribute('x') || '0')
        text.setAttribute('data-orig-y', text.getAttribute('y') || '0')
      }
      const origX = parseFloat(text.getAttribute('data-orig-x') || '0')
      const origY = parseFloat(text.getAttribute('data-orig-y') || '0')
      text.setAttribute('x', (origX + (dx1 + dx2) / 2).toFixed(2))
      text.setAttribute('y', (origY + (dy1 + dy2) / 2).toFixed(2))
    }
  })
}

// Reset all dragged object positions
const resetObjectPositions = () => {
  undoStack.value = []
  redoStack.value = []
  if (!contentRef.value) return
  const dragged = contentRef.value.querySelectorAll('[data-dx]')
  dragged.forEach((item) => {
    const el = item as SVGGraphicsElement
    const base = el.getAttribute('data-base-transform') || ''
    if (base) {
      el.setAttribute('transform', base)
    } else {
      el.removeAttribute('transform')
    }
    el.removeAttribute('data-dx')
    el.removeAttribute('data-dy')
    el.removeAttribute('data-base-transform')
  })

  // Reset connected paths
  const paths = contentRef.value.querySelectorAll('path[data-orig-d]')
  paths.forEach((p) => {
    p.setAttribute('d', p.getAttribute('data-orig-d') || '')
    p.removeAttribute('data-orig-d')
  })

  // Reset polygons
  const polygons = contentRef.value.querySelectorAll('polygon[data-orig-points]')
  polygons.forEach((poly) => {
    poly.setAttribute('points', poly.getAttribute('data-orig-points') || '')
    poly.removeAttribute('data-orig-points')
  })

  // Reset texts
  const texts = contentRef.value.querySelectorAll('text[data-orig-x]')
  texts.forEach((txt) => {
    txt.setAttribute('x', txt.getAttribute('data-orig-x') || '')
    txt.setAttribute('y', txt.getAttribute('data-orig-y') || '')
    txt.removeAttribute('data-orig-x')
    txt.removeAttribute('data-orig-y')
  })
}

// Initialize draggable classes in rendered SVG
const initDraggableObjects = () => {
  if (!contentRef.value) return
  const svg = contentRef.value.querySelector('svg')
  if (!svg) return

  // Mark all semantic groups
  const entities = svg.querySelectorAll('g.entity, g.cluster, g[id^="ent"], g[id^="elem"], g[data-qualified-name]')
  entities.forEach((el) => el.classList.add('draggable-object'))

  const mainG = svg.querySelector('svg > g')
  if (mainG) {
    const children = Array.from(mainG.children)
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.tagName === 'rect' && children[i + 1] && children[i + 1].tagName === 'text') {
        const next = children[i + 1]
        // Wrap paired rect + text (e.g. sequence participant box)
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        group.classList.add('draggable-object')
        mainG.insertBefore(group, child)
        group.appendChild(child)
        group.appendChild(next)
        i++
      } else if (child.tagName === 'g') {
        child.classList.add('draggable-object')
      }
    }
  }
}

// Unified MouseDown router: Object Drag vs Canvas Pan
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return

  const target = e.target as Element | null
  const draggableTarget = target ? findDraggableTarget(target) : null

  if (draggableTarget) {
    e.stopPropagation()
    e.preventDefault()
    startObjectDrag(draggableTarget, e)
  } else {
    startPan(e)
  }
}

// Canvas Pan Handlers
const startPan = (e: MouseEvent) => {
  isPanning.value = true
  startCoords.x = e.clientX - panX.value
  startCoords.y = e.clientY - panY.value

  window.addEventListener('mousemove', onPan)
  window.addEventListener('mouseup', endPan)
}

const onPan = (e: MouseEvent) => {
  if (!isPanning.value) return
  panX.value = e.clientX - startCoords.x
  panY.value = e.clientY - startCoords.y
}

const endPan = () => {
  isPanning.value = false
  window.removeEventListener('mousemove', onPan)
  window.removeEventListener('mouseup', endPan)
}

// Touch Event Handlers for Mobile (Pinch-to-zoom & 1-finger pan/drag)
let initialTouchDist = 0
let initialTouchZoom = 1.0

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Pinch to Zoom
    isPanning.value = false
    activeDragEl = null
    initialTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    initialTouchZoom = zoom.value
  } else if (e.touches.length === 1) {
    const touch = e.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    const draggableTarget = target ? findDraggableTarget(target) : null

    if (draggableTarget) {
      activeDragEl = draggableTarget
      draggableTarget.classList.add('is-dragging')
      dragStartCoords.x = touch.clientX
      dragStartCoords.y = touch.clientY
      initialTransform.dx = parseFloat(draggableTarget.getAttribute('data-dx') || '0')
      initialTransform.dy = parseFloat(draggableTarget.getAttribute('data-dy') || '0')
      dragStartDx = initialTransform.dx
      dragStartDy = initialTransform.dy
      if (!draggableTarget.hasAttribute('data-base-transform')) {
        const raw = draggableTarget.getAttribute('transform') || ''
        draggableTarget.setAttribute('data-base-transform', raw)
        baseTransform = raw
      } else {
        baseTransform = draggableTarget.getAttribute('data-base-transform') || ''
      }
    } else {
      isPanning.value = true
      startCoords.x = touch.clientX - panX.value
      startCoords.y = touch.clientY - panY.value
    }
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && initialTouchDist > 0) {
    // Pinch zoom
    const currentDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const scaleFactor = currentDist / initialTouchDist
    const newZoom = Math.min(5.0, Math.max(0.2, Number((initialTouchZoom * scaleFactor).toFixed(2))))
    zoom.value = newZoom
  } else if (e.touches.length === 1) {
    const touch = e.touches[0]
    if (activeDragEl) {
      const deltaX = (touch.clientX - dragStartCoords.x) / zoom.value
      const deltaY = (touch.clientY - dragStartCoords.y) / zoom.value
      const newDx = initialTransform.dx + deltaX
      const newDy = initialTransform.dy + deltaY
      activeDragEl.setAttribute('data-dx', newDx.toString())
      activeDragEl.setAttribute('data-dy', newDy.toString())
      activeDragEl.setAttribute('transform', `${baseTransform} translate(${newDx}, ${newDy})`.trim())

      const svg = activeDragEl.closest('svg')
      if (svg) {
        updateConnectedLinks(svg, activeDragEl)
      }
    } else if (isPanning.value) {
      panX.value = touch.clientX - startCoords.x
      panY.value = touch.clientY - startCoords.y
    }
  }
}

const handleTouchEnd = () => {
  if (activeDragEl) {
    const finalDx = parseFloat(activeDragEl.getAttribute('data-dx') || '0')
    const finalDy = parseFloat(activeDragEl.getAttribute('data-dy') || '0')

    if (Math.abs(finalDx - dragStartDx) > 0.5 || Math.abs(finalDy - dragStartDy) > 0.5) {
      pushDragHistory({
        el: activeDragEl,
        baseTransform: baseTransform,
        oldDx: dragStartDx,
        oldDy: dragStartDy,
        newDx: finalDx,
        newDy: finalDy,
      })
    }

    activeDragEl.classList.remove('is-dragging')
    activeDragEl = null
  }
  isPanning.value = false
  initialTouchDist = 0
}

const onImgLoad = () => {
  if (!hasAutoFittedInitial) {
    hasAutoFittedInitial = true
    fitToScreen()
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      emit('rendered')
    })
  })
}

const onImgError = () => {
  emit('rendered')
}

let hasAutoFittedInitial = false

watch(() => props.renderedData, (newData) => {
  if (!newData) {
    emit('rendered')
    return
  }

  nextTick(() => {
    initDraggableObjects()
    if (!hasAutoFittedInitial) {
      hasAutoFittedInitial = true
      requestAnimationFrame(() => {
        fitToScreen()
        requestAnimationFrame(() => {
          emit('rendered')
        })
      })
    } else if (props.format === 'svg') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emit('rendered')
        })
      })
    }
  })
})

watch(() => props.fitTrigger, () => {
  resetAndFitToScreen()
})

watch(() => props.isError, (hasErr) => {
  if (hasErr) {
    emit('rendered')
  }
})

onMounted(() => {
  nextTick(() => {
    initDraggableObjects()
    if (props.renderedData && !hasAutoFittedInitial) {
      hasAutoFittedInitial = true
      requestAnimationFrame(() => {
        fitToScreen()
        requestAnimationFrame(() => {
          emit('rendered')
        })
      })
    }
  })
})

defineExpose({
  fitToScreen,
  resetAndFitToScreen,
  resetZoom,
  resetPaperSize,
  resetObjectPositions,
  undo: handleUndo,
  redo: handleRedo,
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onPan)
  window.removeEventListener('mouseup', endPan)
  window.removeEventListener('mousemove', onObjectDrag)
  window.removeEventListener('mouseup', endObjectDrag)
  window.removeEventListener('mousemove', onPaperResize)
  window.removeEventListener('mouseup', endPaperResize)
  window.removeEventListener('touchmove', onPaperTouchResize)
  window.removeEventListener('touchend', endPaperTouchResize)
})
</script>

<style>
/* Subtle dotted canvas background */
.bg-dots-pattern {
  background-image: radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px);
  background-size: 16px 16px;
}
.dark .bg-dots-pattern {
  background-image: radial-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px);
  background-size: 16px 16px;
}

/* Ensure SVG renders cleanly */
.diagram-svg-container svg {
  display: block;
  max-width: none;
  height: auto;
  overflow: visible;
}

/* Draggable SVG objects styling */
.diagram-svg-container .draggable-object {
  cursor: grab;
  transition: filter 0.15s ease;
}

.diagram-svg-container .draggable-object:hover {
  filter: drop-shadow(0 0 5px rgba(14, 140, 233, 0.7));
}

.diagram-svg-container .draggable-object.is-dragging {
  cursor: grabbing !important;
  filter: drop-shadow(0 4px 14px rgba(14, 140, 233, 0.6)) !important;
  opacity: 0.92;
}
</style>
