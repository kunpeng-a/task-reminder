export type TaskType = 'interval' | 'scheduled' | 'daily'

export interface MaskConfig {
  autoClose: boolean | null       // true=进度条+自动关; false=一直显示手动关; null=回退全局
  countdownSeconds: number | null
  backgroundImage: string | null
}

export interface Task {
  id: string
  name: string
  description: string
  type: TaskType
  enabled: boolean
  intervalMinutes?: number
  scheduledTime?: string           // ISO
  dailyTimes?: string[]            // 'HH:mm'
  soundFile?: string | null        // null 回退全局
  mask: MaskConfig
  lastTriggeredAt?: string         // ISO，持久化
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  mask: { autoClose: boolean; countdownSeconds: number; backgroundImage: string }
  autoStart: boolean
  minimizeToTray: boolean
  soundEnabled: boolean
  soundFile: string                // 全局默认音效（内置 key 或文件路径）
}

/** 遮罩触发时传给遮罩窗口的载荷 */
export interface MaskPayload {
  taskId: string
  name: string
  description: string
  typeLabel: string                // 如 '周期提醒 · 每 20 分钟'
  autoClose: boolean
  countdownSeconds: number
  backgroundImage: string          // '' 表示默认深色
  soundFile: string                // 解析后的最终音效
  soundEnabled: boolean
}

export const IPC = {
  listTasks: 'tasks:list',
  saveTask: 'tasks:save',
  deleteTask: 'tasks:delete',
  toggleTask: 'tasks:toggle',
  getSettings: 'settings:get',
  saveSettings: 'settings:save',
  pauseAll: 'scheduler:pauseAll',
  isPaused: 'scheduler:isPaused',
  pickFile: 'dialog:pickFile',
  maskShow: 'mask:show',
  tasksChanged: 'tasks:changed',
  maskClose: 'mask:close',
  maskSnooze: 'mask:snooze',
} as const
