/**
 * 判据按「配方来自不可信来源」写：越界要钳、类型不对要回落、未知形态要丢，
 * 任何垃圾输入都不许抛错；钳完的配方必须已经在安全域内（再钳一次不变）。
 */

import type { OscillatorLayer, SoundSpec } from '../src/types'
import { describe, expect, it } from 'vitest'
import { clampSpec, FREQ_MAX, FREQ_MIN, MAX_ENVELOPE_POINTS, MAX_LAYERS, MAX_TIME, specDuration } from '../src/spec'

function osc(overrides: Partial<OscillatorLayer> = {}): OscillatorLayer {
  return {
    kind: 'oscillator',
    wave: 'sine',
    frequency: [{ time: 0, value: 440 }],
    gain: [{ time: 0, value: 0.5 }],
    ...overrides,
  }
}

describe('clampSpec', () => {
  it('增益越界钳进 0..1', () => {
    const out = clampSpec({ layers: [osc({ gain: [{ time: 0, value: 5 }, { time: 0.1, value: -3 }] })] })
    const layer = out.layers[0]!
    expect(layer.gain.map(p => p.value)).toEqual([1, 0])
  })

  it('频率越界钳进可听域', () => {
    const out = clampSpec({ layers: [osc({ frequency: [{ time: 0, value: 1e9 }, { time: 0.1, value: -50 }] })] })
    const layer = out.layers[0] as OscillatorLayer
    expect(layer.frequency.map(p => p.value)).toEqual([FREQ_MAX, FREQ_MIN])
  })

  it('nan 与 infinity 回落成有限值', () => {
    const out = clampSpec({
      layers: [osc({
        gain: [{ time: Number.NaN, value: Number.POSITIVE_INFINITY }],
        delay: Number.NaN,
      })],
      space: Number.NaN,
      gain: Number.POSITIVE_INFINITY,
    })
    const layer = out.layers[0]!
    expect(layer.gain[0]).toMatchObject({ time: 0, value: 1 })
    expect(layer.delay).toBe(0)
    expect(out.space).toBe(0)
    expect(out.gain).toBe(1)
  })

  it('包络乱序排成时间升序', () => {
    const out = clampSpec({ layers: [osc({ gain: [{ time: 0.3, value: 0.1 }, { time: 0, value: 0.5 }, { time: 0.1, value: 0.2 }] })] })
    const times = out.layers[0]!.gain.map(p => p.time)
    expect(times).toEqual([0, 0.1, 0.3])
  })

  it('缺失或空的增益包络回落成单点静音', () => {
    const out = clampSpec({ layers: [osc({ gain: [] }), osc({ gain: undefined as never })] })
    for (const layer of out.layers)
      expect(layer.gain).toEqual([{ time: 0, value: 0 }])
  })

  it('层数超限截断', () => {
    const layers = Array.from({ length: MAX_LAYERS + 5 }, () => osc())
    expect(clampSpec({ layers }).layers).toHaveLength(MAX_LAYERS)
  })

  it('垃圾条目不占层数配额', () => {
    const layers = [
      ...Array.from({ length: MAX_LAYERS }, () => null as never),
      ...Array.from({ length: 3 }, () => osc()),
    ]
    expect(clampSpec({ layers }).layers).toHaveLength(3)
  })

  it('包络点数超限截断', () => {
    const gain = Array.from({ length: MAX_ENVELOPE_POINTS + 40 }, (_, i) => ({ time: i * 0.001, value: 0.2 }))
    expect(clampSpec({ layers: [osc({ gain })] }).layers[0]!.gain).toHaveLength(MAX_ENVELOPE_POINTS)
  })

  it('未知层形态丢弃、未知波形回落 sine', () => {
    const out = clampSpec({
      layers: [
        { kind: 'sampler' } as never,
        null as never,
        osc({ wave: 'wobble' as never }),
      ],
    })
    expect(out.layers).toHaveLength(1)
    expect((out.layers[0] as OscillatorLayer).wave).toBe('sine')
  })

  it('未知滤波器类型丢掉滤波、保留发声层', () => {
    const out = clampSpec({ layers: [osc({ filter: { type: 'vocoder' as never, frequency: 800 } })] })
    expect(out.layers[0]!.filter).toBeUndefined()
  })

  it('滤波器数值钳进安全域', () => {
    const out = clampSpec({ layers: [osc({ filter: { type: 'lowpass', frequency: -10, q: 1e6, gain: -999 } })] })
    const filter = out.layers[0]!.filter!
    expect(filter.frequency).toBe(FREQ_MIN)
    expect(filter.q).toBe(100)
    expect(filter.gain).toBe(-40)
  })

  it('启动偏移与包络时间钳到时长上限', () => {
    const out = clampSpec({ layers: [osc({ delay: 999, gain: [{ time: 999, value: 0.2 }] })] })
    expect(out.layers[0]!.delay).toBe(MAX_TIME)
    expect(out.layers[0]!.gain[0]!.time).toBe(MAX_TIME)
  })

  it('整体垃圾输入不抛错', () => {
    expect(() => clampSpec(null as never)).not.toThrow()
    expect(() => clampSpec(undefined as never)).not.toThrow()
    expect(() => clampSpec({} as never)).not.toThrow()
    expect(() => clampSpec({ layers: 'x' } as never)).not.toThrow()
    expect(clampSpec(null as never).layers).toEqual([])
  })

  it('钳制幂等：钳过的配方再钳一次不变', () => {
    const nasty: SoundSpec = {
      layers: [
        osc({ gain: [{ time: 0.5, value: 7 }, { time: 0, value: -1, curve: 'exp' }], delay: -2 }),
        { kind: 'noise', color: 'magenta' as never, gain: [{ time: 0, value: 2 }] },
      ],
      space: 3,
      gain: -1,
    }
    const once = clampSpec(nasty)
    expect(clampSpec(once)).toEqual(once)
  })
})

describe('specDuration', () => {
  it('取各层偏移加末点的最大值', () => {
    const spec = clampSpec({
      layers: [
        osc({ gain: [{ time: 0, value: 0.2 }, { time: 0.3, value: 0 }] }),
        osc({ delay: 0.5, gain: [{ time: 0, value: 0.2 }, { time: 0.2, value: 0 }] }),
      ],
    })
    expect(specDuration(spec)).toBeCloseTo(0.7)
  })

  it('零层配方时长为 0', () => {
    expect(specDuration({ layers: [] })).toBe(0)
  })
})
