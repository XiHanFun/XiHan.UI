import { describe, expect, it } from 'vitest'
import { DEFAULT_ACTIVATION_DISTANCE, shouldActivate } from '../src'

describe('激活约束', () => {
  it('默认阈值是 5px', () => {
    expect(DEFAULT_ACTIVATION_DISTANCE).toBe(5)
  })

  it('没动不算拖', () => {
    expect(shouldActivate({ x: 0, y: 0 })).toBe(false)
  })

  it('差一点点不算，到了就算', () => {
    expect(shouldActivate({ x: 4.9, y: 0 })).toBe(false)
    expect(shouldActivate({ x: 5, y: 0 })).toBe(true)
  })

  it('两轴都不到阈值、但直线距离到了，算拖', () => {
    // 4² + 4² = 32，开方 5.66 —— 分轴比较会漏判这一格
    expect(shouldActivate({ x: 4, y: 4 })).toBe(true)
  })

  it('负方向同样算数', () => {
    expect(shouldActivate({ x: -6, y: 0 })).toBe(true)
    expect(shouldActivate({ x: 0, y: -6 })).toBe(true)
  })

  it('阈值给 0 表示按下即拖', () => {
    expect(shouldActivate({ x: 0, y: 0 }, { distance: 0 })).toBe(true)
  })

  it('负阈值按 0 处理，不会变成永不激活', () => {
    expect(shouldActivate({ x: 0, y: 0 }, { distance: -1 })).toBe(true)
  })

  it('自定阈值', () => {
    expect(shouldActivate({ x: 15, y: 0 }, { distance: 20 })).toBe(false)
    expect(shouldActivate({ x: 25, y: 0 }, { distance: 20 })).toBe(true)
  })
})
