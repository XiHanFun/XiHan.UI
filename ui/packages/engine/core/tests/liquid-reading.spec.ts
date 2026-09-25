import { describe, expect, it } from 'vitest'
import { CROSSOVER, HYSTERESIS, lightDirection, readBackdrop, relativeLuminance, samplePoints } from '../src/visual-environment/liquid/reading'

const flat = (luminance: number, count = 6) => Array.from({ length: count }, () => ({ luminance, busy: false }))

describe('readBackdrop', () => {
  it('浅下层取浅色调，深下层取深色调；均匀且全读得到时换通透档', () => {
    expect(readBackdrop(flat(0.9), null)).toEqual({ tone: 'light', clear: true })
    expect(readBackdrop(flat(0.02), null)).toEqual({ tone: 'dark', clear: true })
  })

  it('均值落在分界 ± 滞回带里时保持上一次的色调', () => {
    const near = flat(CROSSOVER + HYSTERESIS / 2)
    expect(readBackdrop(near, 'dark')?.tone).toBe('dark')
    expect(readBackdrop(near, 'light')?.tone).toBe('light')
    expect(readBackdrop(flat(CROSSOVER + HYSTERESIS + 0.01), 'dark')?.tone).toBe('light')
  })

  it('杂乱、部分读不到、亮度跨度过大时不换通透档', () => {
    expect(readBackdrop([...flat(0.9, 5), { luminance: 0.9, busy: true }], null)?.clear).toBe(false)
    expect(readBackdrop([...flat(0.9, 5), { luminance: null, busy: true }], null)?.clear).toBe(false)
    expect(readBackdrop([...flat(0.9, 3), ...flat(0.1, 3)], null)?.clear).toBe(false)
  })

  it('一个点都读不到：判过就沿用色调、不换通透档，从没判过返回 null 留在静态形态', () => {
    const unknown = Array.from({ length: 6 }, () => ({ luminance: null, busy: true }))
    expect(readBackdrop(unknown, null)).toBeNull()
    expect(readBackdrop(unknown, 'dark')).toEqual({ tone: 'dark', clear: false })
  })
})

describe('relativeLuminance', () => {
  it('白为 1、黑为 0', () => {
    expect(relativeLuminance(1, 1, 1)).toBeCloseTo(1, 6)
    expect(relativeLuminance(0, 0, 0)).toBe(0)
  })
})

describe('采样点与光源方向', () => {
  it('部件上取 3 × 2 个点，都在部件内', () => {
    const rect = { left: 10, top: 20, width: 100, height: 40 }
    const points = samplePoints(rect)
    expect(points).toHaveLength(6)
    for (const [x, y] of points) {
      expect(x).toBeGreaterThan(10)
      expect(x).toBeLessThan(110)
      expect(y).toBeGreaterThan(20)
      expect(y).toBeLessThan(60)
    }
  })

  it('光源方向是从中心指向指针的单位向量；指针落在中心时为 null', () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 }
    expect(lightDirection(rect, 150, 50)).toEqual([1, 0])
    expect(lightDirection(rect, 0, 0)).toEqual([-0.71, -0.71])
    expect(lightDirection(rect, 50, 50)).toBeNull()
  })
})
