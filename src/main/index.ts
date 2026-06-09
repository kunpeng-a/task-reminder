import { app, BrowserWindow, powerMonitor } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import { join } from 'node:path'
import { registerIpc } from './ipc'
import * as scheduler from './scheduler'
import * as notification from './notification'
import { createTray, rebuildMenu } from './tray'
import { startedHidden } from './autostart'

let mainWindow: BrowserWindow | null = null

interface QuitableApp {
  isQuiting?: boolean
}

// 单实例锁：防双开出两个调度器/托盘
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => showMainWindow())

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.local.taskreminder')
    registerIpc(() => mainWindow)
    notification.setMainGetter(() => mainWindow)
    createMainWindow()
    createTray(showMainWindow)
    scheduler.start((task) => notification.enqueue(task))
    powerMonitor.on('resume', () => scheduler.onResume())
    rebuildMenu(showMainWindow)
  })

  // 最小化到托盘：窗口全关时不退出
  app.on('window-all-closed', () => {
    /* keep alive in tray */
  })
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('close', (e) => {
    // 关闭按钮 → 最小化到托盘而非退出
    if (!(app as QuitableApp).isQuiting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
  const url = process.env['ELECTRON_RENDERER_URL']
  if (url) mainWindow.loadURL(url)
  else mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  if (!startedHidden()) mainWindow.once('ready-to-show', () => mainWindow?.show())
}

function showMainWindow(): void {
  if (!mainWindow) createMainWindow()
  mainWindow?.show()
  mainWindow?.focus()
}
