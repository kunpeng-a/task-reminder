import type { Task, AppSettings } from '../../shared/types'

export interface RendererApi {
  listTasks(): Promise<Task[]>
  saveTask(t: Task): Promise<Task>
  deleteTask(id: string): Promise<void>
  toggleTask(id: string, enabled: boolean): Promise<void>
  getSettings(): Promise<AppSettings>
  saveSettings(s: AppSettings): Promise<void>
  pauseAll(): Promise<boolean>
  isPaused(): Promise<boolean>
  getAppStart(): Promise<number>
  pickFile(kind: 'image' | 'audio'): Promise<string | null>
  onTasksChanged(cb: () => void): () => void
  onMaskShow(cb: (payload: unknown) => void): () => void
  maskClose(): Promise<void>
  maskSnooze(taskId: string): Promise<void>
}

declare global {
  interface Window {
    api: RendererApi
  }
}

export const api = window.api
