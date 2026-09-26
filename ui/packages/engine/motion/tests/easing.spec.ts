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

  it('认不出的写法报错，消息里带原文与可用写法', () => {
    expect(() => resolveEasing('wobble(3)')).toThrow(TypeError)
    expect(() => resolveEasing('wobble(3)')).toThrow(/wobble\(3\).*easeOut.*cubic-bezier\(\)/)
    expect(() => resolveEasing('')).toThrow(TypeError)
  })

  it('名字只认表里自有的键，原型上的属性名不算', () => {
    expect(() => resolveEasing('toString')).toThrow(TypeError)
    expect(() => resolveEasing('constructor')).toThrow(TypeError)
  })

  it('既不是字符串也不是函数的值报错', () => {
    expect(() => resolveEasing(3 as never)).toThrow(TypeError)
    expect(() => resolveEasing(null as never)).toThrow(TypeError)
  })

  it('linear 与缺省都是线性，进度钳制到 [0,1]', () => {
    for (const fn of [resolveEasing('linear'), resolveEasing(undefined)]) {
      expect(fn(0.3)).toBe(0.3)
      expect(fn(-1)).toBe(0)
      expect(fn(9)).toBe(1)
      expect(fn(Number.NaN)).toBe(0)
    }
  })

  it('不合 CSS 语法的 cubic-bezier 报错：分量个数、非数字、带单位、x 越出 [0,1]、函数名后有空格', () => {
    for (const text of [
      'cubic-bezier(0, 0, 1)',
      'cubic-bezier(a, b, c, d)',
      'cubic-bezier(0.2px, 0, 0, 1)',
      'cubic-bezier(1.2, 0, 0, 1)',
      'cubic-bezier(0, 0, -0.1, 1)',
      'cubic-bezier (0, 0, 1, 1)',
    ])
      expect(() => resolveEasing(text), text).toThrow(TypeError)
  })

  it('cubic-bezier 的 y 分量可以越界，用来写过冲', () => {
    expect(resolveEasing('cubic-bezier(0.34, 1.56, 0.64, 1)')(0.5)).toBeCloseTo(resolveEasing('outBack')(0.5), 10)
  })

  it('ease 一族关键字按 CSS 规范的控制点取值，不分大小写', () => {
    expect(resolveEasing('ease')(0.5)).toBeCloseTo(cubicBezier(0.25, 0.1, 0.25, 1)(0.5), 10)
    expect(resolveEasing('ease-in')(0.5)).toBeCloseTo(cubicBezier(0.42, 0, 1, 1)(0.5), 10)
    expect(resolveEasing('ease-out')(0.5)).toBeCloseTo(cubicBezier(0, 0, 0.58, 1)(0.5), 10)
    expect(resolveEasing('ease-in-out')(0.5)).toBeCloseTo(cubicBezier(0.42, 0, 0.58, 1)(0.5), 10)
    expect(resolveEasing(' EASE-OUT ')(0.3)).toBeCloseTo(resolveEasing('ease-out')(0.3), 10)
    // CSS 关键字与同名意思的命名缓动是两条曲线
    expect(resolveEasing('ease-out')(0.3)).not.toBeCloseTo(resolveEasing('easeOut')(0.3), 3)
  })

  it('steps() 按 CSS 的阶跃规则：缺省 jump-end，start / end 是 jump-start / jump-end 的别名', () => {
    const end = resolveEasing('steps(4)')
    expect([0, 0.24, 0.25, 0.99, 1].map(end)).toEqual([0, 0, 0.25, 0.75, 1])
    const start = resolveEasing('steps(4, jump-start)')
    expect([0, 0.5, 1].map(start)).toEqual([0.25, 0.75, 1])
    expect([0, 0.5, 1].map(resolveEasing('steps(4, start)'))).toEqual([0.25, 0.75, 1])
    expect([0, 0.99, 1].map(resolveEasing('steps(4, end)'))).toEqual([0, 0.75, 1])
    const none = resolveEasing('steps(4, jump-none)')
    expect([0, 0.25, 0.5, 1].map(none)).toEqual([0, 1 / 3, 2 / 3, 1])
    const both = resolveEasing('steps(4, jump-both)')
    expect([0, 0.5, 1].map(both)).toEqual([0.2, 0.6, 1])
  })

  it('step-start / step-end 是单段阶跃', () => {
    expect([0, 0.5, 1].map(resolveEasing('step-start'))).toEqual([1, 1, 1])
    expect([0, 0.99, 1].map(resolveEasing('step-end'))).toEqual([0, 0, 1])
  })

  it('不合 CSS 语法的 steps() 报错：段数须为正整数，jump-none 至少两段，位置只认规范里的六个词', () => {
    for (const text of ['steps(0)', 'steps(-2)', 'steps(2.5)', 'steps(1, jump-none)', 'steps(3, sideways)', 'steps()', 'steps(2, end, end)'])
      expect(() => resolveEasing(text), text).toThrow(TypeError)
  })

  it('linear() 在停靠点之间逐段插值，缺了输入位的在前后已知位之间等分', () => {
    const fn = resolveEasing('linear(0, 0.25, 1)')
    expect(fn(0.25)).toBeCloseTo(0.125, 10)
    expect(fn(0.75)).toBeCloseTo(0.625, 10)
    expect(fn(1)).toBe(1)
  })

  it('linear() 的停靠点可带两个输入位，拉出一段平台', () => {
    const fn = resolveEasing('linear(0, 0.5 25% 75%, 1)')
    expect(fn(0.125)).toBeCloseTo(0.25, 10)
    expect(fn(0.5)).toBeCloseTo(0.5, 10)
    expect(fn(0.875)).toBeCloseTo(0.75, 10)
  })

  it('linear() 的输入位比前面小时抬到前面最大的那个', () => {
    const fn = resolveEasing('linear(0, 1 50%, 0.5 20%, 1)')
    expect(fn(0.25)).toBeCloseTo(0.5, 10)
    expect(fn(0.5)).toBeCloseTo(0.5, 10)
    expect(fn(0.75)).toBeCloseTo(0.75, 10)
  })

  it('linear() 在首末停靠点之外沿最近两点外推', () => {
    const fn = resolveEasing('linear(0 20%, 1 80%)')
    expect(fn(0.1)).toBeCloseTo(-1 / 6, 10)
    expect(fn(0.9)).toBeCloseTo(7 / 6, 10)
  })

  it('不合 CSS 语法的 linear() 报错：少于两个停靠点、停靠点缺输出值、输入位超过两个或被输出值隔开', () => {
    for (const text of ['linear()', 'linear(1)', 'linear(0, 50%, 1)', 'linear(0, 0.5 10% 20% 30%, 1)', 'linear(0, 10% 0.5 20%, 1)', 'linear(0, 0.5 10px, 1)'])
      expect(() => resolveEasing(text), text).toThrow(TypeError)
  })

  it('toLinearEasing 的产出能原样读回，逐点贴合原曲线', () => {
    const curve = cubicBezier(0.4, 0, 0.2, 1)
    const back = resolveEasing(toLinearEasing(curve, 60))
    for (let i = 0; i <= 20; i++)
      expect(back(i / 20)).toBeCloseTo(curve(i / 20), 2)
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
