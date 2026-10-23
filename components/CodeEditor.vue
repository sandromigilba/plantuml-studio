<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
    <!-- Editor Header Toolbar -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-100/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 select-none">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {{ lineCount }} baris
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Copy code button -->
        <button
          type="button"
          @click="handleCopy"
          class="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Salin kode ke papan klip"
          aria-label="Salin kode"
        >
          <svg v-if="copied" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <!-- Manual Render button -->
        <button
          type="button"
          @click="emit('render')"
          :disabled="isLoading"
          class="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
          title="Render diagram (Ctrl + Enter)"
          aria-label="Render diagram sekarang"
        >
          <svg v-if="isLoading" class="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ isLoading ? 'Merender...' : 'Render' }}</span>
        </button>
      </div>
    </div>

    <!-- CodeMirror Editor Mount Point -->
    <div ref="editorContainer" class="flex-1 w-full overflow-hidden text-sm font-mono"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { EditorState, Compartment } from '@codemirror/state'
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, undo as cmUndo, redo as cmRedo } from '@codemirror/commands'
import { StreamLanguage, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  modelValue: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'render'): void
  (e: 'change', value: string): void
}>()

const editorContainer = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null
const themeCompartment = new Compartment()
const { isDark } = useTheme()

const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const lineCount = computed(() => {
  return (props.modelValue || '').split('\n').length
})

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.modelValue)
    copied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Gagal menyalin kode:', e)
  }
}

// PlantUML syntax definition using CodeMirror 6 StreamLanguage
const plantumlLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null

    // Single-line comment: '
    if (stream.match(/^'.*$/)) return 'comment'

    // Multi-line comment: /' ... '/
    if (stream.match(/^\/'[\s\S]*?'\//)) return 'comment'

    // Strings: "..."
    if (stream.match(/^"(?:[^"\\]|\\.)*"/)) return 'string'

    // Preprocessor and tags: @startuml, @enduml, !define, skinparam, autonumber
    if (stream.match(/^(@[a-zA-Z0-9_]+|![a-zA-Z0-9_]+)/)) return 'keyword'

    // Arrow operators
    if (stream.match(/^(-->|->|<--|<-|<\|--|--\|>|\*--|--\*|o--|--o|\.\.>|<\.\.|\|\|--o\{|\|\|--\|\{|\}\|--\|\{|==|\.\.)/)) {
      return 'operator'
    }

    // Common PlantUML keywords
    const keywords = /^(actor|participant|boundary|control|entity|database|collections|queue|class|interface|enum|abstract|package|node|folder|frame|cloud|usecase|rectangle|state|alt|else|opt|loop|par|break|critical|group|end|note|activate|deactivate|return|start|stop|if|then|elseif|endif|fork|again|repeat|while|is|skinparam|title|header|footer|legend|as|implements|extends|autonumber)\b/i
    if (stream.match(keywords)) return 'keyword'

    // Stereotypes: << ... >>
    if (stream.match(/^<<[^>]+>>/)) return 'typeName'

    stream.next()
    return null
  }
})

// Custom Light Theme for CodeMirror 6
const lightTheme = EditorView.theme({
  '&': {
    color: '#0f172a',
    backgroundColor: '#ffffff',
    height: '100%',
  },
  '.cm-content': {
    caretColor: '#0e8ce9',
    fontFamily: '"Roboto Mono", Roboto, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    padding: '8px 0',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#0e8ce9',
    borderLeftWidth: '2px',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    borderRight: '1px solid #e2e8f0',
  },
  '.cm-activeLine': {
    backgroundColor: '#f1f5f9',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e2e8f0',
    color: '#334155',
  },
}, { dark: false })

// Custom Dark Theme extension adjustments
const customDarkTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#090d16',
  },
  '.cm-content': {
    fontFamily: '"Roboto Mono", Roboto, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    padding: '8px 0',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1322',
    color: '#64748b',
    borderRight: '1px solid #1e293b',
  },
  '.cm-activeLine': {
    backgroundColor: '#131b2e',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
  },
}, { dark: true })

onMounted(() => {
  if (!editorContainer.value) return

  // Shortcut for Ctrl+Enter / Cmd+Enter
  const renderKeymap = [
    {
      key: 'Mod-Enter',
      run: () => {
        emit('render')
        return true
      },
    },
  ]

  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      plantumlLanguage,
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      themeCompartment.of(isDark.value ? [oneDark, customDarkTheme] : lightTheme),
      keymap.of([...renderKeymap, ...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newDoc = update.state.doc.toString()
          emit('update:modelValue', newDoc)
          emit('change', newDoc)
        }
      }),
    ],
  })

  editorView = new EditorView({
    state: startState,
    parent: editorContainer.value,
  })
})

// Keep editor content in sync if modelValue changed externally (e.g. from template or project switch)
watch(() => props.modelValue, (newVal) => {
  if (editorView) {
    const currentDoc = editorView.state.doc.toString()
    if (newVal !== currentDoc) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: newVal || '',
        },
      })
    }
  }
})

// Reconfigure theme when light/dark changes
watch(isDark, (dark) => {
  if (editorView) {
    editorView.dispatch({
      effects: themeCompartment.reconfigure(dark ? [oneDark, customDarkTheme] : lightTheme),
    })
  }
})

const undoCode = () => {
  if (editorView) {
    cmUndo(editorView)
  }
}

const redoCode = () => {
  if (editorView) {
    cmRedo(editorView)
  }
}

defineExpose({
  undo: undoCode,
  redo: redoCode,
})

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
  if (copyTimeout) {
    clearTimeout(copyTimeout)
  }
})
</script>

<style>
/* Ensure CodeMirror occupies full height */
.cm-editor {
  height: 100% !important;
}
.cm-scroller {
  overflow: auto;
  font-size: 13.5px;
  line-height: 1.6;
}
</style>
