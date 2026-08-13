// 配方钳制：把不可信的数值收进安全域。配方常来自调音界面或持久化配置，
// 一个坏值不该炸掉播放、也不该产出刺耳或超长的声音——越界钳住、类型不对回落，不抛错。

import type { EnvelopePoint, FilterSpec, SoundLayer, SoundSpec } from './types'

/** 包络时间上限（秒）。UI 音效超过它就不再是提示而是配乐。 */
export const MAX_TIME = 4
/** 单份配方的发声层上限。 */
export const MAX_LAYERS = 16
/** 单条包络的控制点上限。 */
export const MAX_ENVELOPE_POINTS = 64
export const FREQ_MIN = 1
export const FREQ_MAX = 20000
/** 指数 ramp 不接受 0，用它作零的替身。 */
export const EPSILON = 1e-4

const WAVES = ['sine', 'square', 'sawtooth', 'triangle'] as const
const FILTER_TYPES = ['lowpass', 'highpass', 'bandpass', 'notch', 'peaking'] as const

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  // Infinity 带方向，钳到边界；NaN 与非数字没有方向，回落默认
  const n = typeof value === 'number' && !Number.isNaN(value) ? value : fallback
  return Math.min(max, Math.max(min, n))
}

function clampEnvelope(points: EnvelopePoint[] | undefined, min: number, max: number): EnvelopePoint[] {
  if (!Array.isArray(points) || points.length === 0)
    return [{ time: 0, value: min }]
  return points
    .slice(0, MAX_ENVELOPE_POINTS)
    .map((point) => {
      const out: EnvelopePoint = {
        time: clamp(point?.time, 0, MAX_TIME, 0),
        value: clamp(point?.value, min, max, min),
      }
      if (point?.curve === 'exp')
        out.curve = 'exp'
      return out
    })
    .sort((a, b) => a.time - b.time)
}

function clampFilter(filter: FilterSpec | undefined): FilterSpec | undefined {
  if (!filter || typeof filter !== 'object')
    return undefined
  if (!FILTER_TYPES.includes(filter.type))
    return undefined
  const out: FilterSpec = {
    type: filter.type,
    frequency: Array.isArray(filter.frequency)
      ? clampEnvelope(filter.frequency, FREQ_MIN, FREQ_MAX)
      : clamp(filter.frequency, FREQ_MIN, FREQ_MAX, 1000),
  }
  if (typeof filter.q === 'number' && Number.isFinite(filter.q))
    out.q = clamp(filter.q, 0.0001, 100, 1)
  if (typeof filter.gain === 'number' && Number.isFinite(filter.gain))
    out.gain = clamp(filter.gain, -40, 40, 0)
  return out
}

/** 返回收进安全域的配方副本：越界钳制、未知形态丢弃、缺失回落，绝不抛错。 */
export function clampSpec(spec: SoundSpec): SoundSpec {
  // 上限按收下的合法层计数：垃圾条目不该占掉后面合法层的配额
  const rawLayers = Array.isArray(spec?.layers) ? spec.layers.slice(0, MAX_LAYERS * 4) : []
  const layers: SoundLayer[] = []
  for (const raw of rawLayers) {
    if (layers.length >= MAX_LAYERS)
      break
    if (!raw || typeof raw !== 'object')
      continue
    const delay = clamp(raw.delay ?? 0, 0, MAX_TIME, 0)
    const gain = clampEnvelope(raw.gain, 0, 1)
    const filter = clampFilter(raw.filter)
    if (raw.kind === 'oscillator') {
      const layer: SoundLayer = {
        kind: 'oscillator',
        wave: WAVES.includes(raw.wave) ? raw.wave : 'sine',
        frequency: clampEnvelope(raw.frequency, FREQ_MIN, FREQ_MAX),
        gain,
        delay,
      }
      if (filter)
        layer.filter = filter
      layers.push(layer)
    }
    else if (raw.kind === 'noise') {
      const layer: SoundLayer = {
        kind: 'noise',
        color: raw.color === 'pink' ? 'pink' : 'white',
        gain,
        delay,
      }
      if (filter)
        layer.filter = filter
      layers.push(layer)
    }
  }
  return {
    layers,
    space: clamp(spec?.space ?? 0, 0, 1, 0),
    gain: clamp(spec?.gain ?? 1, 0, 1, 1),
  }
}

/** 配方总时长（秒）：各层启动偏移加上其增益包络最后一点。 */
export function specDuration(spec: SoundSpec): number {
  let end = 0
  for (const layer of spec.layers) {
    const last = layer.gain[layer.gain.length - 1]
    end = Math.max(end, (layer.delay ?? 0) + (last ? last.time : 0))
  }
  return end
}
