import { triggerDueAt, computeNextTrigger, sameLocalDay } from '../shared/compute-next-trigger'
import * as store from './store'
import type { Task } from '../shared/types'

const HEARTBEAT_MS = 25_000
const PRECISE_WINDOW_MS = 90_000

type FireFn = (task: Task) => void

let appStart = Date.now()
let heartbeat: NodeJS.Timeout | null = null
const preciseTimers = new Map<string, NodeJS.Timeout>()
let paused = false
let onFire: FireFn = () => {}

export function start(fire: FireFn): void {
  onFire = fire
  appStart = Date.now()
  catchUp()
  tick()
  heartbeat = setInterval(tick, HEARTBEAT_MS)
}

export function stop(): void {
  if (heartbeat) clearInterval(heartbeat)
  preciseTimers.forEach((t) => clearTimeout(t))
  preciseTimers.clear()
}

export function setPaused(v: boolean): void {
  paused = v
}
export function isPaused(): boolean {
  return paused
}

/** 本次进程的计时锚点（interval 以此为起点），供渲染层算正确的倒计时。 */
export function getAppStart(): number {
  return appStart
}

export function onResume(): void {
  catchUp()
}

export function snooze(taskId: string): void {
  const t = store.listTasks().find((x) => x.id === taskId)
  if (!t) return
  setTimeout(
    () => {
      if (!paused) onFire(t)
    },
    5 * 60_000
  )
}

function fire(task: Task, at: number): void {
  store.setLastTriggered(task.id, new Date(at).toISOString())
  if (task.type === 'scheduled') store.setEnabled(task.id, false)
  onFire(store.listTasks().find((x) => x.id === task.id) ?? task)
}

function tick(): void {
  if (paused) return
  const now = Date.now()
  for (const task of store.listTasks()) {
    const due = triggerDueAt(task, now, appStart)
    if (due !== null) {
      if (task.type === 'scheduled' && !sameLocalDay(due, now)) {
        store.setEnabled(task.id, false)
        continue
      }
      fire(task, due)
      continue
    }
    armPrecise(task, now)
  }
}

function armPrecise(task: Task, now: number): void {
  if (preciseTimers.has(task.id)) return
  const ref = task.lastTriggeredAt ? Date.parse(task.lastTriggeredAt) : appStart
  const next = computeNextTrigger(task, Math.max(ref, now), appStart)
  if (next === null) return
  const delay = next - now
  if (delay > 0 && delay <= PRECISE_WINDOW_MS) {
    const timer = setTimeout(() => {
      preciseTimers.delete(task.id)
      if (paused) return
      const fresh = store.listTasks().find((x) => x.id === task.id)
      if (fresh && fresh.enabled) fire(fresh, next)
    }, delay)
    preciseTimers.set(task.id, timer)
  }
}

function catchUp(): void {
  preciseTimers.forEach((t) => clearTimeout(t))
  preciseTimers.clear()
  tick()
}
