// 生成三个内置提示音（短促正弦音，带快速衰减），输出到 src/renderer/public/sounds/
// 运行：node scripts/gen-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SR = 44100

function tone(freq, durSec, { decay = 8 } = {}) {
  const n = Math.floor(SR * durSec)
  const data = Buffer.alloc(n * 2)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const env = Math.exp(-decay * t) // 快速衰减
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.4
    data.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 32767, i * 2)
  }
  return data
}

function wav(pcm) {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(SR, 24)
  header.writeUInt32LE(SR * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

// 叮咚：两声不同音高
const ding = Buffer.concat([tone(880, 0.18), tone(1175, 0.35)])
// 水滴：高频短促
const water = tone(1500, 0.22, { decay: 16 })
// 木鱼：低频极短
const woodfish = tone(300, 0.12, { decay: 24 })

const outDir = join(process.cwd(), 'src', 'renderer', 'public', 'sounds')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'ding.wav'), wav(ding))
writeFileSync(join(outDir, 'water.wav'), wav(water))
writeFileSync(join(outDir, 'woodfish.wav'), wav(woodfish))
console.log('generated 3 sounds in', outDir)
