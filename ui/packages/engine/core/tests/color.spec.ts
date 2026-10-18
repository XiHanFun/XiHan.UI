// 颜色换算的纯函数：十六进制、RGB、HSV、HSL、OKLCH 互转，CSS 颜色写法的解析与写出。
import { describe, expect, it } from 'vitest'
import {
  colorClampChroma,
  colorCss,
  colorFormatOklch,
  colorHexToRgba,
  colorHslaToRgba,
  colorHsvaToRgba,
  colorInSrgbGamut,
  colorLinearRgbToOklch,
  colorLinearToSrgb,
  colorOklchToLinearRgb,
  colorOklchToRgba,
  colorParse,
  colorParseOklch,
  colorRgbaToHex,
  colorRgbaToHsla,
  colorRgbaToHsva,
  colorRgbaToOklch,
  colorSameColor,
  colorSrgbToLinear,
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

  it('色相认 deg、grad、rad、turn 与裸数，一律折成度', () => {
    const ref = colorParse('hsl(180 50% 50%)')
    for (const hue of ['180deg', '200grad', `${Math.PI}rad`, '0.5TURN'])
      expect(colorParse(`hsl(${hue} 50% 50%)`), hue).toEqual(ref)
    expect(colorParse('oklch(62.8% 0.2577 0.0812turn)')).toEqual(colorParse('oklch(62.8% 0.2577 29.23)'))
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

describe('浮点层：线性光与 OKLCH', () => {
  it('sRGB 编码与线性光互为逆运算（分段点处差 3e-8），超出 0-1 的输入照样换算、不截断', () => {
    for (const x of [0, 0.01, 0.04045, 0.2, 0.5, 0.9, 1])
      expect(colorLinearToSrgb(colorSrgbToLinear(x))).toBeCloseTo(x, 6)
    expect(colorLinearToSrgb(1.2)).toBeGreaterThan(1)
    expect(colorLinearToSrgb(-0.1)).toBeLessThan(0)
  })

  it('线性光 → OKLCH → 线性光往返回得来（矩阵自身的往返误差在 1e-7 内），不取整', () => {
    for (const rgb of [[0.2, 0.5, 0.9], [0.001, 0.3, 0.07], [1, 0.0005, 0.25]] as const) {
      const back = colorOklchToLinearRgb(colorLinearRgbToOklch(rgb[0], rgb[1], rgb[2]))
      for (const [i, v] of back.entries()) expect(v).toBeCloseTo(rgb[i]!, 6)
    }
  })

  it('8 位接口建在浮点层上：colorRgbaToOklch 与浮点换算逐位相同', () => {
    for (let r = 0; r <= 255; r += 51) {
      for (let g = 0; g <= 255; g += 51) {
        for (let b = 0; b <= 255; b += 51) {
          const linear = [r, g, b].map(v => colorSrgbToLinear(v / 255)) as [number, number, number]
          expect(colorRgbaToOklch({ r, g, b, a: 0.5 }, 90)).toEqual(colorLinearRgbToOklch(...linear, 0.5, 90))
        }
      }
    }
  })

  it('明度夹进 0-1；彩度低于万分之一时色相取 hint，缺省 0', () => {
    expect(colorLinearRgbToOklch(1.2, 1.2, 1.2).l).toBe(1)
    expect(colorLinearRgbToOklch(1, 1, 1).h).toBe(0)
    expect(colorLinearRgbToOklch(0.5, 0.5, 0.5, 1, 258).h).toBe(258)
  })

  it('oKLCH → 线性光不截断：出色域的分量照实给出', () => {
    const [r, g, b] = colorOklchToLinearRgb({ l: 0.62, c: 0.3, h: 30, a: 1 })
    expect(Math.max(r, g, b)).toBeGreaterThan(1)
    expect(Math.min(r, g, b)).toBeLessThan(0)
  })
})

describe('colorParseOklch', () => {
  it('四种写法解析同一颜色到同一 OKLCH，透明度原样带过来', () => {
    const forms = ['#3b82f6', '#3B82F6', 'rgb(59 130 246)', 'rgb(59, 130, 246)', 'rgba(59,130,246,0.5)', 'color(srgb 0.23137 0.5098 0.96471)']
    const results = forms.map(form => colorParseOklch(form)!)
    for (const r of results) {
      expect(r.l).toBeCloseTo(results[0]!.l, 4)
      expect(r.c).toBeCloseTo(results[0]!.c, 4)
      expect(r.h).toBeCloseTo(results[0]!.h, 2)
    }
    expect(results.map(r => r.a)).toEqual([1, 1, 1, 1, 0.5, 1])
  })

  it('纯红换算到已知 OKLCH 值，hsl 与等值 rgb 一致', () => {
    const red = colorParseOklch('#ff0000')!
    expect(red.l).toBeCloseTo(0.628, 3)
    expect(red.c).toBeCloseTo(0.2577, 4)
    expect(red.h).toBeCloseTo(29.23, 1)
    const fromHsl = colorParseOklch('hsl(0 100% 50%)')!
    expect(fromHsl.l).toBeCloseTo(red.l, 9)
    expect(fromHsl.h).toBeCloseTo(red.h, 6)
  })

  it('不取整到 8 位：oklch 写法原样读回，百分数按规范折算', () => {
    expect(colorParseOklch('oklch(0.546 0.216 258)')).toEqual({ l: 0.546, c: 0.216, h: 258, a: 1 })
    const b = colorParseOklch('oklch(54.6% 54% 258deg)')!
    expect(b.l).toBeCloseTo(0.546, 12)
    expect(b.c).toBeCloseTo(0.216, 12)
  })

  it('rgb 通道的百分数与小数照实换算，不取整', () => {
    const numeric = colorParseOklch('rgb(43.35 34 130.05 / 0.4)')!
    for (const mixed of ['rgb(17% 34 51% / 40%)', 'rgba(17% 34 51% / 0.4)']) {
      const color = colorParseOklch(mixed)!
      expect(color.l, mixed).toBeCloseTo(numeric.l, 12)
      expect(color.c, mixed).toBeCloseTo(numeric.c, 12)
      expect(color.h, mixed).toBeCloseTo(numeric.h, 9)
      expect(color.a, mixed).toBeCloseTo(0.4, 12)
    }
    const linear = [43.35, 34, 130.05].map(v => colorSrgbToLinear(v / 255)) as [number, number, number]
    expect(colorParseOklch('rgb(43.35 34 130.05)')).toEqual(colorLinearRgbToOklch(...linear))
  })

  it('hex、rgb、hsl、oklch 都保留 alpha，未声明时为 1', () => {
    expect(colorParseOklch('#1234')!.a).toBeCloseTo(0x44 / 255, 6)
    expect(colorParseOklch('#11223380')!.a).toBeCloseTo(0x80 / 255, 6)
    expect(colorParseOklch('hsl(210 50% 13.3% / 40%)')!.a).toBeCloseTo(0.4, 6)
    expect(colorParseOklch('hsla(210, 50%, 13.3%, 0.4)')!.a).toBeCloseTo(0.4, 6)
    expect(colorParseOklch('oklch(0.25 0.04 250 / 40%)')!.a).toBeCloseTo(0.4, 6)
    expect(colorParseOklch('#123')!.a).toBe(1)
  })

  it('色相认 deg、grad、rad、turn，一律折成度', () => {
    const hue = colorParseOklch('hsl(180deg 50% 50%)')!.h
    for (const text of ['hsl(200grad 50% 50%)', `hsl(${Math.PI}rad 50% 50%)`, 'hsl(0.5TURN 50% 50%)'])
      expect(colorParseOklch(text)!.h, text).toBeCloseTo(hue, 6)
    expect(colorParseOklch('oklch(0.5 0.1 0.5turn)')!.h).toBeCloseTo(180, 9)
  })

  it('无彩色处色相取 0', () => {
    for (const text of ['#ffffff', '#808080', 'rgb(0 0 0)', 'oklab(0.5 0 0)'])
      expect(colorParseOklch(text)!.h, text).toBe(0)
  })

  it('color(srgb …) 越出 0-1 不截断，colorParse 才按通道裁剪', () => {
    const color = colorParseOklch('color(srgb 1.2 0 0)')!
    expect(colorOklchToLinearRgb(color)[0]).toBeGreaterThan(1)
    expect(colorParse('color(srgb 1.2 0 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('写法与越界规则同 colorParse：解不了、分量或透明度越界一律 null', () => {
    for (const text of [
      '',
      'blue',
      'var(--x)',
      '#12345',
      'rgb(1 2)',
      'oklch(1)',
      'rgb(17 34 51 / nope)',
      'rgb(300 0 0)',
      'rgb(17 34 51 / -0.2)',
      'rgba(59, 130, 246, 5)',
      'hsl(210 50% 13.3% / 120%)',
      'hsl(217, 101%, 60%)',
      'oklch(120% -0.1 20)',
      'oklch(-0.2 0.1 20)',
      'oklch(0.5 -0.1 20)',
      'oklch(0.25 0.04 250 / 2)',
      'oklab(0.5 0.1 0.1 / 2)',
      'color(display-p3 1 0 0)',
    ]) {
      expect(colorParseOklch(text), text).toBeNull()
      expect(colorParse(text), text).toBeNull()
    }
  })
})

describe('色域', () => {
  it('colorInSrgbGamut：三路线性分量在 [-0.05, 1.05] 里即算在色域内', () => {
    expect(colorInSrgbGamut({ l: 0.546, c: 0.216, h: 258, a: 1 })).toBe(true)
    expect(colorInSrgbGamut({ l: 0.62, c: 0.3, h: 30, a: 1 })).toBe(false)
    expect(colorInSrgbGamut({ l: 1, c: 0, h: 0, a: 1 })).toBe(true)
  })

  it('colorInSrgbGamut：线性分量越出 0-1 不到 0.05 仍算在内，超过就不算', () => {
    expect(colorOklchToLinearRgb({ l: 0.7, c: 0.241, h: 145, a: 1 })[0]).toBeCloseTo(-0.03, 3)
    expect(colorInSrgbGamut({ l: 0.7, c: 0.241, h: 145, a: 1 })).toBe(true)
    expect(colorOklchToLinearRgb({ l: 0.7, c: 0.28, h: 145, a: 1 })[0]).toBeLessThan(-0.05)
    expect(colorInSrgbGamut({ l: 0.7, c: 0.28, h: 145, a: 1 })).toBe(false)
  })

  it('colorClampChroma：本就在色域内原样返回', () => {
    expect(colorClampChroma(0.546, 0.216, 258)).toBe(0.216)
    expect(colorClampChroma(0.5, 0, 120)).toBe(0)
  })

  it('colorClampChroma：出色域时只收彩度，落在色域边上', () => {
    const c = colorClampChroma(0.62, 0.3, 30)
    expect(c).toBeLessThan(0.3)
    expect(colorInSrgbGamut({ l: 0.62, c, h: 30, a: 1 })).toBe(true)
    expect(colorInSrgbGamut({ l: 0.62, c: c + 0.001, h: 30, a: 1 })).toBe(false)
  })

  it('与 colorOklchToRgba 的按通道裁剪不同：收彩度不动明度与色相', () => {
    const clipped = colorRgbaToOklch(colorOklchToRgba({ l: 0.62, c: 0.3, h: 30, a: 1 }))
    expect(Math.abs(clipped.l - 0.62)).toBeGreaterThan(0.005)
    expect(Math.abs(clipped.h - 30)).toBeGreaterThan(0.5)
  })
})

describe('colorFormatOklch', () => {
  it('明度与彩度三位小数、色相两位，尾巴零去掉；不透明时省掉透明度', () => {
    expect(colorFormatOklch({ l: 0.546, c: 0.216, h: 258, a: 1 })).toBe('oklch(0.546 0.216 258)')
    expect(colorFormatOklch({ l: 0.62799, c: 0.25768, h: 29.2339, a: 1 })).toBe('oklch(0.628 0.258 29.23)')
  })

  it('彩度先收进 sRGB 色域', () => {
    expect(colorFormatOklch({ l: 0.62, c: 0.3, h: 30, a: 1 }))
      .toBe(`oklch(0.62 ${Number(colorClampChroma(0.62, 0.3, 30).toFixed(3))} 30)`)
  })

  it('半透明时透明度原样写出，不截位', () => {
    expect(colorFormatOklch({ l: 0.5, c: 0.1, h: 200, a: 0.9999999 })).toBe('oklch(0.5 0.1 200 / 0.9999999)')
    expect(colorFormatOklch({ l: 0, c: 0, h: 0, a: 0 })).toBe('oklch(0 0 0 / 0)')
  })

  it('无彩色写出的色相是 0', () => {
    expect(colorFormatOklch(colorParseOklch('#ffffff')!)).toBe('oklch(1 0 0)')
    expect(colorFormatOklch(colorParseOklch('#808080')!)).toBe('oklch(0.6 0 0)')
  })
})

describe('按 CSS Color 4 的语法认写法', () => {
  function expectAccepted(texts: readonly string[]): void {
    for (const text of texts) {
      expect(colorParse(text), text).not.toBeNull()
      expect(colorParseOklch(text), text).not.toBeNull()
    }
  }

  function expectRejected(texts: readonly string[]): void {
    for (const text of texts) {
      expect(colorParse(text), text).toBeNull()
      expect(colorParseOklch(text), text).toBeNull()
    }
  }

  it('rgb 旧式写法：分隔符全是逗号，三路同为数或同为百分数，透明度是第四个参数', () => {
    expectAccepted(['rgb(59, 130, 246)', 'rgba(59,130,246,0.5)', 'rgb(23.14%, 50.98%, 96.47%)', 'rgba(59, 130, 246, 50%)', 'rgb( 59 , 130 , 246 )'])
    expect(colorParse('rgb(23.14%, 50.98%, 96.47%)')).toEqual(BLUE)
    expectRejected(['rgb(23.14%, 130, 246)', 'rgb(17%, 34, 51%)', 'rgb(59, 130 246)', 'rgb(17 34, 51 / 40%)', 'rgb(59, 130, 246 / 0.5)', 'rgb(none, 130, 246)', 'rgb(59, 130, 246,)', 'rgb(59,, 130, 246)'])
  })

  it('rgb 新式写法：分量之间用空白，透明度写在 / 后面，数与百分数可混用，可写 none', () => {
    expectAccepted(['rgb(59 130 246)', 'rgb(59 130 246 / 50%)', 'rgb(23.14% 130 96.47% / 0.5)', 'rgb(none 130 246)', 'rgba(59 130 246 / 0.5)', 'rgb(59 130 246 / none)'])
    expect(colorParse('rgb(59 130 246 / none)')).toEqual({ ...BLUE, a: 0 })
    expectRejected(['rgb(59 130 246 0.5)', 'rgb(59 130 246 /)', 'rgb(59 130 / 246 / 1)', 'rgb(59 130 246 / 0.5 1)', 'rgb(59 130)'])
  })

  it('hsl：旧式写法的饱和度与明度写百分数，新式写法另认数与 none；色相写数或角度', () => {
    expectAccepted(['hsl(217, 91%, 60%)', 'hsla(217deg, 91%, 60%, 50%)', 'hsl(217 91% 60%)', 'hsl(217 91 60)', 'hsl(0.6turn 91% 60% / 50%)', 'hsl(none 0% 50%)'])
    expect(colorParse('hsl(217 91 60)')).toEqual(colorParse('hsl(217, 91%, 60%)'))
    expectRejected(['hsl(217, 91, 60)', 'hsl(217 91%, 60%)', 'hsla(210 50%, 13.3%, 0.4)', 'hsl(50%, 91%, 60%)', 'hsl(50% 91% 60%)', 'hsl(217, 91%, 60% / 0.5)', 'hsl(none, 91%, 60%)'])
  })

  it('oklch、oklab、color() 只有新式写法，各分量只认规范里的种类', () => {
    expectAccepted(['oklch(60% 0.1 30deg / 0.5)', 'oklab(0.5 10% -10%)', 'color(srgb 1 0 0 / 50%)', 'color(srgb-linear 50% none 0)'])
    expectRejected(['oklch(0.6, 0.1, 30)', 'oklab(0.5, 0.1, 0.1)', 'color(srgb, 1, 0, 0)', 'oklch(0.6 0.1 30%)', 'oklch(0.6 0.1deg 30)', 'oklab(0.5 0.1deg 0.1)', 'color(srgb 1deg 0 0)'])
  })

  it('数要合 CSS 的写法：十六进制要带 #，不认 0x、小数点结尾、无穷与别的单位', () => {
    expectAccepted(['#3b82f6', 'rgb(1e2 0 0)', 'rgb(+10 0.5e1 .5)'])
    expect(colorParse('rgb(1e2 0 0)')).toEqual({ r: 100, g: 0, b: 0, a: 1 })
    expect(colorParse('rgb(+10 0.5e1 0)')).toEqual({ r: 10, g: 5, b: 0, a: 1 })
    expectRejected(['3b82f6', 'ff0000', 'rgb(0x10 0 0)', 'rgb(1. 2 3)', 'rgb(10deg 0 0)', 'rgb(10px 0 0)', 'rgb(infinity 0 0)', 'rgb(1e999 0 0)', 'rgb(1e 0 0)'])
    // 不带 # 的十六进制只有 colorHexToRgba 收：它管的是十六进制通道的输入，不是 CSS 写法
    expect(colorHexToRgba('3b82f6')).toEqual(BLUE)
  })
})
