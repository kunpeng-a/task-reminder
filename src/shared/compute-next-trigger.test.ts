import { describe, it, expect } from 'vitest'
import { computeNextTrigger, triggerDueAt, atLocalTime, sameLocalDay } from './compute-next-trigger'
import type { Task } from './types'

const base = (over: Partial<Task>): Task => ({
  id: 't', name: 'n', description: '', type: 'interval', enabled: true,
  mask: { autoClose: null, countdownSeconds: null, backgroundImage: null },
  createdAt: '', updatedAt: '', ...over,
})

const at = (h: number, m = 0, dayOffset = 0) =>
  atLocalTime(new Date(2026, 5, 8, 10, 0, 0, 0).getTime(), `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, dayOffset)

describe('computeNextTrigger', () => {
  it('interval：首次触发 = 启动时间 + 间隔', () => {
    const appStart = new Date(2026,5,8,9,0,0).getTime()
    const now = new Date(2026,5,8,9,5,0).getTime()
    const t = base({ type: 'interval', intervalMinutes: 20 })
    expect(computeNextTrigger(t, now, appStart)).toBe(appStart + 20*60_000)
  })
  it('interval：跨重启重置（lastTriggeredAt 早于本次启动则忽略）', () => {
    const appStart = new Date(2026,5,8,9,0,0).getTime()
    const now = new Date(2026,5,8,9,1,0).getTime()
    const t = base({ type:'interval', intervalMinutes: 20, lastTriggeredAt: new Date(2026,5,7,23,0,0).toISOString() })
    expect(computeNextTrigger(t, now, appStart)).toBe(appStart + 20*60_000)
  })
  it('scheduled：未来返回该时间，已过返回 null', () => {
    const appStart = 0
    const now = new Date(2026,5,8,10,0,0).getTime()
    const future = base({ type:'scheduled', scheduledTime: new Date(2026,5,8,11,0,0).toISOString() })
    expect(computeNextTrigger(future, now, appStart)).toBe(new Date(2026,5,8,11,0,0).getTime())
    const past = base({ type:'scheduled', scheduledTime: new Date(2026,5,8,9,0,0).toISOString() })
    expect(computeNextTrigger(past, now, appStart)).toBeNull()
  })
  it('daily：取今天下一个未过的时间点', () => {
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'daily', dailyTimes: ['08:00','12:30','20:00'] })
    expect(computeNextTrigger(t, now, 0)).toBe(at(12,30))
  })
  it('daily：今天全过了 → 明天第一个', () => {
    const now = new Date(2026,5,8,21,0,0).getTime()
    const t = base({ type:'daily', dailyTimes: ['08:00','20:00'] })
    expect(computeNextTrigger(t, now, 0)).toBe(at(8,0,1))
  })
  it('disabled → null', () => {
    const t = base({ enabled:false, type:'interval', intervalMinutes:5 })
    expect(computeNextTrigger(t, Date.now(), 0)).toBeNull()
  })
})

describe('triggerDueAt（含当天内 catch-up）', () => {
  it('daily：当天内早于现在且未触发过 → 该时间点 due', () => {
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'daily', dailyTimes: ['08:00'] })
    expect(triggerDueAt(t, now, 0)).toBe(at(8,0))
  })
  it('daily：已触发过的当天时间点不重复', () => {
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'daily', dailyTimes: ['08:00'], lastTriggeredAt: new Date(2026,5,8,8,0,0).toISOString() })
    expect(triggerDueAt(t, now, 0)).toBeNull()
  })
  it('scheduled：当天内已过且未触发 → due（catch-up）', () => {
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'scheduled', scheduledTime: new Date(2026,5,8,9,0,0).toISOString() })
    expect(triggerDueAt(t, now, 0)).toBe(new Date(2026,5,8,9,0,0).getTime())
  })
  it('scheduled：已触发过 → 不再 due', () => {
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'scheduled', scheduledTime: new Date(2026,5,8,9,0,0).toISOString(), lastTriggeredAt: new Date(2026,5,8,9,0,0).toISOString() })
    expect(triggerDueAt(t, now, 0)).toBeNull()
  })
  it('interval：启动后未到间隔 → 不 due（不补弹历史）', () => {
    const appStart = new Date(2026,5,8,9,55,0).getTime()
    const now = new Date(2026,5,8,10,0,0).getTime()
    const t = base({ type:'interval', intervalMinutes: 20 })
    expect(triggerDueAt(t, now, appStart)).toBeNull()
  })
})

describe('sameLocalDay', () => {
  it('同一本地日为 true，跨日为 false', () => {
    expect(sameLocalDay(new Date(2026,5,8,1,0,0).getTime(), new Date(2026,5,8,23,0,0).getTime())).toBe(true)
    expect(sameLocalDay(new Date(2026,5,7,23,0,0).getTime(), new Date(2026,5,8,1,0,0).getTime())).toBe(false)
  })
})
