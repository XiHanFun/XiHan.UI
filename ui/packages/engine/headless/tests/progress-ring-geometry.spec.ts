import { describe, expect, it } from 'vitest'
import { connectProgress, PROGRESS_VIEW, progressRing } from '../src/progress'

/**
 * 环的几何：这些数一变，环的粗细、朝向或缺口位置就跟着变，
 * 所以判据按「画出来是什么样」写死，不按实现写。
 */
describe('progressRing', () => {
  it('半径把线宽让在里侧，外沿正好贴住 viewBox', () => {
    expect(progressRing(0, 6, 0, 'bottom').radius).toBe(47)
    expect(progressRing(0, 12, 0, 'bottom').radius).toBe(44)
    // 100 的框、线宽 6：半径 47 加半个线宽 3 正好是 50
    expect(progressRing(0, 6, 0, 'bottom').circumference).toBe(295.31)
  })

  it('进度比例换成往回缩的长度：满值不缩，零值缩掉整段弧', () => {
    const full = progressRing(1, 6, 0, 'bottom')
    const half = progressRing(0.5, 6, 0, 'bottom')
    const none = progressRing(0, 6, 0, 'bottom')
    expect(full.offset).toBe(0)
    expect(none.offset).toBe(none.span)
    expect(half.offset).toBeCloseTo(half.span / 2, 2)
  })

  it('整环没有缺口：弧长等于周长，起笔转到 12 点', () => {
    const ring = progressRing(0.5, 6, 0, 'top')
    expect(ring.span).toBe(ring.circumference)
    expect(ring.rotation).toBe(-90)
  })

  it('仪表盘缺省缺口 75 度朝下：弧短一截，整环转过去让缺口居中', () => {
    const ring = progressRing(0.5, 6, 75, 'bottom')
    expect(ring.span).toBe(233.787)
    expect(ring.rotation).toBe(127.5)
    // 弧加缺口就是整周
    expect(ring.span + ring.circumference * 75 / 360).toBeCloseTo(ring.circumference, 2)
  })

  it('缺口朝向换一侧，整个环跟着转', () => {
    for (const [pos, rotation] of [['top', -52.5], ['right', 37.5], ['bottom', 127.5], ['left', 217.5]] as const)
      expect(progressRing(0.5, 6, 75, pos).rotation).toBe(rotation)
  })

  it('线宽与缺口越界都被夹住，画不出负半径或负弧长', () => {
    expect(progressRing(0.5, 999, 0, 'bottom').radius).toBe(PROGRESS_VIEW / 2 - 45 / 2)
    expect(progressRing(0.5, -5, 0, 'bottom').radius).toBe(PROGRESS_VIEW / 2 - 0.5 / 2)
    expect(progressRing(0.5, 6, 999, 'bottom').span).toBeGreaterThan(0)
    expect(progressRing(0.5, 6, -30, 'bottom').span).toBe(progressRing(0.5, 6, 0, 'bottom').span)
  })

  it('比例越界或不是数都按 [0,1] 收口，绝不画出反向弧', () => {
    const span = progressRing(0, 6, 0, 'bottom').span
    expect(progressRing(2, 6, 0, 'bottom').offset).toBe(0)
    expect(progressRing(-1, 6, 0, 'bottom').offset).toBe(span)
    expect(progressRing(Number.NaN, 6, 0, 'bottom').offset).toBe(span)
  })
})

describe('退化输入不许算成满进度', () => {
  const attrs = (props: Parameters<typeof connectProgress>[0]): Record<string, unknown> =>
    connectProgress(props, { element: (p: unknown) => p } as never).getRootProps() as Record<string, unknown>

  it('max 不为正或不是数时回落 100，进度不跟着爆表', () => {
    expect(attrs({ value: 50, max: 0 })['aria-valuemax']).toBe('100')
    expect(attrs({ value: 50, max: -20 })['aria-valuemax']).toBe('100')
    expect(attrs({ value: 50, max: Number.NaN })['aria-valuemax']).toBe('100')
    expect(attrs({ value: 50, max: 0 })['data-state']).toBe('loading')
  })

  it('value 不是数时按 0 处理', () => {
    expect(attrs({ value: Number.NaN })['aria-valuenow']).toBe('0')
    expect(attrs({ value: Number.NaN })['data-state']).toBe('loading')
  })
})
