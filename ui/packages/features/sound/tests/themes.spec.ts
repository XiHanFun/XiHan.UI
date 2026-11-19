/**
 * 判据按「内置主题是给人听的成品数据」写：三套主题覆盖全部语义名、
 * 数值本身就在安全域内（钳制不改任何一个数）、时长与峰值有上限——
 * 提示音不许变成配乐，也不许吓人；来电与回铃循环播放，一遍之间要留出间歇。
 */

import type { BuiltinSoundName, OscillatorLayer, SoundSpec, SoundTheme } from '../src/types'
import { describe, expect, it } from 'vitest'
import { clampSpec, FREQ_MAX, FREQ_MIN, specDuration } from '../src/spec'
import { defaultSoundTheme } from '../src/themes/default'
import { minimalSoundTheme } from '../src/themes/minimal'
import { softSoundTheme } from '../src/themes/soft'
import { BUILTIN_SOUND_NAMES } from '../src/types'

/** 循环播放的语义名：一直响到有结果，时长与间歇另有判据。 */
const LOOP_NAMES: readonly BuiltinSoundName[] = ['ring', 'ringback']

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

  it('每个配方至少一层，一次性的提示音总时长不超过 1.2 秒、不带循环周期', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of BUILTIN_SOUND_NAMES) {
        const spec = clampSpec(theme[name] as SoundSpec)
        expect(spec.layers.length, `${themeName}.${name}`).toBeGreaterThan(0)
        if (LOOP_NAMES.includes(name))
          continue
        expect(specDuration(spec), `${themeName}.${name}`).toBeLessThanOrEqual(1.2)
        expect(spec.period, `${themeName}.${name}`).toBeUndefined()
      }
    }
  })

  it('来电与回铃带循环周期，一遍响完留出至少 0.5 秒间歇', () => {
    for (const [themeName, theme] of THEMES) {
      for (const name of LOOP_NAMES) {
        const spec = clampSpec(theme[name] as SoundSpec)
        expect(spec.period, `${themeName}.${name}`).toBeDefined()
        expect(spec.period! - specDuration(spec), `${themeName}.${name}`).toBeGreaterThanOrEqual(0.5)
      }
    }
  })

  it('default 与 soft 的来电与回铃是长音：一遍至少响 1 秒', () => {
    for (const [themeName, theme] of THEMES) {
      if (themeName === 'minimal')
        continue
      for (const name of LOOP_NAMES)
        expect(specDuration(clampSpec(theme[name] as SoundSpec)), `${themeName}.${name}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('收到消息与站内通知听得出区别：两声都有，消息上挑、通知下行', () => {
    for (const [themeName, theme] of THEMES) {
      // 按起音先后排出每一声的落点音高；同一时刻起音的取最响的那层（泛音层不算一声）
      const contour = (name: 'notification' | 'receive'): number[] => {
        const loudest = new Map<number, OscillatorLayer>()
        for (const layer of (theme[name] as SoundSpec).layers) {
          if (layer.kind !== 'oscillator')
            continue
          const peak = (item: OscillatorLayer): number => Math.max(...item.gain.map(point => point.value))
          const onset = layer.delay ?? 0
          const current = loudest.get(onset)
          if (!current || peak(layer) > peak(current))
            loudest.set(onset, layer)
        }
        return [...loudest.entries()]
          .sort(([a], [b]) => a - b)
          .map(([, layer]) => layer.frequency.at(-1)!.value)
      }
      const receive = contour('receive')
      const notification = contour('notification')
      if (themeName === 'minimal') {
        // 极简主题：消息一声下滑，通知两声上行
        expect(receive, themeName).toHaveLength(1)
        expect(notification.at(-1)!, themeName).toBeGreaterThan(notification[0]!)
        continue
      }
      expect(receive.at(-1)!, themeName).toBeGreaterThan(receive[0]!)
      expect(notification[1]!, themeName).toBeLessThan(notification[0]!)
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
