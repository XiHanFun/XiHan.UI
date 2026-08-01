// 令牌层的对比度判据：直接读令牌源算，不依赖渲染。
// axe 的 color-contrast 只管文字，非文本对比度（SC 1.4.11，控件边界）它一条都看不到，
// 那一类只能在这里守。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const TOKENS_DIR = join(import.meta.dirname, '../tokens')

interface TokenNode { $value?: string, [k: string]: unknown }

function loadJson(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8'))
}

const primitive = loadJson('primitive.json')
const themes = {
  light: loadJson('semantic.light.json'),
  dark: loadJson('semantic.dark.json'),
} as const

function at(root: unknown, path: string): TokenNode | undefined {
  let node = root as Record<string, unknown> | undefined
  for (const seg of path.split('.')) {
    node = node?.[seg] as Record<string, unknown> | undefined
    if (!node)
      return undefined
  }
  return node as TokenNode
}

/** 语义令牌的值是 `{color.neutral.500}` 这类引用，解析到 primitive 的终值。 */
function resolve(theme: keyof typeof themes, path: string): string {
  const node = at(themes[theme], path)
  if (!node?.$value)
    throw new Error(`令牌不存在：${theme} ${path}`)
  const ref = /^\{(.+)\}$/.exec(node.$value)
  if (!ref)
    return node.$value
  const target = at(primitive, ref[1]!)
  if (!target?.$value)
    throw new Error(`引用解析不到：${node.$value}`)
  return target.$value
}

function gammaEncode(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** oklch(L C H) → 线性 sRGB 三元组，超出色域的分量按 [0,1] 截断。 */
function oklchToLinearRgb(css: string): [number, number, number] {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(css)
  if (!m)
    throw new Error(`不是 oklch 颜色：${css}`)
  const [lightness, chroma, hue] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const h = (hue * Math.PI) / 180
  const a = chroma * Math.cos(h)
  const b = chroma * Math.sin(h)

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3

  const rgb: [number, number, number] = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ]
  // 先按 sRGB 传输函数往返一次再取线性值，与浏览器把超色域颜色钳进 sRGB 的结果一致
  return rgb.map((v) => {
    const encoded = Math.min(1, Math.max(0, gammaEncode(v)))
    return encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
}

function luminance(css: string): number {
  const [r, g, b] = oklchToLinearRgb(css)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(theme: keyof typeof themes, fg: string, bg: string): number {
  const a = luminance(resolve(theme, fg))
  const b = luminance(resolve(theme, bg))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

// 正文与次要文字，WCAG 1.4.3 AA 要求 4.5:1
const TEXT_PAIRS: ReadonlyArray<[keyof typeof themes, string, string]> = [
  ['light', 'fg.default', 'bg.canvas'],
  ['light', 'fg.default', 'bg.surface'],
  ['light', 'fg.default', 'bg.subtle'],
  ['light', 'fg.muted', 'bg.canvas'],
  ['light', 'fg.muted', 'bg.surface'],
  ['light', 'fg.muted', 'bg.subtle'],
  ['light', 'fg.subtle', 'bg.canvas'],
  ['light', 'fg.subtle', 'bg.surface'],
  ['light', 'fg.subtle', 'bg.subtle'],
  ['light', 'fg.on-brand', 'bg.brand'],
  ['dark', 'fg.default', 'bg.canvas'],
  ['dark', 'fg.default', 'bg.surface'],
  ['dark', 'fg.default', 'bg.subtle'],
  ['dark', 'fg.muted', 'bg.canvas'],
  ['dark', 'fg.muted', 'bg.surface'],
  ['dark', 'fg.muted', 'bg.subtle'],
  ['dark', 'fg.subtle', 'bg.canvas'],
  ['dark', 'fg.subtle', 'bg.surface'],
  ['dark', 'fg.subtle', 'bg.subtle'],
  ['dark', 'fg.on-brand', 'bg.brand'],
]

// 控件边界，WCAG 1.4.11 要求 3:1。当前一条都不达标，先按棘轮钉住不许更差；
// 达标要引一支专供控件边界的令牌并改皮肤，那是一次带视觉确认的改动。
const BORDER_RATCHET: ReadonlyArray<[keyof typeof themes, string, string, number]> = [
  ['light', 'border.default', 'bg.canvas', 1.26],
  ['light', 'border.default', 'bg.surface', 1.26],
  ['light', 'border.strong', 'bg.canvas', 1.48],
  ['light', 'border.subtle', 'bg.canvas', 1.1],
  ['dark', 'border.default', 'bg.canvas', 1.91],
  ['dark', 'border.default', 'bg.surface', 1.71],
  ['dark', 'border.strong', 'bg.canvas', 2.54],
  ['dark', 'border.subtle', 'bg.canvas', 1.31],
]

describe('文字对比度（WCAG 1.4.3 AA，4.5:1）', () => {
  for (const [theme, fg, bg] of TEXT_PAIRS) {
    it(`${theme} ${fg} / ${bg}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('禁用态按 1.4.3 豁免，只钉住不比正文更差', () => {
  it('light fg.disabled / bg.canvas 仍可辨', () => {
    expect(round(contrast('light', 'fg.disabled', 'bg.canvas'))).toBeGreaterThanOrEqual(2.5)
  })
  it('dark fg.disabled / bg.canvas 仍可辨', () => {
    expect(round(contrast('dark', 'fg.disabled', 'bg.canvas'))).toBeGreaterThanOrEqual(2.5)
  })
})

describe('边界对比度棘轮（目标 SC 1.4.11 的 3:1，当前未达标）', () => {
  for (const [theme, fg, bg, baseline] of BORDER_RATCHET) {
    it(`${theme} ${fg} / ${bg} 不低于 ${baseline}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(baseline)
    })
  }
})
