import React from 'react'
import { api } from '../api'
import { BUILTIN_SOUNDS } from '../../../shared/defaults'
import type { AppSettings } from '../../../shared/types'

export function Settings(): React.JSX.Element | null {
  const [s, setS] = React.useState<AppSettings | null>(null)
  React.useEffect(() => {
    api.getSettings().then(setS)
  }, [])
  if (!s) return null

  const save = (next: AppSettings): void => {
    setS(next)
    api.saveSettings(next)
  }

  return (
    <div className="app-window">
      <div className="app-body">
        <section className="main">
          <header className="topbar">
            <a className="btn btn-ghost btn-icon" href="#">
              ←
            </a>
            <h1>全局设置</h1>
          </header>
          <div className="content">
            <div className="card">
              <div className="card-title">遮罩默认</div>
              <div className="row-field">
                <div className="rf-main">
                  <b>默认倒计时（秒）</b>
                </div>
                <input
                  className="input"
                  style={{ width: 90 }}
                  value={s.mask.countdownSeconds}
                  onChange={(e) =>
                    save({ ...s, mask: { ...s.mask, countdownSeconds: +e.target.value || 30 } })
                  }
                />
              </div>
              <div className="row-field">
                <div className="rf-main">
                  <b>默认自动关闭</b>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={s.mask.autoClose}
                    onChange={(e) => save({ ...s, mask: { ...s.mask, autoClose: e.target.checked } })}
                  />
                  <span className="track" />
                </label>
              </div>
              <div className="row-field">
                <div className="rf-main">
                  <b>默认背景壁纸</b>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const f = await api.pickFile('image')
                    if (f) save({ ...s, mask: { ...s.mask, backgroundImage: f } })
                  }}
                >
                  选择图片…
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-title">通用</div>
              <div className="row-field">
                <div className="rf-main">
                  <b>开机自启</b>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={s.autoStart}
                    onChange={(e) => save({ ...s, autoStart: e.target.checked })}
                  />
                  <span className="track" />
                </label>
              </div>
              <div className="row-field">
                <div className="rf-main">
                  <b>提醒音效</b>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={s.soundEnabled}
                    onChange={(e) => save({ ...s, soundEnabled: e.target.checked })}
                  />
                  <span className="track" />
                </label>
              </div>
              <div className="row-field">
                <div className="rf-main">
                  <b>默认音效</b>
                </div>
                <select
                  className="select"
                  value={s.soundFile}
                  onChange={(e) => save({ ...s, soundFile: e.target.value })}
                >
                  {BUILTIN_SOUNDS.filter((b) => b.key !== 'silent').map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
