import type { MarqueeApi, MarqueeDirection, MarqueeProps } from '../src/marquee'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectMarquee } from '../src/marquee'

function api(props: MarqueeProps = {}): MarqueeApi {
  return connectMarquee(props, normalizeProps)
}

function root(props: MarqueeProps = {}): Record<string, unknown> {
  return api(props).getRootProps() as Record<string, unknown>
}

describe('marquee 的档位', () => {
  it('缺省往左滚，方向与轴恒有值', () => {
    expect(root()['data-direction']).toBe('left')
    expect(root()['data-orientation']).toBe('horizontal')
  })

  it('轴跟着方向走：左右是横的，上下是竖的', () => {
    const axis: Record<MarqueeDirection, string> = {
      left: 'horizontal',
      right: 'horizontal',
      up: 'vertical',
      down: 'vertical',
    }
    for (const [direction, orientation] of Object.entries(axis)) {
      expect(root({ direction: direction as MarqueeDirection })['data-orientation']).toBe(orientation)
      expect(root({ direction: direction as MarqueeDirection })['data-direction']).toBe(direction)
    }
  })

  it('两个开关关掉时不输出属性', () => {
    expect(root()['data-pause-on-hover']).toBeUndefined()
    expect(root()['data-auto-fill']).toBeUndefined()
    expect(root({ pauseOnHover: false, autoFill: false })['data-auto-fill']).toBeUndefined()
    expect(root({ pauseOnHover: true, autoFill: true })['data-pause-on-hover']).toBe('')
    expect(root({ pauseOnHover: true, autoFill: true })['data-auto-fill']).toBe('')
  })

  it('铺几份由 autoFill 决定：开是两份，关是一份', () => {
    expect(api().copies).toBe(1)
    expect(api({ autoFill: false }).copies).toBe(1)
    expect(api({ autoFill: true }).copies).toBe(2)
  })
})

describe('marquee 的速度', () => {
  it('有限正数写成根上的内联变量', () => {
    expect(root({ speed: 90 }).style).toBe('--xh-marquee-speed: 90')
    expect(root({ speed: 12.5 }).style).toBe('--xh-marquee-speed: 12.5')
  })

  // 皮肤拿一份内容的长度除以速度算一圈的时长：写出 0 会让时长变成无穷，
  // 整段动画一格都不动；负数与非有限值同理，一律不写出、退回皮肤缺省。
  it('零、负数与非有限值一概不写出', () => {
    for (const speed of [0, -1, -0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined])
      expect(root({ speed }).style).toBeUndefined()
  })

  it('速度不占语义属性', () => {
    const attrs = root({ speed: 90 })
    expect(attrs['data-speed']).toBeUndefined()
    expect(attrs.role).toBeUndefined()
  })
})
