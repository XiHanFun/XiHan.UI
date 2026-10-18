// 取色器的两块纯算法：工作色与通道、坐标换算。颜色换算本身的用例在 core 的 color.spec.ts。
// 都不碰 DOM、不认识状态机，因此不需要 jsdom 环境，逐个函数直接钉。
import { describe, expect, it } from 'vitest'
import {
  colorPickerApplyInput,
  colorPickerChannelRange,
  colorPickerChannelValue,
  colorPickerInputText,
  colorPickerWithArea,
  colorPickerWithChannel,
} from '../src/color-picker/color-picker.color'
import { colorPickerPercent, colorPickerPointRatio } from '../src/color-picker/color-picker.geometry'
import { colorHsvaToRgba, colorHueCss, colorResolveFormat, colorResolveHsva, colorRgbaToHsva, colorToRgba } from '../src/shared/color'

// 参照色：#3b82f6 = rgb(59,130,246) = hsl(217, 91%, 60%) = hsv(217, 76%, 96%)
const BLUE = { r: 59, g: 130, b: 246, a: 1 }

describe('colorResolveFormat', () => {
  it('缺省是 hex，未知格式显式返回 null', () => {
    expect(colorResolveFormat(undefined)).toBe('hex')
    expect(colorResolveFormat('rgba')).toBe('rgba')
    expect(colorResolveFormat('oklch')).toBe('oklch')
    // hsb 不是 CSS 颜色写法，不收作值串格式
    expect(colorResolveFormat('hsb')).toBeNull()
  })
})

describe('colorToRgba', () => {
  it('解析不出时退到兜底色（展示用途不该因为一个坏串整块消失）', () => {
    expect(colorToRgba('乱写的')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(colorToRgba('#3b82f6')).toEqual(BLUE)
  })
})

describe('colorHueCss', () => {
  it('取色区底色是当前色相的纯色', () => {
    expect(colorHueCss(217.4)).toBe('hsl(217, 100%, 50%)')
    expect(colorHueCss(-30)).toBe('hsl(330, 100%, 50%)')
  })
})

describe('colorResolveHsva', () => {
  it('锚记的串与当前值逐字相同就沿用锚里的色相', () => {
    // 值是纯黑（色相算不出来），但这个串正是由 217 度那次操作产出的
    const anchor = { value: '#000000', hsva: { h: 217, s: 76, v: 0, a: 1 } }
    expect(colorResolveHsva('#000000', anchor).h).toBe(217)
  })

  it('串对不上（外部写进来的值）就老老实实反解，色相拿锚当兜底', () => {
    const anchor = { value: '#000000', hsva: { h: 217, s: 76, v: 0, a: 1 } }
    expect(Math.round(colorResolveHsva('#ff0000', anchor).h)).toBe(0)
    // 新值也是灰度：算不出色相，此时才轮到锚的色相兜底
    expect(colorResolveHsva('#808080', anchor).h).toBe(217)
  })

  it('没有锚、值也解析不出时退到兜底色', () => {
    expect(colorResolveHsva('乱写的', null)).toEqual({ h: 0, s: 0, v: 0, a: 1 })
  })
})

describe('通道读写', () => {
  it('色相 0-360、透明度 0-100（对外一律按百分数走）', () => {
    expect(colorPickerChannelRange('hue')).toEqual({ min: 0, max: 360, step: 1, largeStep: 10 })
    expect(colorPickerChannelRange('alpha')).toEqual({ min: 0, max: 100, step: 1, largeStep: 10 })
  })

  it('读回来的透明度是百分数，写进去也按百分数', () => {
    const hsva = { h: 10, s: 20, v: 30, a: 0.4 }
    expect(colorPickerChannelValue(hsva, 'alpha')).toBeCloseTo(40, 5)
    expect(colorPickerWithChannel(hsva, 'alpha', 80).a).toBeCloseTo(0.8, 5)
  })

  it('越界夹回区间，非有限数原地不动', () => {
    const hsva = { h: 10, s: 20, v: 30, a: 0.4 }
    expect(colorPickerWithChannel(hsva, 'hue', 999).h).toBe(360)
    expect(colorPickerWithChannel(hsva, 'hue', -5).h).toBe(0)
    expect(colorPickerWithChannel(hsva, 'hue', Number.NaN).h).toBe(10)
  })

  it('取色区两条轴：横轴饱和度、纵轴明度', () => {
    const hsva = { h: 10, s: 20, v: 30, a: 1 }
    expect(colorPickerWithArea(hsva, 'x', 55).s).toBe(55)
    expect(colorPickerWithArea(hsva, 'y', 55).v).toBe(55)
    expect(colorPickerWithArea(hsva, 'x', 300).s).toBe(100)
    expect(colorPickerWithArea(hsva, 'y', -1).v).toBe(0)
  })
})

describe('colorPickerInputText', () => {
  const hsva = colorRgbaToHsva({ ...BLUE, a: 0.5 })

  it('十六进制框显示整串，rgb 三个框各显示一个分量', () => {
    expect(colorPickerInputText(hsva, 'hex', false)).toBe('#3b82f6')
    expect(colorPickerInputText(hsva, 'hex', true)).toBe('#3b82f680')
    expect(colorPickerInputText(hsva, 'r', false)).toBe('59')
    expect(colorPickerInputText(hsva, 'g', false)).toBe('130')
    expect(colorPickerInputText(hsva, 'b', false)).toBe('246')
  })

  it('透明度框按百分数显示', () => {
    expect(colorPickerInputText(hsva, 'a', true)).toBe('50')
  })
})

describe('colorPickerApplyInput', () => {
  const hsva = colorRgbaToHsva({ ...BLUE, a: 0.5 })

  it('十六进制：六位写法保留当前透明度，八位写法带上新的', () => {
    const six = colorPickerApplyInput(hsva, 'hex', '#ff0000', true)!
    expect(six.a).toBe(0.5)
    expect(colorHsvaToRgba(six)).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })

    const eight = colorPickerApplyInput(hsva, 'hex', '#ff000000', true)!
    expect(eight.a).toBe(0)
  })

  it('alpha 关掉时八位写法里的透明度不生效', () => {
    expect(colorPickerApplyInput(hsva, 'hex', '#ff000000', false)!.a).toBe(0.5)
  })

  it('rgb 分量按 0-255 收，越界显式拒绝', () => {
    expect(colorHsvaToRgba(colorPickerApplyInput(hsva, 'r', '200', true)!).r).toBe(200)
    expect(colorPickerApplyInput(hsva, 'r', '999', true)).toBeNull()
    expect(colorPickerApplyInput(hsva, 'g', '-1', true)).toBeNull()
  })

  it('把分量改到与另两个相等（变灰）时色相不塌成红', () => {
    const gray = colorPickerApplyInput(colorRgbaToHsva({ r: 10, g: 10, b: 200, a: 1 }, 240), 'b', '10', false)!
    expect(Math.round(gray.h)).toBe(240)
  })

  it('透明度框按百分数收', () => {
    expect(colorPickerApplyInput(hsva, 'a', '80', true)!.a).toBeCloseTo(0.8, 5)
    expect(colorPickerApplyInput(hsva, 'a', '-1', true)).toBeNull()
    expect(colorPickerApplyInput(hsva, 'a', '101', true)).toBeNull()
  })

  it('打到一半、空串、非法字符一律 null（草稿留给调用方处置）', () => {
    expect(colorPickerApplyInput(hsva, 'hex', '#3b82f', true)).toBeNull()
    expect(colorPickerApplyInput(hsva, 'hex', '', true)).toBeNull()
    expect(colorPickerApplyInput(hsva, 'r', '', true)).toBeNull()
    expect(colorPickerApplyInput(hsva, 'r', 'abc', true)).toBeNull()
  })
})

describe('colorPickerPointRatio', () => {
  const RECT = { x: 100, y: 50, width: 200, height: 100 }

  it('两条轴各自取 0-1，落在正中就是 0.5', () => {
    expect(colorPickerPointRatio({ clientX: 200, clientY: 100 }, RECT)).toEqual({ x: 0.5, y: 0.5 })
    expect(colorPickerPointRatio({ clientX: 100, clientY: 50 }, RECT)).toEqual({ x: 0, y: 0 })
    expect(colorPickerPointRatio({ clientX: 300, clientY: 150 }, RECT)).toEqual({ x: 1, y: 1 })
  })

  it('拖出边界的落点夹回 0-1，不越界', () => {
    expect(colorPickerPointRatio({ clientX: -999, clientY: 999 }, RECT)).toEqual({ x: 0, y: 1 })
  })

  it('rtl 只把横轴掉头，竖轴与文字方向无关', () => {
    expect(colorPickerPointRatio({ clientX: 100, clientY: 50 }, RECT, 'rtl')).toEqual({ x: 1, y: 0 })
    expect(colorPickerPointRatio({ clientX: 300, clientY: 150 }, RECT, 'rtl')).toEqual({ x: 0, y: 1 })
  })

  it('矩形被压成 0 宽高（还没布局）时给 0，不做除零', () => {
    // 除以 0 会得到 NaN，一路写进 aria-valuenow 与定位百分比
    const ratio = colorPickerPointRatio({ clientX: 10, clientY: 10 }, { x: 0, y: 0, width: 0, height: 0 })
    expect(ratio).toEqual({ x: 0, y: 0 })
  })
})

describe('colorPickerPercent', () => {
  it('小数留两位，拼不出浮点尾巴', () => {
    expect(colorPickerPercent(1 / 3)).toBe('33.33%')
    expect(colorPickerPercent(0)).toBe('0%')
    expect(colorPickerPercent(1)).toBe('100%')
  })

  it('越界与非有限数都收得住', () => {
    expect(colorPickerPercent(2)).toBe('100%')
    expect(colorPickerPercent(-1)).toBe('0%')
    expect(colorPickerPercent(Number.NaN)).toBe('0%')
  })
})
