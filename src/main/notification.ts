import { BrowserWindow, screen } from 'electron'
import { join } from 'node:path'
import koffi from 'koffi'
import { IPC } from '../shared/types'
import type { Task, MaskPayload } from '../shared/types'
import * as store from './store'
import { BUILTIN_SOUNDS } from '../shared/defaults'

// SHQueryUserNotificationState：判断当前是否处于全屏独占/演示/游戏，避免强弹
let queryState: (() => number) | null = null
try {
  const shell32 = koffi.load('shell32.dll')
  const fn = shell32.func('int __stdcall SHQueryUserNotificationState(_Out_ int *pquns)')
  queryState = (): number => {
    const out: number[] = [0]
    fn(out)
    return out[0]
  }
} catch {
  queryState = null
}

// QUNS_BUSY=2, QUNS_RUNNING_D3D_FULL_SCREEN=3, QUNS_PRESENTATION_MODE=4
function isFullscreenBusy(): boolean {
  if (!queryState) return false
  try {
    const s = queryState()
    return s === 2 || s === 3 || s === 4
  } catch {
    return false
  }
}

const queue: MaskPayload[] = []
let maskWin: BrowserWindow | null = null
let showing = false

function resolveSound(task: Task): string {
  const s = store.getSettings()
  const key = task.soundFile ?? s.soundFile
  const builtin = BUILTIN_SOUNDS.find((b) => b.key === key)
  if (builtin) return builtin.file ? `builtin:${builtin.file}` : '' // 静音返回空
  return key // 自定义文件路径
}

function typeLabel(task: Task): string {
  if (task.type === 'interval') return `周期提醒 · 每 ${task.intervalMinutes} 分钟`
  if (task.type === 'scheduled') return '定时提醒'
  return '每日提醒'
}

export function enqueue(task: Task): void {
  const s = store.getSettings()
  // 全屏逃生舱：独占全屏/演示/游戏时不强弹（自用工具简单处理：跳过本次）
  if (isFullscreenBusy()) return
  const payload: MaskPayload = {
    taskId: task.id,
    name: task.name,
    description: task.description,
    typeLabel: typeLabel(task),
    autoClose: task.mask.autoClose ?? s.mask.autoClose,
    countdownSeconds: task.mask.countdownSeconds ?? s.mask.countdownSeconds,
    backgroundImage: task.mask.backgroundImage ?? s.mask.backgroundImage,
    soundFile: resolveSound(task),
    soundEnabled: s.soundEnabled
  }
  queue.push(payload)
  if (!showing) showNext()
}

function showNext(): void {
  const payload = queue.shift()
  if (!payload) {
    showing = false
    return
  }
  showing = true
  const { width, height } = screen.getPrimaryDisplay().bounds
  maskWin = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreen: true,
    resizable: false,
    movable: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js') }
  })
  maskWin.setAlwaysOnTop(true, 'screen-saver')
  const url = process.env['ELECTRON_RENDERER_URL']
  if (url) maskWin.loadURL(`${url}#mask`)
  else maskWin.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'mask' })
  maskWin.webContents.once('did-finish-load', () => {
    maskWin?.webContents.send(IPC.maskShow, payload)
  })
  maskWin.on('closed', () => {
    maskWin = null
    showNext() // 关闭后出下一个
  })
}

/** 遮罩窗口请求关闭（知道了/倒计时归零） */
export function closeMask(): void {
  maskWin?.close()
}

/** 遮罩内 snooze：关闭当前，由 ipc 调用 scheduler.snooze 处理 5 分钟重弹 */
export function closeForSnooze(): void {
  maskWin?.close()
}
