// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MAX_DURATION, MAX_FRAMES, MAX_ITERATIONS, peakFlashesPerSecond, reverseSpec, toKeyframes, validateMotionSpec } from '../src/spec'

function element(direction = 'ltr'): HTMLElement {
  const el = document.createElement('div')
  el.style.direction = direction
  document.body.append(el)
  return el
}

describe('validateMotionSpec', () => {
  it('合法的配方不抛错', () => {
    expect(() => validateMotionSpec({ frames: [{ opacity: 0, y: '100%' }, { opacity: 1, y: 0 }], duration: 200, easing: 'easeOut' })).not.toThrow()
    expect(() => validateMotionSpec({ frames: [{}], iterations: Number.POSITIVE_INFINITY })).not.toThrow()
  })

  it('帧数为零或超上限时抛错，不补帧也不截断', () => {
    expect(() => validateMotionSpec({ frames: [] })).toThrow(RangeError)
    const frames = Array.from({ length: MAX_FRAMES + 1 }, () => ({ opacity: 1 }))
    expect(() => validateMotionSpec({ frames })).toThrow(RangeError)
  })

  it('时长、延迟与次数越界或非有限时抛错', () => {
    expect(() => validateMotionSpec({ frames: [{}], duration: Number.NaN })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], duration: -100 })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], duration: MAX_DURATION + 1 })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], delay: -1 })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], iterations: -5 })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], iterations: MAX_ITERATIONS + 1 })).toThrow(RangeError)
  })

  it('帧取值越界时抛错，不钳制', () => {
    expect(() => validateMotionSpec({ frames: [{ opacity: -3 }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ opacity: 9 }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ scale: -2 }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ blur: -5 }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ rotate: Number.POSITIVE_INFINITY }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ x: Number.NaN }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ y: ' ' }] })).toThrow(RangeError)
  })

  it('偏移量越界或倒序时抛错', () => {
    expect(() => validateMotionSpec({ frames: [{ offset: -1 }, {}] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ offset: 2 }] })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{ offset: 0.6 }, { offset: 0.4 }] })).toThrow(RangeError)
  })

  it('认不出的缓动与枚举值抛错', () => {
    expect(() => validateMotionSpec({ frames: [{}], easing: 'wobble' })).toThrow(TypeError)
    expect(() => validateMotionSpec({ frames: [{ easing: 'bounceOut' }, {}] })).toThrow(TypeError)
    expect(() => validateMotionSpec({ frames: [{}], fill: 'sideways' as FillMode })).toThrow(RangeError)
    expect(() => validateMotionSpec({ frames: [{}], direction: 'backward' as PlaybackDirection })).toThrow(RangeError)
  })

  it('任意一秒闪烁超过三次时抛错', () => {
    const blink = { frames: [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }] }
    expect(() => validateMotionSpec({ ...blink, duration: 300, iterations: 3 })).not.toThrow()
    expect(() => validateMotionSpec({ ...blink, duration: 250, iterations: 4 })).toThrow('WCAG 2.3.1')
  })
})

describe('peakFlashesPerSecond', () => {
  const blink = { frames: [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }] }

  it('不动不透明度的配方不闪', () => {
    expect(peakFlashesPerSecond({ frames: [{ scale: 1 }, { scale: 2 }, { scale: 1 }], duration: 10, iterations: 100 })).toBe(0)
  })

  it('一明一暗算一次，按一秒窗口数', () => {
    expect(peakFlashesPerSecond({ ...blink, duration: 300 })).toBe(1)
    // 每 250ms 一次，连播 4 遍：一秒窗口里装得下 4 次
    expect(peakFlashesPerSecond({ ...blink, duration: 250, iterations: 4 })).toBe(4)
    // 同样的节奏只播一遍，一秒里只有 1 次
    expect(peakFlashesPerSecond({ ...blink, duration: 250 })).toBe(1)
  })

  it('无限次播放按周期取样', () => {
    expect(peakFlashesPerSecond({ ...blink, duration: 200, iterations: Number.POSITIVE_INFINITY })).toBe(5)
  })

  it('低于门槛的起伏不算闪烁', () => {
    expect(peakFlashesPerSecond({ frames: [{ opacity: 1 }, { opacity: 0.95 }, { opacity: 1 }], duration: 50, iterations: 40 })).toBe(0)
  })

  it('播完跳回首帧也算一次起落', () => {
    // 只淡出一次，但连播时每遍开头跳回不透明：一出一回就是一次闪烁
    expect(peakFlashesPerSecond({ frames: [{ opacity: 1 }, { opacity: 0 }], duration: 200, iterations: 5 })).toBe(4)
  })

  it('往返播放没有跳变', () => {
    expect(peakFlashesPerSecond({ frames: [{ opacity: 1 }, { opacity: 0 }], duration: 200, iterations: 5, direction: 'alternate' })).toBe(2)
  })

  it('时长为 0 画不出中间帧，不算闪烁', () => {
    expect(peakFlashesPerSecond({ ...blink, duration: 0, iterations: 10 })).toBe(0)
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

  it('偏移量原样带过去，逐帧缓动名换成 CSS 写法', () => {
    expect(toKeyframes({ frames: [{ opacity: 0, offset: 0, easing: 'easeOut' }, { opacity: 1, offset: 1 }] })).toEqual([
      { offset: 0, easing: 'cubic-bezier(0, 0, 0.2, 1)', opacity: '0' },
      { offset: 1, opacity: '1' },
    ])
  })

  it('缓动串按 CSS 写法原样带过去', () => {
    expect(toKeyframes({ frames: [{ opacity: 0, easing: 'steps(4)' }, { opacity: 1 }] })[0]!.easing).toBe('steps(4)')
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
