<template>
  <div>
    <!-- Backdrop overlay for mobile / open drawer -->
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
    ></div>

    <!-- Sidebar Drawer -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      aria-label="Panel Proyek"
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h2 class="font-bold text-sm text-slate-800 dark:text-slate-100">Daftar Proyek</h2>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Tutup panel"
          aria-label="Tutup panel"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Action: Buat Proyek Baru -->
      <div class="p-3 border-b border-slate-100 dark:border-slate-800/60">
        <button
          type="button"
          @click="handleNewProject"
          class="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Buat Proyek Baru</span>
        </button>
      </div>

      <!-- Project List (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div
          v-for="project in projects"
          :key="project.id"
          :class="[
            'group relative rounded-xl p-3 border transition-all cursor-pointer',
            project.id === activeProjectId
              ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 shadow-xs'
              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
          @click="selectProject(project.id)"
        >
          <div class="flex items-start justify-between">
            <!-- Edit Name Inline if renaming -->
            <div v-if="renamingId === project.id" class="flex-1 mr-2" @click.stop>
              <input
                ref="renameInputRef"
                v-model="renameValue"
                @keydown.enter="saveRename(project.id)"
                @keydown.esc="renamingId = null"
                class="w-full text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-900 border border-brand-500 rounded focus:outline-none text-slate-900 dark:text-white"
                placeholder="Nama proyek..."
              />
              <div class="flex items-center space-x-1 mt-1 text-[10px]">
                <button
                  type="button"
                  @click="saveRename(project.id)"
                  class="text-emerald-600 hover:underline font-semibold"
                >
                  Simpan
                </button>
                <span class="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  @click="renamingId = null"
                  class="text-slate-500 hover:underline"
                >
                  Batal
                </button>
              </div>
            </div>

            <!-- Title Display -->
            <div v-else class="flex-1 min-w-0 pr-2">
              <h3
                class="text-xs font-semibold truncate text-slate-800 dark:text-slate-200"
                :title="project.name"
              >
                {{ project.name }}
              </h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {{ formatTime(project.updatedAt) }}
              </p>
            </div>

            <!-- Action buttons (Rename, Duplicate, Delete) -->
            <div
              v-if="renamingId !== project.id"
              class="flex items-center space-x-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
            >
              <!-- Rename -->
              <button
                type="button"
                @click="startRename(project)"
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Ubah nama"
                aria-label="Ubah nama proyek"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <!-- Duplicate -->
              <button
                type="button"
                @click="handleDuplicate(project.id)"
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Duplikat proyek"
                aria-label="Duplikat proyek"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              <!-- Delete -->
              <button
                type="button"
                @click="handleDelete(project.id, project.name)"
                class="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 rounded hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                title="Hapus proyek"
                aria-label="Hapus proyek"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom / Footer: Mobile Quick Actions (Icons Only: Template, Unduh, Bagikan, Tema) -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around bg-slate-50/80 dark:bg-slate-900/80">
        <!-- Template Icon Button -->
        <button
          type="button"
          @click="emit('openTemplate'); emit('close')"
          class="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          title="Pilih Template"
          aria-label="Pilih Template"
        >
          <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>

        <!-- Unduh Icon Button -->
        <button
          type="button"
          @click="emit('openExport'); emit('close')"
          class="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          title="Unduh Diagram"
          aria-label="Unduh Diagram"
        >
          <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <!-- Bagikan Icon Button -->
        <button
          type="button"
          @click="emit('openShare'); emit('close')"
          class="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          title="Bagikan & Salin Diagram"
          aria-label="Bagikan Diagram"
        >
          <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <!-- Tema Icon Button (Direct Toggle) -->
        <button
          type="button"
          @click="toggleTheme"
          class="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
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
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useProjects, type Project } from '~/composables/useProjects'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selected', project: Project): void
  (e: 'openTemplate'): void
  (e: 'openExport'): void
  (e: 'openShare'): void
}>()

const {
  projects,
  activeProjectId,
  selectProject: selectProjectById,
  createProject,
  renameProject,
  duplicateProject,
  deleteProject,
} = useProjects()

const { isDark, toggleTheme } = useTheme()

const renamingId = ref<string | null>(null)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

const selectProject = (id: string) => {
  const proj = selectProjectById(id)
  if (proj) {
    emit('selected', proj)
  }
}

const handleNewProject = () => {
  const created = createProject('Diagram Baru')
  emit('selected', created)
}

const startRename = (proj: Project) => {
  renamingId.value = proj.id
  renameValue.value = proj.name
  nextTick(() => {
    renameInputRef.value?.focus()
  })
}

const saveRename = (id: string) => {
  if (renameValue.value.trim()) {
    renameProject(id, renameValue.value.trim())
  }
  renamingId.value = null
}

const handleDuplicate = (id: string) => {
  const dup = duplicateProject(id)
  if (dup) {
    emit('selected', dup)
  }
}

const handleDelete = (id: string, name: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus proyek "${name}"?`)) {
    deleteProject(id)
  }
}

const formatTime = (timestamp: number): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60) return 'Baru saja'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt yang lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
