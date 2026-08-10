import { describe, expect, it } from 'vitest'
import {
  isTweenDone,
  resolveTweenEasing,
  tweenEasings,
  tweenProgress,
  tweenValueAt,
} from '../src/shared/tween'

describe('tweenProgress', () => {
  it('落在 [0,1]，两端都取得到', () => {
    expect(tweenProgress(0, 1000)).toBe(0)
    expect(tweenProgress(250, 1000)).toBe(0.25)
    expect(tweenProgress(1000, 1000)).toBe(1)
    expect(tweenProgress(5000, 1000)).toBe(1)
    expect(tweenProgress(-30, 1000)).toBe(0)
  })

  it('时长非正即刻满格：0 毫秒的动画就是"一步到位"，不是"永远走不完"', () => {
    expect(tweenProgress(0, 0)).toBe(1)
    expect(tweenProgress(0, -100)).toBe(1)
  })

  it('时长或已过时间是非有限数时按满格：卡在中途停不下来比直接收尾更糟', () => {
    expect(tweenProgress(10, Number.NaN)).toBe(1)
    expect(tweenProgress(10, Number.POSITIVE_INFINITY)).toBe(1)
    expect(tweenProgress(Number.NaN, 1000)).toBe(1)
  })
})

describe('isTweenDone', () => {
  it('走满才算走完', () => {
    expect(isTweenDone(999, 1000)).toBe(false)
    expect(isTweenDone(1000, 1000)).toBe(true)
    expect(isTweenDone(0, 0)).toBe(true)
  })
})

describe('tweenEasings', () => {
  it('每一档的两端都严格取到 0 与 1：否则起点会跳一下、终点会差一点', () => {
    for (const [name, fn] of Object.entries(tweenEasings)) {
      expect(fn(0), `${name} 在 0 处`).toBe(0)
      expect(fn(1), `${name} 在 1 处`).toBe(1)
    }
  })

  it('linear 恒等；ease-out 前段快、ease-in 前段慢', () => {
    expect(tweenEasings.linear(0.3)).toBe(0.3)
    expect(tweenEasings['ease-out'](0.3)).toBeGreaterThan(0.3)
    expect(tweenEasings['ease-in'](0.3)).toBeLessThan(0.3)
  })

  it('ease-in-out 在中点对半分', () => {
    expect(tweenEasings['ease-in-out'](0.5)).toBeCloseTo(0.5, 10)
  })
})

describe('resolveTweenEasing', () => {
  it('认不出的档位退回 linear：档位可能来自 DOM 特性，那是一个任意字符串', () => {
    expect(resolveTweenEasing(undefined)).toBe(tweenEasings.linear)
    expect(resolveTweenEasing('bounce' as never)).toBe(tweenEasings.linear)
    expect(resolveTweenEasing('ease-out')).toBe(tweenEasings['ease-out'])
  })
})

describe('tweenValueAt', () => {
  it('线性补间按比例取值', () => {
    const spec = { from: 0, to: 1000, duration: 1000 }
    expect(tweenValueAt(spec, 0)).toBe(0)
    expect(tweenValueAt(spec, 250)).toBe(250)
    expect(tweenValueAt(spec, 1000)).toBe(1000)
  })

  it('走完那一刻返回终点本身，不是按曲线算出来的近似值', () => {
    // 逐帧累出来的浮点尾巴会让最后停在 4999.999999 上，定了小数位也照样露馅
    const spec = { from: 0, to: 5000, duration: 333, easing: 'ease-in-out' as const }
    expect(tweenValueAt(spec, 333)).toBe(5000)
    expect(tweenValueAt(spec, 1e9)).toBe(5000)
  })

  it('倒着走也认：倒计时就是从剩余量补到 0', () => {
    const spec = { from: 60_000, to: 0, duration: 60_000 }
    expect(tweenValueAt(spec, 0)).toBe(60_000)
    expect(tweenValueAt(spec, 15_000)).toBe(45_000)
    expect(tweenValueAt(spec, 60_000)).toBe(0)
  })

  it('时长为 0 时第一次问就已经在终点上', () => {
    expect(tweenValueAt({ from: 3, to: 9, duration: 0 }, 0)).toBe(9)
  })

  it('端点是非有限数时不把 NaN 传下去：NaN 一路写进文本就是一个"NaN"', () => {
    expect(tweenValueAt({ from: Number.NaN, to: 20, duration: 100 }, 0)).toBe(20)
    expect(tweenValueAt({ from: 0, to: Number.NaN, duration: 100 }, 50)).toBe(0)
  })

  it('缓动只改路径不改两端', () => {
    for (const easing of ['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const) {
      const spec = { from: 10, to: 20, duration: 100, easing }
      expect(tweenValueAt(spec, 0)).toBe(10)
      expect(tweenValueAt(spec, 100)).toBe(20)
    }
  })
})
