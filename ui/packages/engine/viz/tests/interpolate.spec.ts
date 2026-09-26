import type { KeyedPoint, Rgba } from '../src'
import { describe, expect, it } from 'vitest'
import {
  deltaEOk,
  formatHex,
  interpolate,
  interpolateArray,
  interpolateDate,
  interpolateNumber,
  interpolateObject,
  interpolateOklab,
  interpolateOklch,
  interpolatePoints,
  interpolateRound,
  interpolateString,
  isVizError,
  parseColor,
  piecewise,
  quantize,
  toOklch,
} from '../src'
import { between, forAll, integer } from './helpers/property'

const hex = (text: string): Rgba => parseColor(text) as Rgba

describe('基础插值', () => {
  it('数值、取整与日期', () => {
    expect(interpolateNumber(10, 20)(0.25)).toBe(12.5)
    expect(interpolateNumber(10, 20)(1.5)).toBe(25)
    expect(interpolateRound(0, 10)(0.26)).toBe(3)
    const d = interpolateDate(new Date(0), new Date(1000))(0.5)
    expect(+d).toBe(500)
  })

  it('端点精确：t = 0 与 t = 1 恰是两端', () => {
    forAll(500, 61, random => ({ a: between(random, -1e6, 1e6), b: between(random, -1e6, 1e6) }), ({ a, b }) => {
      expect(interpolateNumber(a, b)(0)).toBe(a)
      expect(interpolateNumber(a, b)(1)).toBe(b)
    })
  })

  it('数组与对象按终点的形状逐项插值，只在终点有的项保持终点值', () => {
    expect(interpolateArray([0, 10], [10, 20, 30])(0.5)).toEqual([5, 15, 30])
    expect(interpolateObject({ x: 0, y: 0 }, { x: 10, y: 20, w: 4 })(0.5)).toEqual({ x: 5, y: 10, w: 4 })
  })

  it('扇区与柱的几何参数插值', () => {
    const arc = interpolate({ startAngle: 0, endAngle: 1, innerRadius: 20, outerRadius: 40 }, { startAngle: 1, endAngle: 3, innerRadius: 20, outerRadius: 60 })
    expect(arc(0.5)).toEqual({ startAngle: 0.5, endAngle: 2, innerRadius: 20, outerRadius: 50 })
  })

  it('嵌数字的字符串以终点为模板', () => {
    expect(interpolateString('translate(0, 10)', 'translate(20, 30)')(0.5)).toBe('translate(10, 20)')
    expect(interpolateString('a', 'rotate(90)')(0.5)).toBe('rotate(90)')
    expect(interpolateString('x', 'no numbers')(0.3)).toBe('no numbers')
  })

  it('两端类型不一致时报错', () => {
    try {
      interpolate(1 as never, 'a' as never)
      expect.unreachable()
    }
    catch (error) {
      expect(isVizError(error)).toBe(true)
    }
  })

  it('piecewise 均分 t，quantize 等距取样', () => {
    const through = piecewise(interpolateNumber, [0, 10, 100])
    expect(through(0.25)).toBe(5)
    expect(through(0.75)).toBe(55)
    expect(through(1)).toBe(100)
    expect(quantize(interpolateNumber(0, 1), 5)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(() => piecewise(interpolateNumber, [1])).toThrow(/两个值/)
    expect(() => quantize(interpolateNumber(0, 1), 1)).toThrow(/取样/)
  })
})

describe('颜色插值', () => {
  it('oKLab 插值的两端就是原色', () => {
    const mix = interpolateOklab(hex('#0057cb'), hex('#c96d00'))
    expect(formatHex(mix(0))).toBe('#0057cb')
    expect(formatHex(mix(1))).toBe('#c96d00')
  })

  it('oKLab 中点的明度是两端明度的平均', () => {
    const a = hex('#0057cb')
    const b = hex('#ffffff')
    expect(toOklch(interpolateOklab(a, b)(0.5)).l).toBeCloseTo((toOklch(a).l + toOklch(b).l) / 2, 3)
  })

  it('oKLCH 走最短的色相弧：350° 到 10° 经过 0° 而不是 180°', () => {
    const a = hex('oklch(0.6 0.15 350)')
    const b = hex('oklch(0.6 0.15 10)')
    const hue = toOklch(interpolateOklch(a, b)(0.5)).h
    expect(Math.min(hue, 360 - hue)).toBeLessThan(3)
  })

  it('一端是灰色时沿用另一端的色相', () => {
    const blue = hex('oklch(0.55 0.2 258)')
    const gray = hex('oklch(0.55 0 0)')
    expect(toOklch(interpolateOklch(gray, blue)(0.5)).h).toBeCloseTo(258, 0)
  })

  it('性质：相邻取样的色差随 t 平滑变化，没有跳变', () => {
    forAll(200, 67, random => ({ a: `oklch(${between(random, 0.3, 0.8)} ${between(random, 0, 0.2)} ${integer(random, 0, 359)})`, b: `oklch(${between(random, 0.3, 0.8)} ${between(random, 0, 0.2)} ${integer(random, 0, 359)})` }), ({ a, b }) => {
      const samples = quantize(interpolateOklab(hex(a), hex(b)), 21)
      const total = deltaEOk(hex(a), hex(b))
      for (let i = 1; i < samples.length; i++)
        expect(deltaEOk(samples[i - 1]!, samples[i]!)).toBeLessThanOrEqual(total / 20 + 1.5)
    })
  })
})

describe('按键对齐的点序列插值', () => {
  const p = (key: string, x: number, y: number): KeyedPoint => ({ key, x, y })

  it('两边都有的键从旧位置移到新位置', () => {
    const tween = interpolatePoints([p('a', 0, 0), p('b', 10, 10)], [p('a', 0, 20), p('b', 10, 40)])
    expect(tween(0.5).map(q => q.y)).toEqual([10, 25])
  })

  it('新增的键从相邻旧点的位置出现', () => {
    const tween = interpolatePoints([p('a', 0, 0), p('b', 10, 10)], [p('a', 0, 0), p('b', 10, 10), p('c', 20, 30)])
    const start = tween(0)
    expect(start.map(q => q.key)).toEqual(['a', 'b', 'c'])
    expect(start[2]).toMatchObject({ x: 10, y: 10 })
    expect(tween(1)[2]).toMatchObject({ x: 20, y: 30 })
  })

  it('删除的键并入相邻新点后消失，顺序保留在原前驱之后', () => {
    const tween = interpolatePoints([p('a', 0, 0), p('b', 10, 50), p('c', 20, 0)], [p('a', 0, 0), p('c', 20, 10)])
    expect(tween(0).map(q => [q.key, q.y])).toEqual([['a', 0], ['b', 50], ['c', 0]])
    const end = tween(1)
    expect(end[1]).toMatchObject({ key: 'b', x: 0, y: 0 })
  })

  it('基线与缺失标记跟着插值', () => {
    const tween = interpolatePoints(
      [{ key: 'a', x: 0, y: 10, y0: 0 }, { key: 'b', x: 1, y: 5, defined: false }],
      [{ key: 'a', x: 0, y: 20, y0: 4 }, { key: 'b', x: 1, y: 7 }],
    )
    const mid = tween(0.5)
    expect(mid[0]).toMatchObject({ y: 15, y0: 2, defined: true })
    expect(mid[1]?.defined).toBe(false)
  })

  it('横向面积的基线 x0 跟着插值', () => {
    const tween = interpolatePoints([{ key: 'a', x: 10, y: 0, x0: 0 }], [{ key: 'a', x: 30, y: 0, x0: 10 }])
    expect(tween(0.5)[0]).toMatchObject({ x: 20, x0: 5 })
  })

  it('一边为空时点在原地出现或消失', () => {
    expect(interpolatePoints([], [p('a', 3, 4)])(0)).toEqual([{ key: 'a', x: 3, y: 4, defined: true }])
    expect(interpolatePoints([p('a', 3, 4)], [])(1)).toEqual([{ key: 'a', x: 3, y: 4, defined: true }])
  })

  it('重复的键立即报错', () => {
    expect(() => interpolatePoints([p('a', 0, 0), p('a', 1, 1)], [])).toThrow(/重复/)
  })

  it('性质：t = 1 时去掉删除的键恰是新序列，t = 0 时去掉新增的键恰是旧序列', () => {
    forAll(300, 71, (random) => {
      const keys = Array.from({ length: 12 }, (_, i) => `k${i}`)
      const pick = (): KeyedPoint[] => keys.filter(() => random() < 0.6).map((key, i) => p(key, i, between(random, 0, 100)))
      return { from: pick(), to: pick() }
    }, ({ from, to }) => {
      const tween = interpolatePoints(from, to)
      const toKeys = new Set(to.map(q => q.key))
      const fromKeys = new Set(from.map(q => q.key))
      expect(tween(1).filter(q => toKeys.has(q.key)).map(q => [q.key, q.x, q.y])).toEqual(to.map(q => [q.key, q.x, q.y]))
      const start = tween(0).filter(q => fromKeys.has(q.key))
      expect(new Set(start.map(q => q.key))).toEqual(fromKeys)
      for (const q of start) {
        const original = from.find(o => o.key === q.key)!
        expect([q.x, q.y]).toEqual([original.x, original.y])
      }
    })
  })
})
