import React from 'react'
import { api } from '../api'
import type { MaskPayload } from '../../../shared/types'

function localFileUrl(p: string): string {
  // 本地绝对路径 → file:// URL，并对中文/空格做 encode，否则加载失败
  return encodeURI(`file://${p.replace(/\\/g, '/')}`)
}

function soundUrl(soundFile: string): string | null {
  if (!soundFile) return null
  if (soundFile.startsWith('builtin:')) return `./sounds/${soundFile.slice('builtin:'.length)}`
  return localFileUrl(soundFile)
}

export function Mask(): React.JSX.Element | null {
  const [p, setP] = React.useState<MaskPayload | null>(null)
  const [remain, setRemain] = React.useState(0)
  const [clock, setClock] = React.useState('')

  React.useEffect(
    () =>
      api.onMaskShow((payload) => {
        const pl = payload as MaskPayload
        setP(pl)
        setRemain(pl.countdownSeconds)
        if (pl.soundEnabled) {
          const u = soundUrl(pl.soundFile)
          if (u) {
            const a = new Audio(u)
            a.play().catch(() => {})
          }
        }
      }),
    []
  )

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleString('zh-CN')), 1000)
    return () => clearInterval(t)
  }, [])

  React.useEffect(() => {
    if (!p || !p.autoClose) return
    if (remain <= 0) {
      api.maskClose()
      return
    }
    const t = setTimeout(() => setRemain((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [p, remain])

  if (!p) return null
  const pct = p.countdownSeconds ? (remain / p.countdownSeconds) * 100 : 0
  const bg = p.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(8,9,12,.74),rgba(8,9,12,.82)), url("${localFileUrl(p.backgroundImage)}")`
      }
    : undefined

  return (
    <section className={`mask ${p.backgroundImage ? 'bg-wallpaper' : ''}`} style={bg}>
      <div className="mask-inner">
        <span className="pill-trigger">
          <span className="dot" />
          {p.typeLabel}
        </span>
        <h1>{p.name}</h1>
        {p.description && <p className="desc">{p.description}</p>}
        <div className="clock">{clock}</div>
        <div>
          <button className="btn-know" onClick={() => api.maskClose()}>
            知道了
          </button>
          <button className="btn-snooze" onClick={() => api.maskSnooze(p.taskId)}>
            稍后提醒 · 5 分钟
          </button>
        </div>
      </div>
      {p.autoClose && (
        <div className="countbar-wrap">
          <div className="countbar-row">
            <span className="count-lbl">自动关闭</span>
            <div className="countbar">
              <i style={{ width: `${pct}%` }} />
            </div>
            <span className="count-num num">{remain}s</span>
          </div>
        </div>
      )}
    </section>
  )
}
