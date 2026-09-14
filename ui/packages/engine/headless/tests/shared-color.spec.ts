import { describe, expect, it } from 'vitest'
import {
  COLOR_CHANNELS,
  colorChannelRange,
  colorChannelValue,
  colorHsvaToRgba,
  colorToChannel,
  colorWithChannel,
} from '../src/shared/color'

// 颜色解析、序列化与空间互转的用例在 color-picker-color.spec.ts 里；这里只管七路通道的读写。

describe('通道声明', () => {
  it('七路通道各自有名字；写错或漏写退到 hue', () => {
    expect(COLOR_CHANNELS).toEqual(['hue', 'saturation', 'brightness', 'alpha', 'red', 'green', 'blue'])
    expect(colorToChannel('blue')).toBe('blue')
    expect(colorToChannel('lightness')).toBe('hue')
    expect(colorToChannel(undefined)).toBe('hue')
  })

  it('区间按各自的尺：色相 0-360、百分数 0-100、红绿蓝 0-255', () => {
    expect(colorChannelRange('hue')).toEqual({ min: 0, max: 360, step: 1, largeStep: 10 })
    expect(colorChannelRange('saturation')).toEqual({ min: 0, max: 100, step: 1, largeStep: 10 })
    expect(colorChannelRange('brightness')).toEqual({ min: 0, max: 100, step: 1, largeStep: 10 })
    expect(colorChannelRange('alpha')).toEqual({ min: 0, max: 100, step: 1, largeStep: 10 })
    expect(colorChannelRange('red')).toEqual({ min: 0, max: 255, step: 1, largeStep: 10 })
    expect(colorChannelRange('green')).toEqual({ min: 0, max: 255, step: 1, largeStep: 10 })
    expect(colorChannelRange('blue')).toEqual({ min: 0, max: 255, step: 1, largeStep: 10 })
  })
})

describe('通道读写', () => {
  const hsva = { h: 210, s: 50, v: 80, a: 0.5 }

  it('读值：HSV 三路直取，透明度按百分数，红绿蓝从 RGB 空间取', () => {
    expect(colorChannelValue(hsva, 'hue')).toBe(210)
    expect(colorChannelValue(hsva, 'saturation')).toBe(50)
    expect(colorChannelValue(hsva, 'brightness')).toBe(80)
    expect(colorChannelValue(hsva, 'alpha')).toBe(50)
    const rgba = colorHsvaToRgba(hsva)
    expect(colorChannelValue(hsva, 'red')).toBe(rgba.r)
    expect(colorChannelValue(hsva, 'green')).toBe(rgba.g)
    expect(colorChannelValue(hsva, 'blue')).toBe(rgba.b)
  })

  it('写 HSV 与透明度只动那一路，越界夹回区间，非数原地不动', () => {
    expect(colorWithChannel(hsva, 'saturation', 120)).toEqual({ ...hsva, s: 100 })
    expect(colorWithChannel(hsva, 'brightness', -5)).toEqual({ ...hsva, v: 0 })
    expect(colorWithChannel(hsva, 'hue', 400).h).toBe(360)
    expect(colorWithChannel(hsva, 'alpha', 25).a).toBeCloseTo(0.25, 5)
    expect(colorWithChannel(hsva, 'brightness', Number.NaN)).toEqual(hsva)
  })

  it('写红绿蓝走 RGB 空间：改一路不动另外两路，色相经 hint 带过去', () => {
    const next = colorWithChannel(hsva, 'red', 255)
    const before = colorHsvaToRgba(hsva)
    const after = colorHsvaToRgba(next)
    expect(after.r).toBe(255)
    expect(after.g).toBe(before.g)
    expect(after.b).toBe(before.b)
    expect(after.a).toBeCloseTo(before.a, 3)
    // 调成灰时色相无定义，沿用原来的 210 而不是塌成 0
    const grey = colorWithChannel({ h: 210, s: 0, v: 50, a: 1 }, 'green', 128)
    expect(grey.h).toBe(210)
  })
})
