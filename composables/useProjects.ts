import { ref, watch } from 'vue'
import { DIAGRAM_TEMPLATES } from '~/utils/templates'

export interface Project {
  id: string
  name: string
  code: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'plantuml_studio_projects'
const ACTIVE_PROJECT_KEY = 'plantuml_studio_active_project_id'

const projects = ref<Project[]>([])
const activeProjectId = ref<string>('')
const activeProject = ref<Project | null>(null)
const isInitialized = ref(false)

export function useProjects() {
  const initProjects = (initialCode?: string) => {
    if (!import.meta.client || isInitialized.value) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        projects.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Gagal membaca proyek dari localStorage:', e)
      projects.value = []
    }

    // If no projects exist, create a default one
    if (projects.value.length === 0) {
      const defaultProject: Project = {
        id: 'proj_' + Date.now(),
        name: 'Diagram Sequence Utama',
        code: initialCode || DIAGRAM_TEMPLATES[0].code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      projects.value = [defaultProject]
      activeProjectId.value = defaultProject.id
      activeProject.value = defaultProject
      saveToStorage()
    } else {
      const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY)
      const found = projects.value.find(p => p.id === savedActiveId)
      if (found) {
        activeProjectId.value = found.id
        activeProject.value = found
      } else {
        activeProjectId.value = projects.value[0].id
        activeProject.value = projects.value[0]
      }
    }

    isInitialized.value = true
  }

  const saveToStorage = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
      if (activeProjectId.value) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId.value)
      }
    } catch (e) {
      console.error('Gagal menyimpan proyek ke localStorage:', e)
    }
  }

  const selectProject = (id: string): Project | null => {
    const proj = projects.value.find(p => p.id === id)
    if (proj) {
      activeProjectId.value = proj.id
      activeProject.value = proj
      saveToStorage()
      return proj
    }
    return null
  }

  const createProject = (name = 'Diagram Baru', code = DIAGRAM_TEMPLATES[0].code): Project => {
    const newProj: Project = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Diagram Baru',
      code,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    projects.value.unshift(newProj)
    activeProjectId.value = newProj.id
    activeProject.value = newProj
    saveToStorage()
    return newProj
  }

  const updateProjectCode = (id: string, code: string) => {
    const proj = projects.value.find(p => p.id === id)
    if (proj) {
      proj.code = code
      proj.updatedAt = Date.now()
      saveToStorage()
    }
  }

  const renameProject = (id: string, newName: string): boolean => {
    const trimmed = newName.trim()
    if (!trimmed) return false

    const proj = projects.value.find(p => p.id === id)
    if (proj) {
      proj.name = trimmed
      proj.updatedAt = Date.now()
      saveToStorage()
      return true
    }
    return false
  }

  const duplicateProject = (id: string): Project | null => {
    const original = projects.value.find(p => p.id === id)
    if (!original) return null

    const duplicate: Project = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: `${original.name} (Salinan)`,
      code: original.code,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const index = projects.value.findIndex(p => p.id === id)
    projects.value.splice(index + 1, 0, duplicate)
    activeProjectId.value = duplicate.id
    activeProject.value = duplicate
    saveToStorage()
    return duplicate
  }

  const deleteProject = (id: string): boolean => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index === -1) return false

    projects.value.splice(index, 1)

    // If deleted active project, select another one or create default
    if (activeProjectId.value === id) {
      if (projects.value.length > 0) {
        activeProjectId.value = projects.value[0].id
        activeProject.value = projects.value[0]
      } else {
        const fallback = createProject('Diagram Baru')
        activeProjectId.value = fallback.id
        activeProject.value = fallback
      }
    }

    saveToStorage()
    return true
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    initProjects,
    selectProject,
    createProject,
    updateProjectCode,
    renameProject,
    duplicateProject,
    deleteProject,
  }
}
