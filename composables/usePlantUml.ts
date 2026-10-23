import { ref, watch } from 'vue'
import plantumlEncoder from 'plantuml-encoder'

export type DiagramFormat = 'svg' | 'png'

export interface RenderResult {
  success: boolean
  isSyntaxError?: boolean
  errorMessage?: string
  format: DiagramFormat
  data: string
  directUrl: string
  encoded: string
}

export function usePlantUml() {
  const code = ref<string>('')
  const format = ref<DiagramFormat>('svg')
  const isLoading = ref<boolean>(false)
  const isError = ref<boolean>(false)
  const isSyntaxError = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)
  const renderedData = ref<string>('')
  const directUrl = ref<string>('')
  const encodedString = ref<string>('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let currentAbortController: AbortController | null = null

  // Safely sanitize SVG using DOMPurify on client
  const sanitizeSvg = async (svgString: string): Promise<string> => {
    if (!import.meta.client) return svgString
    try {
      const DOMPurifyModule = await import('dompurify')
      const DOMPurify = DOMPurifyModule.default
      const purifier = typeof DOMPurify === 'function' && !(DOMPurify as any).sanitize
        ? (DOMPurify as any)(window)
        : DOMPurify

      return purifier.sanitize(svgString, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        ADD_ATTR: ['target', 'xlink:href', 'href'],
      })
    } catch (e) {
      console.warn('DOMPurify sanitization fallback:', e)
      return svgString
    }
  }

  // Update local encoded string and direct URL
  const updateLocalEncoded = (text: string) => {
    try {
      const trimmed = text.trim()
      if (!trimmed) {
        encodedString.value = ''
        directUrl.value = ''
        return
      }
      const enc = plantumlEncoder.encode(trimmed)
      encodedString.value = enc
      directUrl.value = `https://www.plantuml.com/plantuml/${format.value}/${enc}`
    } catch (e) {
      // Ignore encoder errors during typing
    }
  }

  // Main render logic
  const renderNow = async (forceCode?: string): Promise<void> => {
    const textToRender = forceCode !== undefined ? forceCode : code.value
    updateLocalEncoded(textToRender)

    if (!textToRender.trim()) {
      renderedData.value = ''
      isError.value = false
      isSyntaxError.value = false
      errorMessage.value = null
      isLoading.value = false
      return
    }

    // Cancel any ongoing fetch
    if (currentAbortController) {
      currentAbortController.abort()
    }
    currentAbortController = new AbortController()

    isLoading.value = true
    isError.value = false
    isSyntaxError.value = false
    errorMessage.value = null

    try {
      const response = await $fetch<RenderResult>('/api/render', {
        method: 'POST',
        body: {
          code: textToRender,
          format: format.value,
        },
        signal: currentAbortController.signal,
      })

      if (response.directUrl) {
        directUrl.value = response.directUrl
      }
      if (response.encoded) {
        encodedString.value = response.encoded
      }

      if (response.isSyntaxError) {
        isSyntaxError.value = true
        isError.value = true
        errorMessage.value = response.errorMessage || 'Terdapat kesalahan sintaks pada diagram.'
        if (response.format === 'svg' && response.data) {
          renderedData.value = await sanitizeSvg(response.data)
        }
      } else if (!response.success) {
        isError.value = true
        errorMessage.value = response.errorMessage || 'Gagal merender diagram.'
        renderedData.value = ''
      } else {
        isError.value = false
        isSyntaxError.value = false
        errorMessage.value = null

        if (response.format === 'svg') {
          renderedData.value = await sanitizeSvg(response.data)
        } else {
          // PNG base64 data URI
          renderedData.value = response.data
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Ignored aborted request
      }
      isError.value = true
      errorMessage.value = err?.data?.message || err?.message || 'Terjadi kesalahan saat memproses diagram.'
    } finally {
      isLoading.value = false
    }
  }

  // Auto-render with debounce 600 ms
  const triggerAutoRender = (delayMs = 600) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      renderNow()
    }, delayMs)
  }

  const cancelPendingRender = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // Watch format change and trigger re-render
  watch(format, () => {
    renderNow()
  })

  // Export helpers
  const downloadFile = (filename: string, content: string | Blob, mimeType: string) => {
    if (!import.meta.client) return
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPuml = (projectName = 'diagram') => {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.puml`
    downloadFile(filename, code.value, 'text/plain;charset=utf-8')
  }

  const downloadSvg = (projectName = 'diagram') => {
    if (format.value === 'svg' && renderedData.value) {
      const filename = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.svg`
      downloadFile(filename, renderedData.value, 'image/svg+xml;charset=utf-8')
    }
  }

  const downloadPng = async (projectName = 'diagram') => {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.png`
    if (format.value === 'png' && renderedData.value.startsWith('data:image/png;base64,')) {
      const base64 = renderedData.value.replace(/^data:image\/png;base64,/, '')
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      downloadFile(filename, blob, 'image/png')
    } else {
      // If currently in SVG mode, fetch PNG from server directUrl or api
      try {
        const enc = encodedString.value || plantumlEncoder.encode(code.value)
        const res = await fetch(`https://www.plantuml.com/plantuml/png/${enc}`)
        const blob = await res.blob()
        downloadFile(filename, blob, 'image/png')
      } catch (e) {
        console.error('Gagal mengunduh PNG:', e)
      }
    }
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!import.meta.client) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  }

  const getShareUrl = (): string => {
    if (!import.meta.client) return ''
    const enc = plantumlEncoder.encode(code.value)
    const url = new URL(window.location.href)
    url.hash = `code=${enc}`
    return url.toString()
  }

  return {
    code,
    format,
    isLoading,
    isError,
    isSyntaxError,
    errorMessage,
    renderedData,
    directUrl,
    encodedString,
    renderNow,
    triggerAutoRender,
    cancelPendingRender,
    downloadPuml,
    downloadSvg,
    downloadPng,
    copyToClipboard,
    getShareUrl,
  }
}
