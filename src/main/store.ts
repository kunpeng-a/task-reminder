import Store from 'electron-store'
import { randomUUID } from 'node:crypto'
import type { Task, AppSettings } from '../shared/types'
import { DEFAULT_SETTINGS } from '../shared/defaults'

interface Schema {
  tasks: Task[]
  settings: AppSettings
}

const store = new Store<Schema>({
  defaults: { tasks: [], settings: DEFAULT_SETTINGS },
})

export function listTasks(): Task[] {
  return store.get('tasks')
}

export function saveTask(input: Partial<Task> & { name: string; type: Task['type'] }): Task {
  const now = new Date().toISOString()
  const tasks = store.get('tasks')
  if (input.id) {
    const idx = tasks.findIndex(t => t.id === input.id)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...input, updatedAt: now } as Task
      store.set('tasks', tasks)
      return tasks[idx]
    }
  }
  const task: Task = {
    id: randomUUID(),
    name: input.name,
    description: input.description ?? '',
    type: input.type,
    enabled: input.enabled ?? true,
    intervalMinutes: input.intervalMinutes,
    scheduledTime: input.scheduledTime,
    dailyTimes: input.dailyTimes,
    soundFile: input.soundFile ?? null,
    mask: input.mask ?? { autoClose: null, countdownSeconds: null, backgroundImage: null },
    createdAt: now,
    updatedAt: now,
  }
  store.set('tasks', [...tasks, task])
  return task
}

export function deleteTask(id: string): void {
  store.set('tasks', store.get('tasks').filter(t => t.id !== id))
}

export function setLastTriggered(id: string, iso: string): void {
  const tasks = store.get('tasks')
  const t = tasks.find(x => x.id === id)
  if (t) { t.lastTriggeredAt = iso; store.set('tasks', tasks) }
}

export function setEnabled(id: string, enabled: boolean): void {
  const tasks = store.get('tasks')
  const t = tasks.find(x => x.id === id)
  if (t) { t.enabled = enabled; t.updatedAt = new Date().toISOString(); store.set('tasks', tasks) }
}

export function getSettings(): AppSettings {
  return store.get('settings')
}

export function saveSettings(s: AppSettings): void {
  store.set('settings', s)
}
