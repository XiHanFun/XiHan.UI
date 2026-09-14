/**
 * 判据按「内置主题是给人听的成品数据」写：三套主题覆盖全部语义名、
 * 数值本身就在安全域内（钳制不改任何一个数）、时长与峰值有上限——
 * 提示音不许变成配乐，也不许吓人。
 */

import type { SoundSpec, SoundTheme } from '../src/types'
import { describe, expect, it } from 'vitest'
import { clampSpec, FREQ_MAX, FREQ_MIN, specDuration } from '../src/spec'
import { defaultSoundTheme } from '../src/themes/default'
import { minimalSoundTheme } from '../src/themes/minimal'
import { softSoundTheme } from '../src/themes/soft'
import { BUILTIN_SOUND_NAMES } from '../src/types'

const THEMES: Array<[string, SoundTheme]> = [
  ['default', defaultSoundTheme],
  ['minimal', minimalSoundTheme],
  ['soft', softSoundTheme],
]

/** 递归比对：原值里出现过的每个数与字符串，钳制后必须原样保留。 */
function expectPreserved(original: unknown, clamped: unknown, path: string): void {
  if (typeof original === 'number' || typeof original === 'string') {
    expect(clamped, path).toBe(original)
    return
  }
  if (Array.isArray(original)) {
    expect(Array.isArray(clamped), path).toBe(true)
    expect((clamped as unknown[]).length, path).toBe(original.length)
    original.forEach((item, index) => {
      expectPreserved(item, (clamped as unknown[])[index], `${path}[${index}]`)
    })
    return
  }
  if (original && typeof original === 'object') {
    for (const [key, value] of Object.entries(original))
      expectPreserved(value, (clamped as Record<string, unknown>)[key], `${path}.${key}`)
  }
}

describe('内置主题', () => {
  it('三套主题覆盖全部内置语义名', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES)
        expect(theme[name], `${themeName}.${name}`).toBeDefined()
    }
  })

  it('每个配方都已在安全域内：钳制不改任何一个值', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = theme[name] as SoundSpec
        expectPreserved(spec, clampSpec(spec), `${themeName}.${name}`)
      }
    }
  })

  it('每个配方至少一层，总时长不超过 1.2 秒', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = clampSpec(theme[name] as SoundSpec)
        expect(spec.layers.length, `${themeName}.${name}`).toBeGreaterThan(0)
        expect(specDuration(spec), `${themeName}.${name}`).toBeLessThanOrEqual(1.2)
      }
    }
  })

  it('层峰值增益不超过 0.6，增益包络从 0 时刻开始', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = theme[name] as SoundSpec
        for (const layer of spec.layers) {
          for (const point of layer.gain)
            expect(point.value, `${themeName}.${name}`).toBeLessThanOrEqual(0.6)
          expect(layer.gain[0]!.time, `${themeName}.${name}`).toBe(0)
        }
      }
    }
  })

  it('每个声音都有一层能在小扬声器上出声', () => {
    // 笔记本与手机的内置扬声器在这条线以下几乎没有输出；
    // 低音区的层必须靠谐波（非正弦波形或噪声）才算数
    const AUDIBLE_FLOOR = 300
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = theme[name] as SoundSpec
        const audible = spec.layers.some((layer) => {
          if (layer.kind === 'noise')
            return true
          const top = Math.max(...layer.frequency.map(point => point.value))
          return layer.wave === 'sine' ? top >= AUDIBLE_FLOOR : top * 3 >= AUDIBLE_FLOOR
        })
        expect(audible, `${themeName}.${name}`).toBe(true)
      }
    }
  })

  it('minimal 主题短促：单层衰减在 0.15 秒内，整段不超过 0.3 秒，无混响', () => {
    for (const name of BUILTIN_SOUND_NAMES) {
      const spec = clampSpec(minimalSoundTheme[name] as SoundSpec)
      expect(specDuration(spec), name).toBeLessThanOrEqual(0.3)
      for (const layer of spec.layers)
        expect(layer.gain[layer.gain.length - 1]!.time, name).toBeLessThanOrEqual(0.15)
      expect(spec.space ?? 0, name).toBe(0)
    }
  })

  it('振荡器频率全部落在可听域内', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = theme[name] as SoundSpec
        for (const layer of spec.layers) {
          if (layer.kind !== 'oscillator')
            continue
          for (const point of layer.frequency) {
            expect(point.value, `${themeName}.${name}`).toBeGreaterThanOrEqual(FREQ_MIN)
            expect(point.value, `${themeName}.${name}`).toBeLessThanOrEqual(FREQ_MAX)
          }
        }
      }
    }
  })
})
