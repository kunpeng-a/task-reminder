import { Tray, Menu, app, nativeImage } from 'electron'
import trayIcon from '../../resources/icon.png?asset'
import * as scheduler from './scheduler'

let tray: Tray | null = null

export function createTray(showMainWindow: () => void): void {
  const icon = nativeImage.createFromPath(trayIcon)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)
  tray.setToolTip('任务提醒')
  rebuildMenu(showMainWindow)
  tray.on('double-click', showMainWindow)
}

export function rebuildMenu(showMainWindow: () => void): void {
  if (!tray) return
  const paused = scheduler.isPaused()
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '打开主界面', click: showMainWindow },
      {
        label: paused ? '恢复所有提醒' : '暂停所有提醒',
        click: () => {
          scheduler.setPaused(!paused)
          rebuildMenu(showMainWindow)
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.exit(0)
        }
      }
    ])
  )
}
