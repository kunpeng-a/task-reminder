import React from 'react'
import { api } from '../api'
import { computeNextTrigger } from '../../../shared/compute-next-trigger'
import type { Task } from '../../../shared/types'

type Filter = 'all' | 'enabled' | 'disabled' | 'expired'

const FILTER_LABEL: Record<Filter, string> = {
  all: '全部',
  enabled: '启用',
  disabled: '禁用',
  expired: '已过期'
}
const TYPE_LABEL: Record<Task['type'], string> = {
  interval: '周期',
  scheduled: '定时',
  daily: '每日'
}

export function TaskList(): React.JSX.Element {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [filter, setFilter] = React.useState<Filter>('all')
  const [paused, setPaused] = React.useState(false)
  const [now, setNow] = React.useState(Date.now())
  const [appStart, setAppStart] = React.useState(Date.now())

  const reload = React.useCallback(() => {
    api.listTasks().then(setTasks)
  }, [])
  React.useEffect(() => {
    reload()
    api.isPaused().then(setPaused)
    api.getAppStart().then(setAppStart)
  }, [reload])
  React.useEffect(() => api.onTasksChanged(reload), [reload])
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const statusOf = (t: Task): Filter => {
    if (t.enabled) return 'enabled'
    if (t.type === 'scheduled' && t.scheduledTime && Date.parse(t.scheduledTime) < now) return 'expired'
    return 'disabled'
  }

  const shown = tasks
    .filter((t) => (filter === 'all' ? true : statusOf(t) === filter))
    .sort(
      (a, b) =>
        (computeNextTrigger(a, now, appStart) ?? Infinity) -
        (computeNextTrigger(b, now, appStart) ?? Infinity)
    )

  const fmtCountdown = (t: Task): string => {
    if (paused && t.enabled) return '已暂停'
    const nt = computeNextTrigger(t, now, appStart)
    if (nt === null) return '—'
    const s = Math.max(0, Math.round((nt - now) / 1000))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h ? `${h}h ${m}m` : m ? `${m}m ${sec}s` : `${sec}s`
  }

  const toggle = (t: Task): void => {
    api.toggleTask(t.id, !t.enabled).then(reload)
  }
  const remove = (t: Task): void => {
    if (confirm(`删除「${t.name}」？`)) api.deleteTask(t.id).then(reload)
  }
  const togglePause = (): void => {
    api.pauseAll().then(setPaused)
  }

  return (
    <div className="app-window">
      <div className="app-body">
        <aside className="sidebar">
          <div className="brand">
            <div className="mark">⏰</div>
            <div>
              <b>任务提醒</b>
              <small>本地 · 后台常驻</small>
            </div>
          </div>
          <nav className="nav">
            <a className="nav-item active" href="#">
              全部任务 <span className="count">{tasks.length}</span>
            </a>
            <a className="nav-item" href="#settings">
              全局设置
            </a>
          </nav>
          <div className="spacer" />
          <div className="side-status">
            <span className={`dot ${paused ? 'paused' : 'live'}`} />
            <div>{paused ? '已暂停' : '调度运行中'}</div>
          </div>
        </aside>

        <section className="main">
          <header className="topbar">
            <h1>全部任务</h1>
            <div className="grow" />
            <button className="btn btn-ghost btn-sm" onClick={togglePause}>
              {paused ? '恢复全部' : '暂停全部'}
            </button>
            <a className="btn btn-primary btn-sm" href="#edit">
              + 新建任务
            </a>
          </header>
          <div className="content">
            <div className="tabs">
              {(['all', 'enabled', 'disabled', 'expired'] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={`tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABEL[f]}
                </button>
              ))}
            </div>
            <div className="task-list">
              {shown.length === 0 && <div className="empty">还没有任务，点右上角新建</div>}
              {shown.map((t) => (
                <div key={t.id} className={`task ${!t.enabled ? 'is-disabled' : ''}`}>
                  <div className="task-ico ico-blue">⏰</div>
                  <div className="task-main">
                    <div className="task-title-row">
                      <span className="task-title">{t.name}</span>
                      <span className={`badge badge-${t.type}`}>{TYPE_LABEL[t.type]}</span>
                    </div>
                    {t.description && <div className="task-desc">{t.description}</div>}
                  </div>
                  <div className="task-right">
                    <div className="countdown">
                      <div className="big num">{fmtCountdown(t)}</div>
                      <div className="lbl">下次</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={t.enabled} onChange={() => toggle(t)} />
                      <span className="track" />
                    </label>
                    <a className="btn btn-ghost btn-sm" href={`#edit?id=${t.id}`}>
                      编辑
                    </a>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(t)}>
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
