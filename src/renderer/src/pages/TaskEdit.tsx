import React from 'react'
import { api } from '../api'
import { BUILTIN_SOUNDS } from '../../../shared/defaults'
import type { Task, TaskType } from '../../../shared/types'

const emptyTask = (): Task => ({
  id: '',
  name: '',
  description: '',
  type: 'interval',
  enabled: true,
  intervalMinutes: 20,
  dailyTimes: ['08:00'],
  soundFile: null,
  mask: { autoClose: null, countdownSeconds: null, backgroundImage: null },
  createdAt: '',
  updatedAt: ''
})

const TYPE_TITLE: Record<TaskType, string> = {
  interval: '周期提醒',
  scheduled: '定时提醒',
  daily: '每日提醒'
}
const TYPE_DESC: Record<TaskType, string> = {
  interval: '每隔固定分钟重复',
  scheduled: '指定日期时间一次',
  daily: '每天固定时间点'
}

export function TaskEdit({ id }: { id: string | null }): React.JSX.Element {
  const [t, setT] = React.useState<Task>(emptyTask())
  const [newTime, setNewTime] = React.useState('12:30')

  React.useEffect(() => {
    if (id)
      api.listTasks().then((list) => {
        const found = list.find((x) => x.id === id)
        if (found) setT(found)
      })
  }, [id])

  const up = (patch: Partial<Task>): void => setT((prev) => ({ ...prev, ...patch }))
  const upMask = (patch: Partial<Task['mask']>): void =>
    setT((prev) => ({ ...prev, mask: { ...prev.mask, ...patch } }))

  const schedDate = t.scheduledTime ? t.scheduledTime.slice(0, 10) : '2026-06-10'
  const schedTime = t.scheduledTime ? t.scheduledTime.slice(11, 16) : '09:00'
  const setSched = (date: string, time: string): void => up({ scheduledTime: `${date}T${time}:00` })

  const save = async (): Promise<void> => {
    if (!t.name.trim()) {
      alert('任务名称必填')
      return
    }
    await api.saveTask(t)
    window.location.hash = '#'
  }

  return (
    <div className="app-window">
      <div className="app-body">
        <section className="main">
          <header className="topbar">
            <a className="btn btn-ghost btn-icon" href="#">
              ←
            </a>
            <h1>{id ? '编辑任务' : '新建任务'}</h1>
          </header>
          <div className="content">
            <div className="edit-wrap form-grid">
              <div className="field">
                <label>任务名称 *</label>
                <input
                  className="input"
                  value={t.name}
                  onChange={(e) => up({ name: e.target.value })}
                  placeholder="例如：喝水提醒"
                />
              </div>
              <div className="field">
                <label>提醒内容</label>
                <textarea
                  className="textarea"
                  value={t.description}
                  onChange={(e) => up({ description: e.target.value })}
                />
              </div>

              <div className="field">
                <label>提醒类型 *</label>
                <div className="seg">
                  {(['interval', 'scheduled', 'daily'] as TaskType[]).map((tp) => (
                    <div
                      key={tp}
                      className={`seg-opt ${t.type === tp ? 'active' : ''}`}
                      onClick={() => up({ type: tp })}
                    >
                      <b>{TYPE_TITLE[tp]}</b>
                      <span>{TYPE_DESC[tp]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {t.type === 'interval' && (
                <div className="card">
                  <div className="card-title">周期配置</div>
                  <div className="row-field">
                    <div className="rf-main">
                      <b>提醒间隔</b>
                      <span>应用启动后开始计时</span>
                    </div>
                    <div className="stepper">
                      <button onClick={() => up({ intervalMinutes: Math.max(1, (t.intervalMinutes ?? 1) - 1) })}>
                        −
                      </button>
                      <input
                        className="num"
                        value={t.intervalMinutes ?? 20}
                        onChange={(e) => up({ intervalMinutes: +e.target.value || 1 })}
                      />
                      <button onClick={() => up({ intervalMinutes: (t.intervalMinutes ?? 0) + 1 })}>+</button>
                    </div>
                  </div>
                </div>
              )}

              {t.type === 'scheduled' && (
                <div className="card">
                  <div className="card-title">定时配置</div>
                  <div className="two">
                    <div className="field">
                      <label>日期</label>
                      <input
                        className="input"
                        type="date"
                        value={schedDate}
                        onChange={(e) => setSched(e.target.value, schedTime)}
                      />
                    </div>
                    <div className="field">
                      <label>时间</label>
                      <input
                        className="input"
                        type="time"
                        value={schedTime}
                        onChange={(e) => setSched(schedDate, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {t.type === 'daily' && (
                <div className="card">
                  <div className="card-title">每日时间点</div>
                  <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {(t.dailyTimes ?? []).map((time, i) => (
                      <span key={i} className="chip-time">
                        {time}
                        <button
                          onClick={() =>
                            up({ dailyTimes: (t.dailyTimes ?? []).filter((_, j) => j !== i) })
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="row" style={{ display: 'flex', marginTop: 14, gap: 10 }}>
                    <input
                      className="input"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      style={{ width: 140 }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => up({ dailyTimes: [...(t.dailyTimes ?? []), newTime] })}
                    >
                      添加时间点
                    </button>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-title">遮罩显示配置 · 留空用全局默认</div>
                <div className="row-field">
                  <div className="rf-main">
                    <b>倒计时时长（秒）</b>
                  </div>
                  <input
                    className="input"
                    style={{ width: 90 }}
                    value={t.mask.countdownSeconds ?? ''}
                    placeholder="全局"
                    onChange={(e) =>
                      upMask({ countdownSeconds: e.target.value ? +e.target.value : null })
                    }
                  />
                </div>
                <div className="row-field">
                  <div className="rf-main">
                    <b>倒计时结束自动关闭</b>
                    <span>关闭=「一直显示」必须手动关</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={t.mask.autoClose ?? true}
                      onChange={(e) => upMask({ autoClose: e.target.checked })}
                    />
                    <span className="track" />
                  </label>
                </div>
                <div className="row-field">
                  <div className="rf-main">
                    <b>提醒音效</b>
                  </div>
                  <select
                    className="select"
                    value={t.soundFile ?? ''}
                    onChange={(e) => up({ soundFile: e.target.value || null })}
                  >
                    <option value="">（用全局默认）</option>
                    {BUILTIN_SOUNDS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row-field">
                  <div className="rf-main">
                    <b>自定义背景壁纸</b>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      const f = await api.pickFile('image')
                      if (f) upMask({ backgroundImage: f })
                    }}
                  >
                    选择图片…
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bar">
            <label className="switch">
              <input
                type="checkbox"
                checked={t.enabled}
                onChange={(e) => up({ enabled: e.target.checked })}
              />
              <span className="track" />
            </label>
            <span className="hint">创建后立即启用</span>
            <div style={{ flex: 1 }} />
            <a className="btn btn-ghost" href="#">
              取消
            </a>
            <button className="btn btn-primary" onClick={save}>
              保存任务
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
