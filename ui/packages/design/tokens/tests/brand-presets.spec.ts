// 预设品牌：brand.presets.json 里每档取基础色板的一个色相，由 build/emit-brand-presets.mjs 按缺省品牌的相对亮度派生。
// 这里核四件事：生成物没有漂移、每级相对亮度与缺省品牌对齐、导出的 id 清单与源一致、tokens.css 里每档都有取值块。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { deriveBrandPreset, relativeLuminance } from '../build/emit-brand-presets.mjs'
import { BRAND_PRESETS } from '../src'

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
type Step = (typeof STEPS)[number]

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(import.meta.dirname, '../tokens', name), 'utf8')) as T
}

const source = loadJson<Record<string, { palette: string } | string>>('brand.presets.json')
const seeds = loadJson<Record<string, { hue: number } | string>>('palette.seeds.json')
const generated = loadJson<{ brandPresets: Record<string, Record<string, { $value: string } | string>> }>('primitive.brand-presets.json').brandPresets
const brand = loadJson<{ color: { brand: Record<string, { $value: string } | string> } }>('primitive.json').color.brand
const base = Object.fromEntries(STEPS.map(step => [step, (brand[step] as { $value: string }).$value])) as Record<Step, string>
const ids = Object.keys(source).filter(key => !key.startsWith('$'))

function parse(css: string): [number, number, number] {
  const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(css)
  if (!m)
    throw new Error(`不是 oklch(L C H)：${css}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function luminanceOf(css: string): number {
  return relativeLuminance(...parse(css))
}

describe('预设品牌', () => {
  it('导出的 BRAND_PRESETS 与 brand.presets.json 同一组 id、同一个顺序', () => {
    expect([...BRAND_PRESETS]).toEqual(ids)
  })

  it.each(ids)('%s：生成物与派生结果逐级一致', (id) => {
    const preset = source[id] as { palette: string }
    const scale = deriveBrandPreset((seeds[preset.palette] as { hue: number }).hue, base)
    for (const step of STEPS)
      expect((generated[id]![step] as { $value: string }).$value, step).toBe(scale[step])
  })

  it.each(ids)('%s：每级相对亮度与缺省品牌对齐（相差不到 2%）', (id) => {
    for (const step of STEPS) {
      const target = luminanceOf(base[step])
      const actual = luminanceOf((generated[id]![step] as { $value: string }).$value)
      expect(Math.abs(actual - target) / target, step).toBeLessThan(0.02)
    }
  })

  it('色相取缺省品牌的那一个时，派生出的就是缺省品牌', () => {
    expect(deriveBrandPreset(parse(base['600'])[2], base)).toEqual(base)
  })

  it('tokens.css 里每档预设都有一个只换品牌原语的取值块', () => {
    const css = readFileSync(join(import.meta.dirname, '../tokens.css'), 'utf8')
    for (const id of ids) {
      const start = css.indexOf(`:where([data-brand='${id}']) {`)
      expect(start, id).toBeGreaterThan(-1)
      const block = css.slice(start, css.indexOf('}', start))
      for (const step of STEPS)
        expect(block, `${id} ${step}`).toContain(`--xh-color-brand-${step}: ${(generated[id]![step] as { $value: string }).$value};`)
      expect(block.match(/--xh-[\w-]+:/g), id).toHaveLength(STEPS.length)
    }
  })
})
