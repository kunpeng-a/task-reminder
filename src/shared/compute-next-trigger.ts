import type { Task } from './types'

/** 本地时间下，相对 ref 所在日偏移 dayOffset 天的 HH:mm 时刻（epoch ms）。 */
export function atLocalTime(ref: number, hhmm: string, dayOffset = 0): number {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(ref)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

export function sameLocalDay(a: number, b: number): boolean {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate()
}

/**
 * 严格晚于 `after` 的下次触发（epoch ms），无则 null。
 * interval 以 appStart 为锚点，跨重启自动重置。
 */
export function computeNextTrigger(task: Task, after: number, appStart: number): number | null {
  if (!task.enabled) return null
  switch (task.type) {
    case 'interval': {
      const mins = task.intervalMinutes
      if (!mins || mins <= 0) return null
      const step = mins * 60_000
      const lt = task.lastTriggeredAt ? Date.parse(task.lastTriggeredAt) : 0
      const en = task.enabledAt ? Date.parse(task.enabledAt) : 0
      // 锚点取三者最大：应用启动、启用时刻、上次触发。
      // → 启用即从满间隔重新计时；跨重启也重置；触发后顺延。
      const baseAnchor = Math.max(appStart, en, lt)
      const k = Math.max(0, Math.floor((after - baseAnchor) / step)) + 1
      return baseAnchor + k * step
    }
    case 'scheduled': {
      if (!task.scheduledTime) return null
      const t = Date.parse(task.scheduledTime)
      return t > after ? t : null
    }
    case 'daily': {
      const times = task.dailyTimes
      if (!times || times.length === 0) return null
      const today = times.map(t => atLocalTime(after, t)).filter(t => t > after)
      if (today.length) return Math.min(...today)
      return Math.min(...times.map(t => atLocalTime(after, t, 1)))
    }
  }
}

/**
 * 现在是否有「该触发」的时间点（含当天内 catch-up）。返回该触发时刻或 null。
 */
export function triggerDueAt(task: Task, now: number, appStart: number): number | null {
  if (!task.enabled) return null
  const last = task.lastTriggeredAt ? Date.parse(task.lastTriggeredAt) : null
  switch (task.type) {
    case 'interval': {
      const step = (task.intervalMinutes ?? 0) * 60_000
      if (step <= 0) return null
      const en = task.enabledAt ? Date.parse(task.enabledAt) : 0
      const anchor = Math.max(appStart, en, last ?? 0)
      const nt = anchor + step // 锚点后的第一个触发点
      return nt <= now ? nt : null
    }
    case 'scheduled': {
      if (last !== null) return null
      const t = task.scheduledTime ? Date.parse(task.scheduledTime) : null
      return t !== null && t <= now ? t : null
    }
    case 'daily': {
      const times = task.dailyTimes ?? []
      const passed = times
        .map(t => atLocalTime(now, t))
        .filter(t => t <= now && (last === null || t > last))
      return passed.length ? Math.max(...passed) : null
    }
  }
}
