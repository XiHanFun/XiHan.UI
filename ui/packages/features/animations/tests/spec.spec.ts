// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { clampSpec, DEFAULT_DURATION, MAX_DURATION, MAX_FRAMES, reverseSpec, toKeyframes } from '../src/spec'

function element(direction = 'ltr'): HTMLElement {
  const el = document.createElement('div')
  el.style.direction = direction
  document.body.append(el)
  return el
}

describe('clampSpec', () => {
  it('缺省时长补上', () => {
    expect(clampSpec({ frames: [{}] }).duration).toBe(DEFAULT_DURATION)
  })

  it('非有限或负的时长退回缺省', () => {
    expect(clampSpec({ frames: [{}], duration: Number.NaN }).duration).toBe(DEFAULT_DURATION)
    expect(clampSpec({ frames: [{}], duration: -100 }).duration).toBe(0)
    expect(clampSpec({ frames: [{}], duration: 1e9 }).duration).toBe(MAX_DURATION)
  })

  it('空帧补一帧空帧，不把空数组交给宿主', () => {
    expect(clampSpec({ frames: [] }).frames).toEqual([{}])
  })

  it('帧数超上限时截断', () => {
    const frames = Array.from({ length: 200 }, () => ({ opacity: 1 }))
    expect(clampSpec({ frames }).frames).toHaveLength(MAX_FRAMES)
  })

  it('不透明度钳到 [0,1]', () => {
    expect(clampSpec({ frames: [{ opacity: -3 }, { opacity: 9 }] }).frames).toEqual([{ opacity: 0 }, { opacity: 1 }])
  })

  it('缩放与模糊不为负', () => {
    expect(clampSpec({ frames: [{ scale: -2, blur: -5 }] }).frames[0]).toEqual({ scale: 0, blur: 0 })
  })

  it('越界或非有限的偏移量丢弃，交给等分', () => {
    expect(clampSpec({ frames: [{ offset: -1 }, { offset: 2 }, { offset: Number.NaN }] }).frames)
      .toEqual([{}, {}, {}])
  })

  it('非有限的位移丢弃，字符串原样保留', () => {
    expect(clampSpec({ frames: [{ x: Number.NaN, y: '100%' }] }).frames[0]).toEqual({ y: '100%' })
  })

  it('无限次播放保留，其余次数钳到 [0,1000]', () => {
    expect(clampSpec({ frames: [{}], iterations: Number.POSITIVE_INFINITY }).iterations).toBe(Number.POSITIVE_INFINITY)
    expect(clampSpec({ frames: [{}], iterations: -5 }).iterations).toBe(0)
    expect(clampSpec({ frames: [{}], iterations: 1e6 }).iterations).toBe(1000)
  })

  it('不改原配方', () => {
    const spec = { frames: [{ opacity: 5 }], duration: -1 }
    clampSpec(spec)
    expect(spec).toEqual({ frames: [{ opacity: 5 }], duration: -1 })
  })
})

describe('toKeyframes', () => {
  it('只有一帧声明的属性，其余帧补中性值', () => {
    // scale 只出现在末帧；若不补，宿主会拿元素当前计算值当起点
    expect(toKeyframes({ frames: [{ opacity: 0 }, { opacity: 1, scale: 1 }] })).toEqual([
      { opacity: '0', scale: '1' },
      { opacity: '1', scale: '1' },
    ])
  })

  it('没人声明的属性一个都不出现', () => {
    expect(toKeyframes({ frames: [{ opacity: 0 }, { opacity: 1 }] })).toEqual([
      { opacity: '0' },
      { opacity: '1' },
    ])
  })

  it('位移合成 translate，数字按 px', () => {
    expect(toKeyframes({ frames: [{ x: 4, y: -8 }, { x: 0, y: 0 }] })).toEqual([
      { translate: '4px -8px' },
      { translate: '0px 0px' },
    ])
  })

  it('字符串位移原样透传', () => {
    expect(toKeyframes({ frames: [{ x: '100%' }, { x: 0 }] })[0]).toEqual({ translate: '100% 0px' })
  })

  it('旋转带单位，模糊落到 filter', () => {
    expect(toKeyframes({ frames: [{ rotate: -12, blur: 8 }, { rotate: 0, blur: 0 }] })[0])
      .toEqual({ rotate: '-12deg', filter: 'blur(8px)' })
  })

  it('偏移量与逐帧缓动原样带过去', () => {
    expect(toKeyframes({ frames: [{ opacity: 0, offset: 0, easing: 'linear' }, { opacity: 1, offset: 1 }] })).toEqual([
      { offset: 0, easing: 'linear', opacity: '0' },
      { offset: 1, opacity: '1' },
    ])
  })
})

describe('逻辑方向', () => {
  it('未标 logical 的配方在 RTL 下不翻转', () => {
    const el = element('rtl')
    expect(toKeyframes({ frames: [{ x: 12 }, { x: 0 }] }, el)[0]).toEqual({ translate: '12px 0px' })
  })

  it('标了 logical 的配方在 RTL 下翻转横向位移', () => {
    const el = element('rtl')
    expect(toKeyframes({ frames: [{ x: -12 }, { x: 0 }], logical: true }, el)[0])
      .toEqual({ translate: '12px 0px' })
  })

  it('标了 logical 的配方在 LTR 下不动', () => {
    const el = element('ltr')
    expect(toKeyframes({ frames: [{ x: -12 }, { x: 0 }], logical: true }, el)[0])
      .toEqual({ translate: '-12px 0px' })
  })

  it('字符串位移的符号也跟着翻', () => {
    const el = element('rtl')
    expect(toKeyframes({ frames: [{ x: '100%' }], logical: true }, el)[0]).toEqual({ translate: '-100% 0px' })
    expect(toKeyframes({ frames: [{ x: '-100%' }], logical: true }, el)[0]).toEqual({ translate: '100% 0px' })
  })

  it('不给元素时不翻转', () => {
    expect(toKeyframes({ frames: [{ x: -12 }], logical: true })[0]).toEqual({ translate: '-12px 0px' })
  })

  it('纵向位移不受书写方向影响', () => {
    const el = element('rtl')
    expect(toKeyframes({ frames: [{ y: 12 }], logical: true }, el)[0]).toEqual({ translate: '0px 12px' })
  })
})

describe('reverseSpec', () => {
  it('帧序反转', () => {
    expect(reverseSpec({ frames: [{ opacity: 0 }, { opacity: 1 }] }).frames)
      .toEqual([{ opacity: 1 }, { opacity: 0 }])
  })

  it('偏移量镜像', () => {
    expect(reverseSpec({ frames: [{ offset: 0 }, { offset: 0.25 }, { offset: 1 }] }).frames)
      .toEqual([{ offset: 0 }, { offset: 0.75 }, { offset: 1 }])
  })

  it('逐帧缓动丢弃：它描述的区间在反转后换了主人', () => {
    expect(reverseSpec({ frames: [{ opacity: 0, easing: 'easeIn' }, { opacity: 1 }] }).frames)
      .toEqual([{ opacity: 1 }, { opacity: 0 }])
  })

  it('时序参数原样保留', () => {
    const spec = { frames: [{ opacity: 0 }, { opacity: 1 }], duration: 500, easing: 'easeOut', logical: true }
    const reversed = reverseSpec(spec)
    expect(reversed.duration).toBe(500)
    expect(reversed.easing).toBe('easeOut')
    expect(reversed.logical).toBe(true)
  })

  it('不改原配方', () => {
    const spec = { frames: [{ opacity: 0, easing: 'easeIn' }, { opacity: 1 }] }
    reverseSpec(spec)
    expect(spec.frames[0]).toEqual({ opacity: 0, easing: 'easeIn' })
  })

  it('反转两次回到原样', () => {
    const spec = { frames: [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 1 }] }
    expect(reverseSpec(reverseSpec(spec)).frames).toEqual(spec.frames)
  })
})
