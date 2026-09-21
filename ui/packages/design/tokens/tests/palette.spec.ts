// 基础色板：十二个色相 × 11 档，由 build/emit-palette.mjs 从 palette.seeds.json 派生。
// 这里核三件事：生成物没有漂移、每档明度与 color.brand 同值（换色相不改对比度）、
// 曲线与运行时 deriveBrandScale 的基线同源。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { derivePalette } from '../build/emit-palette.mjs'
import { deriveBrandScale } from '../src/runtime'

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

interface ColorToken { $type: string, $value: string }
type Scale = Record<string, ColorToken | string>

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(import.meta.dirname, '../tokens', name), 'utf8')) as T
}

const seeds = loadJson<Record<string, { hue: number } | string>>('palette.seeds.json')
const palette = loadJson<{ color: Record<string, Scale> }>('primitive.palette.json').color
const brand = loadJson<{ color: { brand: Record<string, ColorToken> } }>('primitive.json').color.brand

const HUES = Object.entries(seeds).filter((entry): entry is [string, { hue: number }] => !entry[0].startsWith('$'))

function parts(css: string): [number, number, number] {
  const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(css)
  if (!m)
    throw new Error(`不是 oklch 颜色：${css}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** 独立换算：oklch → 线性 sRGB，不截断，不复用被测代码。 */
function toLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

function value(scale: Scale, step: string): string {
  const token = scale[step]
  if (typeof token !== 'object')
    throw new Error(`缺 ${step} 档`)
  return token.$value
}

describe('基础色板的生成物', () => {
  it('十二个色相，名字与种子一一对上', () => {
    expect(HUES.length).toBe(12)
    expect(Object.keys(palette).sort()).toEqual(HUES.map(([name]) => name).sort())
  })

  it.each(HUES)('%s 的 11 档与 derivePalette 逐值一致（生成物没有漂移）', (name, seed) => {
    const derived = derivePalette(seed.hue) as Record<string, string>
    for (const step of STEPS)
      expect(value(palette[name]!, step), `${name}.${step}`).toBe(derived[step])
  })

  it.each(HUES)('%s 每档明度与 color.brand 同值、色相恒定、彩度不高过基线且落在 sRGB 色域内', (name, seed) => {
    for (const step of STEPS) {
      const [l, c, h] = parts(value(palette[name]!, step))
      const [brandL, brandC] = parts(brand[step]!.$value)
      expect(l, `${name}.${step} L`).toBe(brandL)
      expect(h, `${name}.${step} H`).toBe(seed.hue)
      expect(c, `${name}.${step} C`).toBeLessThanOrEqual(brandC)
      for (const channel of toLinearRgb(l, c, h))
        expect(channel, `${name}.${step} 色域`).toBeGreaterThanOrEqual(-0.05)
      for (const channel of toLinearRgb(l, c, h))
        expect(channel, `${name}.${step} 色域`).toBeLessThanOrEqual(1.05)
    }
  })

  it('同一档跨色相同一明度：换色相不改对比度', () => {
    for (const step of STEPS) {
      const lightness = new Set(HUES.map(([name]) => parts(value(palette[name]!, step))[0]))
      expect(lightness.size, step).toBe(1)
    }
  })

  it('色相 258 那一族（indigo）与 color.brand 逐值一致：品牌就是色板里的一员', () => {
    for (const step of STEPS)
      expect(value(palette.indigo!, step)).toBe(brand[step]!.$value)
  })

  it('曲线与运行时 deriveBrandScale 同源：拿基线 600 档当种子派生出的就是 indigo', () => {
    const runtime = deriveBrandScale(brand[600]!.$value)
    for (const step of STEPS)
      expect(value(palette.indigo!, step)).toBe(runtime[step])
  })
})
