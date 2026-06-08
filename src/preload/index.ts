import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type { Task, AppSettings } from '../shared/types'

const api = {
  listTasks: (): Promise<Task[]> => ipcRenderer.invoke(IPC.listTasks),
  saveTask: (t: Task): Promise<Task> => ipcRenderer.invoke(IPC.saveTask, t),
  deleteTask: (id: string): Promise<void> => ipcRenderer.invoke(IPC.deleteTask, id),
  toggleTask: (id: string, enabled: boolean): Promise<void> =>
    ipcRenderer.invoke(IPC.toggleTask, id, enabled),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.getSettings),
  saveSettings: (s: AppSettings): Promise<void> => ipcRenderer.invoke(IPC.saveSettings, s),
  pauseAll: (): Promise<boolean> => ipcRenderer.invoke(IPC.pauseAll),
  isPaused: (): Promise<boolean> => ipcRenderer.invoke(IPC.isPaused),
  pickFile: (kind: 'image' | 'audio'): Promise<string | null> =>
    ipcRenderer.invoke(IPC.pickFile, kind),
  onTasksChanged: (cb: () => void): (() => void) => {
    const fn = (): void => cb()
    ipcRenderer.on(IPC.tasksChanged, fn)
    return () => ipcRenderer.removeListener(IPC.tasksChanged, fn)
  },
  onMaskShow: (cb: (payload: unknown) => void): (() => void) => {
    const fn = (_e: unknown, p: unknown): void => cb(p)
    ipcRenderer.on(IPC.maskShow, fn)
    return () => ipcRenderer.removeListener(IPC.maskShow, fn)
  },
  maskClose: (): Promise<void> => ipcRenderer.invoke(IPC.maskClose),
  maskSnooze: (taskId: string): Promise<void> => ipcRenderer.invoke(IPC.maskSnooze, taskId)
}

contextBridge.exposeInMainWorld('api', api)
export type Api = typeof api
