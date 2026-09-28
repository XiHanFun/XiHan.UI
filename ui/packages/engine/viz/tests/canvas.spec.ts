import type { PathSink } from '../src'
import type { CssColor } from '../src/canvas'
import { describe, expect, it } from 'vitest'
import { createColorRamp, formatCssColor, formatSrgbColor, mixCssColor, parseCssColor, srgbOf, traceBand, tracePolyline } from '../src/canvas'

/** 记下调用序列的接收端：路径写了什么一目了然。 */
function recorder(): PathSink & { calls: string[] } {
  const calls: string[] = []
  const log = (name: string) => (...args: (number | boolean | undefined)[]): void => {
    calls.push(`${name}(${args.map(v => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)).join(',')})`)
  }
  return {
    calls,
    moveTo: log('M'),
    lineTo: log('L'),
    bezierCurveTo: log('C'),
    quadraticCurveTo: log('Q'),
    arc: log('A'),
    arcTo: log('T'),
    rect: log('R'),
    closePath: () => calls.push('Z'),
  }
}

/** 两个颜色在 sRGB 上逐通道相差不超过 eps。 */
function near(a: CssColor, b: CssColor, eps = 1e-4): boolean {
  const x = srgbOf(a)
  const y = srgbOf(b)
  return x.every((v, i) => Math.abs(v - (y[i] as number)) <= eps)
}

describe('颜色解析', () => {
  it('认浏览器计算样式给出的写法，保留原来的空间', () => {
    expect(parseCssColor('rgb(255, 0, 128)')).toEqual({ space: 'srgb', coords: [1, 0, 128 / 255], alpha: 1 })
    expect(parseCssColor('rgba(0, 0, 0, 0.5)')!.alpha).toBe(0.5)
    expect(parseCssColor('rgb(0 0 0 / 25%)')!.alpha).toBe(0.25)
    expect(parseCssColor('#ff000080')!.alpha).toBeCloseTo(128 / 255)
    expect(parseCssColor('oklch(0.62 0.19 259.8)')).toEqual({ space: 'oklch', coords: [0.62, 0.19, 259.8], alpha: 1 })
    expect(parseCssColor('oklch(0.5 0 none / 0.4)')!.coords[2]).toBeNaN()
    expect(parseCssColor('oklab(0.6 0.1 -0.05)')!.space).toBe('oklab')
    expect(parseCssColor('color(srgb 0.1 0.2 0.3)')).toEqual({ space: 'srgb', coords: [0.1, 0.2, 0.3], alpha: 1 })
    expect(parseCssColor('color(srgb-linear 1 0 0)')!.space).toBe('srgb-linear')
    expect(parseCssColor('transparent')!.alpha).toBe(0)
  })

  it('认不出的写法返回 null，不猜', () => {
    expect(parseCssColor('url("#p")')).toBeNull()
    expect(parseCssColor('red')).toBeNull()
    expect(parseCssColor('lab(50 20 30)')).toBeNull()
    expect(parseCssColor('rgb(1 2)')).toBeNull()
  })
})

describe('color-mix', () => {
  const blue = parseCssColor('oklch(0.6 0.2 260)')!
  const red = parseCssColor('oklch(0.6 0.2 20)')!

  it('oklch：权重按 a 计，色相走较短的那段弧（260° 与 20° 之间经过 320°）', () => {
    const mid = mixCssColor(blue, red, 0.5, 'oklch')
    expect(mid.space).toBe('oklch')
    expect(mid.coords[0]).toBeCloseTo(0.6)
    expect(mid.coords[2]).toBeCloseTo(320)
    expect(mixCssColor(blue, red, 1, 'oklch').coords[2]).toBeCloseTo(260)
    expect(mixCssColor(blue, red, 0, 'oklch').coords[2]).toBeCloseTo(20)
  })

  it('一端无色相时取另一端的色相；两端都无色相时结果也无色相', () => {
    const gray = parseCssColor('oklch(0.5 0 none)')!
    expect(mixCssColor(gray, blue, 0.5, 'oklch').coords[2]).toBeCloseTo(260)
    const white = parseCssColor('rgb(255, 255, 255)')!
    expect(mixCssColor(white, blue, 0.5, 'oklch').coords[2]).toBeCloseTo(260)
    expect(mixCssColor(gray, white, 0.5, 'oklch').coords[2]).toBeNaN()
  })

  it('alpha 预乘：半透明的一端对明度的贡献按它的不透明度打折', () => {
    const clear = parseCssColor('oklab(1 0 0 / 0)')!
    const dark = parseCssColor('oklab(0.2 0 0)')!
    const mixed = mixCssColor(clear, dark, 0.5, 'oklab')
    expect(mixed.alpha).toBeCloseTo(0.5)
    // 全透明的白不参与颜色，结果仍是那个暗色
    expect(mixed.coords[0]).toBeCloseTo(0.2)
  })

  it('srgb 空间按通道线性混合，写成 color(srgb …)', () => {
    const mixed = mixCssColor(parseCssColor('rgb(255, 0, 0)')!, parseCssColor('rgb(0, 0, 255)')!, 0.25, 'srgb')
    expect(mixed.coords[0]).toBeCloseTo(0.25)
    expect(mixed.coords[2]).toBeCloseTo(0.75)
    expect(formatCssColor(mixed)).toBe('color(srgb 0.25 0 0.75)')
  })

  it('跨空间：rgb 与 oklch 混合前先换到插值空间，端点混合等于端点本身', () => {
    const rgb = parseCssColor('rgb(40, 120, 200)')!
    expect(near(mixCssColor(rgb, blue, 1, 'oklch'), rgb)).toBe(true)
    expect(near(mixCssColor(rgb, blue, 1, 'oklab'), rgb)).toBe(true)
  })
})

describe('写回', () => {
  it('oklch 写函数式、无色相写 none、带 alpha 用斜线', () => {
    expect(formatCssColor({ space: 'oklch', coords: [0.5, 0.1, Number.NaN], alpha: 0.5 })).toBe('oklch(0.5 0.1 none / 0.5)')
    expect(formatCssColor({ space: 'oklab', coords: [0.5, 0.1, -0.1], alpha: 1 })).toBe('oklab(0.5 0.1 -0.1)')
  })

  it('sRGB 写法按通道截断，不降彩度', () => {
    // 高彩度的 oklch 落在 sRGB 之外：截断后绿、蓝两个通道贴到边上
    const vivid = parseCssColor('oklch(0.7 0.35 150)')!
    const text = formatSrgbColor(vivid)
    expect(text).toMatch(/^rgb\(\d+ 255 \d+\)$|^rgb\(0 \d+ \d+\)$/)
    expect(formatSrgbColor(parseCssColor('rgb(10, 20, 30)')!)).toBe('rgb(10 20 30)')
  })
})

describe('色阶查找表', () => {
  const start = parseCssColor('oklch(0.9 0.05 260)')!
  const mid = parseCssColor('oklch(0.6 0.15 260)')!
  const end = parseCssColor('oklch(0.3 0.12 260)')!

  it('三个锚点：0、0.5、1 取锚点本身，两段之间按插值空间混合', () => {
    const ramp = createColorRamp([start, mid, end], 'oklch', 257)
    expect(ramp(0)).toBe(formatCssColor(start))
    expect(ramp(0.5)).toBe(formatCssColor(mid))
    expect(ramp(1)).toBe(formatCssColor(end))
    // 0.25 在前一段正中：等于 color-mix(in oklch, mid 50%, start)
    expect(ramp(0.25)).toBe(formatCssColor(mixCssColor(mid, start, 0.5, 'oklch')))
    expect(ramp(-1)).toBe(ramp(0))
    expect(ramp(Number.NaN)).toBe(ramp(0))
  })
})

describe('类型化数组上的路径', () => {
  it('折线在 NaN 处断开，每段 M 起', () => {
    const sink = recorder()
    tracePolyline(sink, [0, 10, 20, 30, 40], [1, 2, Number.NaN, 4, 5], 5)
    expect(sink.calls).toEqual(['M(0,1)', 'L(10,2)', 'M(30,4)', 'L(40,5)'])
  })

  it('阶梯：step 在两点中间转折，step-after 先横后竖', () => {
    const mid = recorder()
    tracePolyline(mid, [0, 10], [0, 5], 2, 'step')
    expect(mid.calls).toEqual(['M(0,0)', 'L(5,0)', 'L(5,5)', 'L(10,5)'])
    const after = recorder()
    tracePolyline(after, [0, 10], [0, 5], 2, 'step-after')
    expect(after.calls).toEqual(['M(0,0)', 'L(10,0)', 'L(10,5)'])
  })

  it('面积：沿上沿走过去，从末点落到基线再回到首点，闭合；断开处各自闭合', () => {
    const sink = recorder()
    traceBand(sink, [0, 10, 20, 30], [5, 6, Number.NaN, 8], 100, 4)
    expect(sink.calls).toEqual(['M(0,5)', 'L(10,6)', 'L(10,100)', 'L(0,100)', 'Z', 'M(30,8)', 'L(30,100)', 'L(30,100)', 'Z'])
  })

  it('区间带：下沿反着走回来', () => {
    const sink = recorder()
    traceBand(sink, [0, 10, 20], [1, 2, 3], [9, 8, 7], 3)
    expect(sink.calls).toEqual(['M(0,1)', 'L(10,2)', 'L(20,3)', 'L(20,7)', 'L(10,8)', 'L(0,9)', 'Z'])
  })
})
