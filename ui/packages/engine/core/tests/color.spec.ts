// 颜色换算的纯函数：十六进制、RGB、HSV、HSL、OKLCH 互转，CSS 颜色写法的解析与写出。
import { describe, expect, it } from 'vitest'
import {
  colorCss,
  colorHexToRgba,
  colorHslaToRgba,
  colorHsvaToRgba,
  colorOklchToRgba,
  colorParse,
  colorRgbaToHex,
  colorRgbaToHsla,
  colorRgbaToHsva,
  colorRgbaToOklch,
  colorSameColor,
  colorToString,
} from '../src/color'

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

describe('colorCss', () => {
  it('色块背景恒用 rgba()，透明度不会被吃掉', () => {
    expect(colorCss({ ...BLUE, a: 0.4 })).toBe('rgba(59, 130, 246, 0.4)')
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

describe('oklch 写法', () => {
  const RED = { r: 255, g: 0, b: 0, a: 1 }

  it('sRGB → OKLCH 与公开参照值一致：纯红、纯白、纯黑', () => {
    const red = colorRgbaToOklch(RED)
    expect(red.l).toBeCloseTo(0.628, 3)
    expect(red.c).toBeCloseTo(0.2577, 4)
    expect(red.h).toBeCloseTo(29.23, 1)
    expect(colorRgbaToOklch({ r: 255, g: 255, b: 255, a: 1 }).l).toBeCloseTo(1, 4)
    expect(colorRgbaToOklch({ r: 0, g: 0, b: 0, a: 1 }).l).toBeCloseTo(0, 4)
  })

  it('无彩色处色相无定义，交回 hint', () => {
    const gray = colorRgbaToOklch({ r: 128, g: 128, b: 128, a: 1 }, 217)
    expect(gray.c).toBeLessThan(0.0001)
    expect(gray.h).toBe(217)
  })

  it('序列化：明度百分数、彩度、色相，不透明时省掉斜杠；半透明带 / a', () => {
    expect(colorToString(RED, 'oklch', false)).toBe('oklch(62.8% 0.2577 29.23)')
    expect(colorToString({ ...RED, a: 0.5 }, 'oklch', true)).toBe('oklch(62.8% 0.2577 29.23 / 0.5)')
    // alpha 关掉时透明度恒按 1
    expect(colorToString({ ...RED, a: 0.5 }, 'oklch', false)).toBe('oklch(62.8% 0.2577 29.23)')
  })

  it('解析：百分数或 0-1 的明度、百分数彩度、deg 色相与斜杠透明度都认', () => {
    expect(colorParse('oklch(62.8% 0.2577 29.23)')).toEqual(RED)
    expect(colorParse('OKLCH(0.628 64.43% 29.23deg / 50%)')).toEqual({ ...RED, a: 0.5 })
    expect(colorParse('oklch(100% 0 0)')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })

  it('写法错了返回 null：参数个数不对、逗号写法、越界的明度与透明度', () => {
    expect(colorParse('oklch(62.8% 0.2577)')).toBeNull()
    expect(colorParse('oklch(62.8%, 0.2577, 29.23)')).toBeNull()
    expect(colorParse('oklch(120% 0.1 30)')).toBeNull()
    expect(colorParse('oklch(50% 0.1 30 / 2)')).toBeNull()
    expect(colorParse('oklch(50% -0.1 30)')).toBeNull()
  })

  it('超出 sRGB 的 oklch 按通道夹回，仍给出一个 sRGB 颜色', () => {
    const rgba = colorOklchToRgba({ l: 0.7, c: 0.4, h: 145, a: 1 })
    for (const channel of [rgba.r, rgba.g, rgba.b]) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    }
  })

  it('8 位 sRGB 往返 oklch 串不丢一档', () => {
    for (const rgba of [BLUE, RED, { r: 17, g: 200, b: 99, a: 1 }, { r: 250, g: 250, b: 3, a: 1 }, { r: 1, g: 2, b: 3, a: 1 }])
      expect(colorParse(colorToString(rgba, 'oklch', false))).toEqual(rgba)
  })
})

describe('oklab 与 color() 写法', () => {
  const RED = { r: 255, g: 0, b: 0, a: 1 }

  it('oklab()：明度与 a、b 两轴写数或百分数，斜杠后是透明度', () => {
    expect(colorParse('oklab(0.628 0.2249 0.1258)')).toEqual(RED)
    expect(colorParse('oklab(62.8% 56.23% 31.45% / 0.5)')).toEqual({ ...RED, a: 0.5 })
    expect(colorParse('oklab(1 0 0)')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })

  it('color(srgb …) 三路是 0-1 的数或百分数，color(srgb-linear …) 先换回伽马编码', () => {
    expect(colorParse('color(srgb 1 0 0)')).toEqual(RED)
    expect(colorParse('color(srgb 23.14% 50.98% 96.47% / 0.25)')).toEqual({ ...BLUE, a: 0.25 })
    expect(colorParse('color(srgb-linear 0.2159 0.2159 0.2159)')).toEqual({ r: 128, g: 128, b: 128, a: 1 })
    expect(colorParse('color(srgb-linear 1 1 1 / 0)')).toEqual({ r: 255, g: 255, b: 255, a: 0 })
  })

  it('分量写 none 时取 0', () => {
    expect(colorParse('oklch(0.5 0 none)')).toEqual(colorParse('oklch(0.5 0 0)'))
    expect(colorParse('oklab(none 0 0)')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(colorParse('color(srgb 1 none none)')).toEqual(RED)
  })

  it('超出 sRGB 的按通道裁剪：每一路夹回 0-255，透明度照旧', () => {
    expect(colorParse('color(srgb 1.2 -0.1 0.5 / 0.4)')).toEqual({ r: 255, g: 0, b: 128, a: 0.4 })
    expect(colorParse('oklch(0.7 0.4 145 / 0.6)')).toEqual({ ...colorOklchToRgba({ l: 0.7, c: 0.4, h: 145, a: 1 }), a: 0.6 })
  })

  it('认不出的色彩空间与写法错了的返回 null', () => {
    expect(colorParse('color(display-p3 1 0 0)')).toBeNull()
    expect(colorParse('lab(50% 40 59)')).toBeNull()
    expect(colorParse('color(srgb 1 0)')).toBeNull()
    expect(colorParse('oklab(0.5 0.1 0.1 / 2)')).toBeNull()
  })
})
