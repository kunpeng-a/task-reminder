import type { AppSettings } from './types'

export const BUILTIN_SOUNDS = [
  { key: 'ding', label: '清脆叮咚（默认）', file: 'ding.wav' },
  { key: 'water', label: '水滴', file: 'water.wav' },
  { key: 'woodfish', label: '木鱼', file: 'woodfish.wav' },
  { key: 'silent', label: '静音', file: '' },
] as const

export const DEFAULT_SETTINGS: AppSettings = {
  mask: { autoClose: true, countdownSeconds: 30, backgroundImage: '' },
  autoStart: false,
  minimizeToTray: true,
  soundEnabled: true,
  soundFile: 'ding',
}
