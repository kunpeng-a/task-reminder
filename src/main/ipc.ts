import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC } from '../shared/types'
import type { Task, AppSettings } from '../shared/types'
import * as store from './store'
import * as scheduler from './scheduler'
import * as notification from './notification'
import { setAutoStart } from './autostart'

export function registerIpc(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.listTasks, () => store.listTasks())
  ipcMain.handle(IPC.saveTask, (_e, t: Task) => {
    const saved = store.saveTask(t)
    getMainWindow()?.webContents.send(IPC.tasksChanged)
    return saved
  })
  ipcMain.handle(IPC.deleteTask, (_e, id: string) => {
    store.deleteTask(id)
    getMainWindow()?.webContents.send(IPC.tasksChanged)
  })
  ipcMain.handle(IPC.toggleTask, (_e, id: string, enabled: boolean) => {
    store.setEnabled(id, enabled)
    getMainWindow()?.webContents.send(IPC.tasksChanged)
  })
  ipcMain.handle(IPC.getSettings, () => store.getSettings())
  ipcMain.handle(IPC.saveSettings, (_e, s: AppSettings) => {
    store.saveSettings(s)
    setAutoStart(s.autoStart)
  })
  ipcMain.handle(IPC.pauseAll, () => {
    scheduler.setPaused(!scheduler.isPaused())
    return scheduler.isPaused()
  })
  ipcMain.handle(IPC.isPaused, () => scheduler.isPaused())
  ipcMain.handle(IPC.getAppStart, () => scheduler.getAppStart())
  ipcMain.handle(IPC.pickFile, async (_e, kind: 'image' | 'audio') => {
    const filters =
      kind === 'image'
        ? [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
        : [{ name: 'Audio', extensions: ['wav', 'mp3', 'ogg'] }]
    const r = await dialog.showOpenDialog({ properties: ['openFile'], filters })
    return r.canceled ? null : r.filePaths[0]
  })
  ipcMain.handle(IPC.maskClose, () => notification.closeMask())
  ipcMain.handle(IPC.maskSnooze, (_e, taskId: string) => {
    notification.closeForSnooze()
    scheduler.snooze(taskId)
  })
}
