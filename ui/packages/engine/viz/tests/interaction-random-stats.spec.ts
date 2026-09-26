// 缩放与刷选的窗口数学、种子随机与抖动、统计布局（瀑布、箱线、核密度、回归、移动平均）。
import { describe, expect, it } from 'vitest'
import {
  boxplotStats,
  clampWindow,
  createRandom,
  domainToWindow,
  FULL_WINDOW,
  hashSeed,
  indexRangeToWindow,
  isFullWindow,
  isVizError,
  jitter,
  kde,
  linearRegression,
  movingAverage,
  pan,
  pixelsToWindow,
  silvermanBandwidth,
  waterfall,
  windowToDomain,
  windowToIndexRange,
  zoomAt,
} from '../src'

describe('窗口', () => {
  it('以锚点为中心缩放：锚点对着的定义域值不动', () => {
    const w = zoomAt(FULL_WINDOW, 0.25, 2)
    expect(w.end - w.start).toBeCloseTo(0.5)
    // 缩放前锚点在 0.25 处，缩放后窗口里 0.25 处仍是 0.25
    expect(w.start + (w.end - w.start) * 0.25).toBeCloseTo(0.25)
  })

  it('性质：连续放大再同倍缩小回到原窗口（不碰边界时）', () => {
    const w = { start: 0.3, end: 0.6 }
    for (const anchor of [0, 0.2, 0.5, 0.9]) {
      const back = zoomAt(zoomAt(w, anchor, 1.7), anchor, 1 / 1.7)
      expect(back.start).toBeCloseTo(w.start, 9)
      expect(back.end).toBeCloseTo(w.end, 9)
    }
  })

  it('跨度夹在界限内，窗口始终在 [0, 1] 里', () => {
    const narrow = zoomAt({ start: 0.5, end: 0.51 }, 0.5, 100)
    expect(narrow.end - narrow.start).toBeCloseTo(0.01)
    const wide = zoomAt({ start: 0.9, end: 1 }, 1, 0.01)
    expect(wide).toEqual(FULL_WINDOW)
    expect(isFullWindow(wide)).toBe(true)
    const edge = zoomAt({ start: 0.8, end: 1 }, 0, 0.5)
    expect(edge.end).toBeLessThanOrEqual(1)
    expect(edge.start).toBeGreaterThanOrEqual(0)
    expect(edge.end - edge.start).toBeCloseTo(0.4)
  })

  it('平移按窗口跨度的倍数挪，到头停住、跨度不变', () => {
    expect(pan({ start: 0.2, end: 0.4 }, 1)).toEqual({ start: 0.4, end: 0.6000000000000001 })
    const end = pan({ start: 0.7, end: 0.9 }, 5)
    expect(end.end).toBe(1)
    expect(end.end - end.start).toBeCloseTo(0.2)
    expect(clampWindow({ start: -0.1, end: 0.2 })).toEqual({ start: 0, end: 0.30000000000000004 })
  })

  it('窗口与连续轴定义域互换：线性与对数', () => {
    expect(windowToDomain({ start: 0.25, end: 0.5 }, [0, 200])).toEqual([50, 100])
    const log = windowToDomain({ start: 0, end: 0.5 }, [1, 100], 'log')
    expect(log[1]).toBeCloseTo(10)
    const w = domainToWindow([10, 100], [1, 100], 'log')
    expect(w.start).toBeCloseTo(0.5)
    expect(w.end).toBeCloseTo(1)
    // 性质：定义域 → 窗口 → 定义域 不变
    const round = windowToDomain(domainToWindow([30, 70], [0, 100]), [0, 100])
    expect(round[0]).toBeCloseTo(30)
    expect(round[1]).toBeCloseTo(70)
  })

  it('类目轴的窗口取整到类目边界：露出一小截也算', () => {
    expect(windowToIndexRange({ start: 0.25, end: 0.5 }, 8)).toEqual([2, 3])
    expect(windowToIndexRange({ start: 0.26, end: 0.51 }, 8)).toEqual([2, 4])
    expect(windowToIndexRange(FULL_WINDOW, 8)).toEqual([0, 7])
    expect(indexRangeToWindow(2, 3, 8)).toEqual({ start: 0.25, end: 0.5 })
  })

  it('像素区间换成窗口：纵轴像素自下而上也得到 start ≤ end', () => {
    expect(pixelsToWindow([100, 50], [200, 0])).toEqual({ start: 0.5, end: 0.75 })
  })

  it('非法输入立即报错', () => {
    const thrown = (fn: () => unknown): boolean => {
      try {
        fn()
        return false
      }
      catch (error) {
        return isVizError(error)
      }
    }
    expect(thrown(() => zoomAt(FULL_WINDOW, 0.5, 0))).toBe(true)
    expect(thrown(() => zoomAt({ start: 0.6, end: 0.4 }, 0.5, 2))).toBe(true)
    expect(thrown(() => zoomAt(FULL_WINDOW, 0.5, 2, { minSpan: 0.5, maxSpan: 0.2 }))).toBe(true)
    expect(thrown(() => domainToWindow([1, 2], [5, 5]))).toBe(true)
  })
})

describe('种子随机', () => {
  it('同一个种子给出同一串数，都落在 [0, 1)', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    const xs = Array.from({ length: 1000 }, () => a())
    expect(xs).toEqual(Array.from({ length: 1000 }, () => b()))
    expect(xs.every(x => x >= 0 && x < 1)).toBe(true)
    // 分布大致均匀：均值接近 0.5
    expect(xs.reduce((s, x) => s + x, 0) / xs.length).toBeGreaterThan(0.45)
    expect(xs.reduce((s, x) => s + x, 0) / xs.length).toBeLessThan(0.55)
  })

  it('抖动以身份为种子：同一个身份永远落在同一处，偏移在幅度一半以内', () => {
    expect(jitter('周一:3', 20)).toBe(jitter('周一:3', 20))
    expect(jitter('周一:3', 20)).not.toBe(jitter('周一:4', 20))
    for (const id of ['a', 'b', 'c', 'd', 'e'])
      expect(Math.abs(jitter(id, 10))).toBeLessThanOrEqual(5)
    expect(jitter('a', 0)).toBe(0)
    expect(hashSeed('')).toBe(0x811C9DC5)
  })
})

describe('统计布局', () => {
  it('瀑布：普通一步接在累计值上，小计从 0 画到累计值，缺失一步不画也不改累计', () => {
    const steps = waterfall([100, -30, null, 50, 0], [false, false, false, false, true])
    expect(steps[0]).toMatchObject({ base: 0, end: 100, trend: 'rise' })
    expect(steps[1]).toMatchObject({ base: 100, end: 70, value: -30, trend: 'fall' })
    expect(steps[2]).toBeNull()
    expect(steps[3]).toMatchObject({ base: 70, end: 120 })
    expect(steps[4]).toMatchObject({ base: 0, end: 120, value: 120, total: true })
  })

  it('箱线：R-7 四分位，须线到 1.5 倍四分距以内最远的点，其外是离群点', () => {
    const stats = boxplotStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 100, null])!
    expect(stats.count).toBe(10)
    expect(stats.q1).toBeCloseTo(3.25)
    expect(stats.median).toBeCloseTo(5.5)
    expect(stats.q3).toBeCloseTo(7.75)
    expect(stats.highWhisker).toBe(9)
    expect(stats.lowWhisker).toBe(1)
    expect(stats.outliers).toEqual([100])
    expect(boxplotStats([])).toBeNull()
  })

  it('核密度：密度曲线下的面积约为 1；带宽缺省按 Silverman', () => {
    const data = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    const points = kde(data, { points: 200 })
    const step = points[1]!.value - points[0]!.value
    const area = points.reduce((s, p) => s + p.density * step, 0)
    expect(area).toBeGreaterThan(0.9)
    expect(area).toBeLessThan(1.05)
    expect(silvermanBandwidth(data)).toBeGreaterThan(0)
    expect(silvermanBandwidth([2, 2, 2])).toBe(1)
  })

  it('线性回归：完美直线 r² = 1，x 全相等时没有回归线', () => {
    const fit = linearRegression([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }, { x: null, y: 9 }])!
    expect(fit.slope).toBeCloseTo(2)
    expect(fit.intercept).toBeCloseTo(1)
    expect(fit.r2).toBeCloseTo(1)
    expect(fit.predict(10)).toBeCloseTo(21)
    expect(linearRegression([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull()
  })

  it('移动平均：尾随窗口，凑不满窗口或窗口里全缺失时为 null', () => {
    expect(movingAverage([1, 2, 3, 4, null, null, 7], 3)).toEqual([null, null, 2, 3, 3.5, 4, 7])
    expect(movingAverage([null, null], 2)).toEqual([null, null])
  })
})
