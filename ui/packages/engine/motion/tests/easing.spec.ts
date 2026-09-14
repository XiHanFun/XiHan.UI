import { describe, expect, it } from 'vitest'
import { cubicBezier, easing, resolveEasing, toLinearEasing } from '../src/easing'

describe('cubicBezier', () => {
  it('两端严格取到 0 与 1', () => {
    const fn = cubicBezier(0.4, 0, 0.2, 1)
    expect(fn(0)).toBe(0)
    expect(fn(1)).toBe(1)
  })

  it('越界与非有限的进度按两端处理', () => {
    const fn = cubicBezier(0.4, 0, 0.2, 1)
    expect(fn(-1)).toBe(0)
    expect(fn(2)).toBe(1)
    expect(fn(Number.NaN)).toBe(0)
    expect(fn(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('对角线控制点退化成恒等映射', () => {
    const fn = cubicBezier(0.25, 0.25, 0.75, 0.75)
    for (const t of [0.1, 0.3, 0.5, 0.9])
      expect(fn(t)).toBeCloseTo(t, 6)
  })

  it('单调递增，且反解出的 x 与给定进度一致', () => {
    // 独立于实现验证：对每个 t 取 y，再用贝塞尔定义正向算一遍 x(s)，两者应对得上
    const [x1, y1, x2, y2] = [0.4, 0, 0.2, 1]
    const fn = cubicBezier(x1, y1, x2, y2)
    const bezier = (s: number, a: number, b: number): number =>
      3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s * s * b + s ** 3

    let previous = -1
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const y = fn(t)
      expect(y).toBeGreaterThanOrEqual(previous)
      previous = y

      // 在 [0,1] 上找出 x(s) === t 的 s，比对 y(s)
      let lo = 0
      let hi = 1
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2
        if (bezier(mid, x1, x2) < t)
          lo = mid
        else hi = mid
      }
      expect(y).toBeCloseTo(bezier((lo + hi) / 2, y1, y2), 4)
    }
  })

  it('ease-out 型曲线在中点高于线性', () => {
    expect(cubicBezier(0, 0, 0.2, 1)(0.5)).toBeGreaterThan(0.5)
  })

  it('ease-in 型曲线在中点低于线性', () => {
    expect(cubicBezier(0.4, 0, 1, 1)(0.5)).toBeLessThan(0.5)
  })

  it('非有限的控制点按 0 处理，不产出 NaN', () => {
    const fn = cubicBezier(Number.NaN, Number.POSITIVE_INFINITY, 0.5, 0.5)
    for (let i = 0; i <= 10; i++)
      expect(Number.isFinite(fn(i / 10))).toBe(true)
  })
})

describe('resolveEasing', () => {
  it('认名字', () => {
    expect(resolveEasing('easeOut')(0.5)).toBeCloseTo(cubicBezier(0, 0, 0.2, 1)(0.5), 6)
  })

  it('认 cubic-bezier 字符串', () => {
    expect(resolveEasing('cubic-bezier(0, 0, 0.2, 1)')(0.5)).toBeCloseTo(resolveEasing('easeOut')(0.5), 6)
  })

  it('函数原样返回', () => {
    const fn = (t: number): number => t * 2
    expect(resolveEasing(fn)).toBe(fn)
  })

  it('认不出的写法退回线性并钳制到 [0,1]', () => {
    const fn = resolveEasing('wobble(3)')
    expect(fn(0.25)).toBe(0.25)
    expect(fn(-1)).toBe(0)
    expect(fn(9)).toBe(1)
    expect(fn(Number.NaN)).toBe(0)
  })

  it('linear 与缺省都是线性', () => {
    expect(resolveEasing('linear')(0.3)).toBe(0.3)
    expect(resolveEasing(undefined)(0.3)).toBe(0.3)
  })

  it('分量个数不对的 cubic-bezier 退回线性', () => {
    expect(resolveEasing('cubic-bezier(0, 0, 1)')(0.4)).toBe(0.4)
    expect(resolveEasing('cubic-bezier(a, b, c, d)')(0.4)).toBe(0.4)
  })

  it('同一串重复解析返回同一个函数', () => {
    expect(resolveEasing('cubic-bezier(0.1, 0.2, 0.3, 0.4)')).toBe(resolveEasing('cubic-bezier(0.1, 0.2, 0.3, 0.4)'))
  })
})

describe('命名缓动表', () => {
  it('除 linear 外都是 cubic-bezier 串', () => {
    for (const [name, value] of Object.entries(easing)) {
      if (name === 'linear')
        expect(value).toBe('linear')
      else expect(value).toMatch(/^cubic-bezier\([^)]*\)$/)
    }
  })
})

describe('toLinearEasing', () => {
  it('产出 linear() 串，首尾贴合曲线两端', () => {
    const text = toLinearEasing(t => t, 5)
    expect(text).toBe('linear(0, 0.25, 0.5, 0.75, 1)')
  })

  it('采样点数钳制到 [2,100]', () => {
    expect(toLinearEasing(t => t, 1).split(',')).toHaveLength(2)
    expect(toLinearEasing(t => t, 999).split(',')).toHaveLength(100)
    expect(toLinearEasing(t => t, Number.NaN).split(',')).toHaveLength(24)
  })

  it('过冲值原样保留，不被钳到 1', () => {
    expect(toLinearEasing(t => t * 1.5, 3)).toContain('1.5')
  })

  it('非有限的采样值落成 0', () => {
    expect(toLinearEasing(() => Number.NaN, 2)).toBe('linear(0, 0)')
  })
})
