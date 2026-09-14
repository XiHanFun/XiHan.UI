// 取色器的两块纯算法：颜色换算与坐标换算。
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
import {
  colorCss,
  colorHexToRgba,
  colorHslaToRgba,
  colorHsvaToRgba,
  colorHueCss,
  colorParse,
  colorResolveFormat,
  colorResolveHsva,
  colorRgbaToHex,
  colorRgbaToHsla,
  colorRgbaToHsva,
  colorSameColor,
  colorToRgba,
  colorToString,
} from '../src/shared/color'

// 参照色：#3b82f6 = rgb(59,130,246) = hsl(217, 91%, 60%) = hsv(217, 76%, 96%)
const BLUE = { r: 59, g: 130, b: 246, a: 1 }

describe('colorHexToRgba', () => {
  it('三位与六位是同一个颜色，`#` 可省', () => {
    expect(colorHexToRgba('#f0a')).toEqual({ r: 255, g: 0, b: 170, a: 1 })
    expect(colorHexToRgba('ff00aa')).toEqual({ r: 255, g: 0, b: 170, a: 1 })
  })

  it('四位与八位带透明度', () => {
    expect(colorHexToRgba('#0000')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    expect(colorHexToRgba('#3b82f680')!.a).toBeCloseTo(128 / 255, 5)
  })

  it('位数不对（用户打了一半）一律 null，不猜颜色', () => {
    // 这几串在长度上都是"半截"，猜一个出来会让输入框在打字途中乱跳
    expect(colorHexToRgba('#3b')).toBeNull()
    expect(colorHexToRgba('#3b8')).not.toBeNull() // 三位是合法简写
    expect(colorHexToRgba('#3b82')).not.toBeNull() // 四位是带透明度的简写
    expect(colorHexToRgba('#3b82f')).toBeNull()
    expect(colorHexToRgba('#3b82f6a')).toBeNull()
    expect(colorHexToRgba('')).toBeNull()
    expect(colorHexToRgba('#zzzzzz')).toBeNull()
  })
})

describe('colorRgbaToHex', () => {
  it('每个分量补足两位，默认不带透明度', () => {
    expect(colorRgbaToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000')
    expect(colorRgbaToHex(BLUE)).toBe('#3b82f6')
  })

  it('withAlpha 才输出第四对', () => {
    expect(colorRgbaToHex({ ...BLUE, a: 0.5 }, true)).toBe('#3b82f680')
    expect(colorRgbaToHex({ ...BLUE, a: 0.5 })).toBe('#3b82f6')
  })
})

describe('rgb ↔ hsv 互转', () => {
  it('参照色往返回得来', () => {
    const hsva = colorRgbaToHsva(BLUE)
    expect(Math.round(hsva.h)).toBe(217)
    expect(Math.round(hsva.s)).toBe(76)
    expect(Math.round(hsva.v)).toBe(96)
    expect(colorHsvaToRgba(hsva)).toEqual(BLUE)
  })

  it('三原色的色相分别落在 0 / 120 / 240', () => {
    expect(colorRgbaToHsva({ r: 255, g: 0, b: 0, a: 1 }).h).toBe(0)
    expect(colorRgbaToHsva({ r: 0, g: 255, b: 0, a: 1 }).h).toBe(120)
    expect(colorRgbaToHsva({ r: 0, g: 0, b: 255, a: 1 }).h).toBe(240)
  })

  it('灰度色算不出色相，交回 hint（不给就落 0）', () => {
    // 这是取色器最容易塌的一处：把明度拖到 0 再拖回来，色相会变成红
    expect(colorRgbaToHsva({ r: 0, g: 0, b: 0, a: 1 }).h).toBe(0)
    expect(colorRgbaToHsva({ r: 0, g: 0, b: 0, a: 1 }, 217).h).toBe(217)
    expect(colorRgbaToHsva({ r: 128, g: 128, b: 128, a: 1 }, 217).h).toBe(217)
    // 有色相可算时 hint 不许插手
    expect(Math.round(colorRgbaToHsva(BLUE, 30).h)).toBe(217)
  })

  it('纯黑的饱和度取 0，不做除零', () => {
    const hsva = colorRgbaToHsva({ r: 0, g: 0, b: 0, a: 1 })
    expect(hsva.s).toBe(0)
    expect(hsva.v).toBe(0)
    expect(Number.isNaN(hsva.s)).toBe(false)
  })

  it('透明度原样带过去', () => {
    expect(colorRgbaToHsva({ ...BLUE, a: 0.25 }).a).toBe(0.25)
    expect(colorHsvaToRgba({ h: 0, s: 0, v: 0, a: 0.25 }).a).toBe(0.25)
  })

  it('越界输入夹回区间而不是产出 NaN', () => {
    expect(colorHsvaToRgba({ h: 400, s: 200, v: -5, a: 3 })).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(colorRgbaToHsva({ r: 999, g: -20, b: Number.NaN, a: 1 })).toEqual({ h: 0, s: 100, v: 100, a: 1 })
  })
})

describe('rgb ↔ hsl 互转', () => {
  it('参照色往返回得来', () => {
    const hsla = colorRgbaToHsla(BLUE)
    expect(Math.round(hsla.h)).toBe(217)
    expect(Math.round(hsla.s)).toBe(91)
    expect(Math.round(hsla.l)).toBe(60)
    expect(colorHslaToRgba(hsla)).toEqual(BLUE)
  })

  it('纯白纯黑的饱和度取 0，不做除零', () => {
    expect(colorRgbaToHsla({ r: 255, g: 255, b: 255, a: 1 })).toEqual({ h: 0, s: 0, l: 100, a: 1 })
    expect(colorRgbaToHsla({ r: 0, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 0, l: 0, a: 1 })
  })
})

describe('colorParse', () => {
  it('认十六进制、rgb()、hsl() 三类写法', () => {
    expect(colorParse('#3b82f6')).toEqual(BLUE)
    expect(colorParse('rgb(59, 130, 246)')).toEqual(BLUE)
    expect(colorParse('rgba(59, 130, 246, 0.5)')).toEqual({ ...BLUE, a: 0.5 })
    // 整数百分数比原色少一点精度，这正是锚要按串逐字比、不按颜色比的原因
    expect(colorParse('hsl(217, 91%, 60%)')).toEqual({ r: 60, g: 131, b: 246, a: 1 })
    expect(colorParse('hsla(217, 91%, 60%, 0.5)')).toEqual({ r: 60, g: 131, b: 246, a: 0.5 })
  })

  it('空格与斜杠分隔、百分数透明度、大写都收得下', () => {
    expect(colorParse('rgb(59 130 246 / 50%)')).toEqual({ ...BLUE, a: 0.5 })
    expect(colorParse('  #3B82F6  ')).toEqual(BLUE)
    expect(colorParse('hsl(217deg 91% 60%)')).toEqual({ r: 60, g: 131, b: 246, a: 1 })
  })

  it('半截串、空串、颜色关键字一律 null', () => {
    expect(colorParse('')).toBeNull()
    expect(colorParse('   ')).toBeNull()
    expect(colorParse('#3b82f')).toBeNull()
    expect(colorParse('rgb(59, 130)')).toBeNull()
    expect(colorParse('rgb(59, abc, 246)')).toBeNull()
    // 颜色关键字要一张随浏览器版本走的名字表，取值口径必须是确定的，所以不认
    expect(colorParse('red')).toBeNull()
    expect(colorParse('transparent')).toBeNull()
  })

  it('越界分量、透明度或多余参数一律拒绝，不静默裁切', () => {
    expect(colorParse('rgb(300, -20, 246)')).toBeNull()
    expect(colorParse('rgba(59, 130, 246, 5)')).toBeNull()
    expect(colorParse('hsl(217, 101%, 60%)')).toBeNull()
    expect(colorParse('hsla(217, 91%, -1%, 0.5)')).toBeNull()
    expect(colorParse('rgb(59, 130, 246, 1, 0)')).toBeNull()
  })
})

describe('colorResolveFormat', () => {
  it('缺省是 hex，未知格式显式返回 null', () => {
    expect(colorResolveFormat(undefined)).toBe('hex')
    expect(colorResolveFormat('rgba')).toBe('rgba')
    expect(colorResolveFormat('oklch')).toBeNull()
  })
})

describe('colorToRgba', () => {
  it('解析不出时退到兜底色（展示用途不该因为一个坏串整块消失）', () => {
    expect(colorToRgba('乱写的')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(colorToRgba('#3b82f6')).toEqual(BLUE)
  })
})

describe('colorToString', () => {
  it('hex：不透明只写六位，半透明且开了 alpha 才写八位', () => {
    expect(colorToString(BLUE, 'hex', false)).toBe('#3b82f6')
    expect(colorToString({ ...BLUE, a: 0.5 }, 'hex', true)).toBe('#3b82f680')
    expect(colorToString({ ...BLUE, a: 1 }, 'hex', true)).toBe('#3b82f6')
  })

  it('alpha 关掉时透明度恒按 1 输出', () => {
    // 组件不带透明度却吐出半透明值，调用方拿去用会莫名其妙
    expect(colorToString({ ...BLUE, a: 0.2 }, 'hex', false)).toBe('#3b82f6')
    expect(colorToString({ ...BLUE, a: 0.2 }, 'rgba', false)).toBe('rgba(59, 130, 246, 1)')
    expect(colorToString({ ...BLUE, a: 0.2 }, 'hsla', false)).toBe('hsla(217, 91%, 60%, 1)')
  })

  it('rgba / hsla 写法与解析互为逆运算', () => {
    const rgbaText = colorToString({ ...BLUE, a: 0.5 }, 'rgba', true)
    expect(rgbaText).toBe('rgba(59, 130, 246, 0.5)')
    expect(colorParse(rgbaText)).toEqual({ ...BLUE, a: 0.5 })

    const hslaText = colorToString(BLUE, 'hsla', false)
    expect(hslaText).toBe('hsla(217, 91%, 60%, 1)')
    // 百分数舍进整数，往返会差一点点：这正是锚要按串逐字比、不按颜色比的原因
    expect(colorParse(hslaText)).not.toBeNull()
  })

  it('透明度的小数尾巴截到三位', () => {
    expect(colorToString({ ...BLUE, a: 1 / 3 }, 'rgba', true)).toBe('rgba(59, 130, 246, 0.333)')
  })
})

describe('colorCss / colorHueCss', () => {
  it('色块背景恒用 rgba()，透明度不会被吃掉', () => {
    expect(colorCss({ ...BLUE, a: 0.4 })).toBe('rgba(59, 130, 246, 0.4)')
  })

  it('取色区底色是当前色相的纯色', () => {
    expect(colorHueCss(217.4)).toBe('hsl(217, 100%, 50%)')
    expect(colorHueCss(-30)).toBe('hsl(330, 100%, 50%)')
  })
})

describe('colorSameColor', () => {
  it('写法不同、颜色相同算同一个', () => {
    expect(colorSameColor('#f00', 'rgb(255, 0, 0)')).toBe(true)
    expect(colorSameColor('#ff0000', 'hsl(0, 100%, 50%)')).toBe(true)
    expect(colorSameColor('#ff0000', '#ff0001')).toBe(false)
  })

  it('任一侧解析不出即不相同', () => {
    expect(colorSameColor('#ff0000', '半截')).toBe(false)
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
