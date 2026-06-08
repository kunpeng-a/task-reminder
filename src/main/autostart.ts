import { app } from 'electron'

export function setAutoStart(enabled: boolean): void {
  // 开发态不写注册表，避免污染
  if (!app.isPackaged) return
  app.setLoginItemSettings({
    openAtLogin: enabled,
    args: ['--hidden'] // 启动后最小化到托盘
  })
}

export function startedHidden(): boolean {
  return process.argv.includes('--hidden')
}
