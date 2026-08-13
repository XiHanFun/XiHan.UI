// 主题定义帮助器：恒等函数只做类型收窄，外加几条把常用包络写短的工厂。

import type { EnvelopePoint, SoundSpec, SoundTheme } from '../types'

export function defineSoundTheme<T extends SoundTheme>(theme: T): T {
  return theme
}

export function defineSoundSpec(spec: SoundSpec): SoundSpec {
  return spec
}

/** 敲击型增益包络：attack 秒起音到 peak，再用 decay 秒指数衰减到无声。 */
export function strike(peak: number, attack: number, decay: number): EnvelopePoint[] {
  return [
    { time: 0, value: 0 },
    { time: attack, value: peak },
    { time: attack + decay, value: 0, curve: 'exp' },
  ]
}

/** 恒定值的单点包络。 */
export function flat(value: number): EnvelopePoint[] {
  return [{ time: 0, value }]
}

/** 两点滑音：duration 秒内从 from 指数滑到 to。 */
export function glide(from: number, to: number, duration: number): EnvelopePoint[] {
  return [
    { time: 0, value: from },
    { time: duration, value: to, curve: 'exp' },
  ]
}
