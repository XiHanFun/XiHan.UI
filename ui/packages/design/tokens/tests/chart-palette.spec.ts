// 图表分类色板：tokens/chart.palette.json 由 build/emit-chart-palette.mjs 从基础色板搜出来。
// 这里核四件事：生成物与重新搜索的结果逐字一致（没人手改、基础色板改了就得重跑生成）、
// 缺省色板是基础色往纯白里混出的浅色调、不取的色相确实不在色板里、色槽 1 与品牌色同色相；
// 另核 data-xh-chart-palette 三套方案各自的取色来源。
// 色板本身的各项检查由 check-chart-palette 门禁判。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BRAND_HUES,
  BRAND_PER_HUE,
  EXCLUDED_HUES,
  FIRST_HUE,
  loadPrimitiveColors,
  loadSurfaces,
  MONOCHROME,
  MUTED_TINT,
  paletteDocument,
  parseOklch,
  SCHEMES,
  SLOTS,
  solveCategorical,
  TINT,
  toOklch,
} from '../build/emit-chart-palette.mjs'

const TOKENS_DIR = join(import.meta.dirname, '../tokens')
const MODES = ['light', 'dark'] as const

interface ColorToken { $type: string, $value: string }
type ChartGroup = Record<string, ColorToken | string>
type PaletteFile = Record<'light' | 'dark', { chart: Record<string, ChartGroup> }>

const committed = JSON.parse(readFileSync(join(TOKENS_DIR, 'chart.palette.json'), 'utf8')) as PaletteFile
const primitive = JSON.parse(readFileSync(join(TOKENS_DIR, 'primitive.json'), 'utf8')) as { color: Record<string, Record<string, ColorToken>> }

function group(mode: typeof MODES[number], name: string): ChartGroup {
  const found = committed[mode].chart[name]
  if (!found)
    throw new Error(`chart.palette.json 的 ${mode} 档里没有 chart.${name}`)
  return found
}

function slotRefs(chart: ChartGroup): string[] {
  return Array.from({ length: SLOTS }, (_, i) => (chart[String(i + 1)] as ColorToken).$value)
}

const PRIMITIVE_REF = /^\{color\.([a-z]+)\.\d+\}$/
const TINT_REF = /^color-mix\(in oklab, \{color\.([a-z]+)\.\d+\} (\d+)%, \{color\.neutral\.0\}\)$/
/** 原语引用与往纯白里混出的浅色调都取它的基础色相。 */
const hueOf = (ref: string): string => (PRIMITIVE_REF.exec(ref) ?? TINT_REF.exec(ref))![1]!

describe('图表分类色板', () => {
  // 三套多色相方案各跑一次穷举搜索，本机约 3.5 秒；CI 的 2 核机器上会逼近 5 秒的缺省超时
  it('生成物与按当前基础色板重新搜索的结果逐字一致', async () => {
    const { colors, hues } = await loadPrimitiveColors()
    const surfaces = await loadSurfaces(colors)
    const fresh = await paletteDocument(colors, surfaces, solveCategorical(colors, hues, surfaces), hues)
    expect(committed).toEqual(fresh)
  }, 30_000)

  it('亮暗两套各 8 个色槽，同一色槽同一色相，不取排除的色相', () => {
    const light = slotRefs(group('light', 'categorical')).map(hueOf)
    const dark = slotRefs(group('dark', 'categorical')).map(hueOf)
    expect(light).toHaveLength(SLOTS)
    expect(new Set(light).size).toBe(SLOTS)
    expect(dark).toEqual(light)
    for (const hue of Object.keys(EXCLUDED_HUES))
      expect(light).not.toContain(hue)
  })

  it('缺省色板是浅色调：每个色槽都是基础色板的一档按 TINT 的比例往纯白里混合', () => {
    for (const mode of MODES) {
      for (const ref of slotRefs(group(mode, 'categorical'))) {
        const hit = TINT_REF.exec(ref)
        expect(hit, ref).not.toBeNull()
        expect(TINT.amounts).toContain(Number(hit![2]))
      }
    }
  })

  it('色槽 1 取品牌色相', () => {
    expect(hueOf(slotRefs(group('light', 'categorical'))[0]!)).toBe(FIRST_HUE)
    const brand = toOklch(parseOklch(primitive.color.brand!['600']!.$value)).h
    const palette = JSON.parse(readFileSync(join(TOKENS_DIR, 'primitive.palette.json'), 'utf8')) as { color: Record<string, Record<string, ColorToken>> }
    const indigo = toOklch(parseOklch(palette.color[FIRST_HUE]!['600']!.$value)).h
    expect(Math.abs(indigo - brand)).toBeLessThan(1)
  })

  it('每套方案亮暗各 8 个色块与 8 个色块内文字，缺省方案与 chart.categorical 同值', () => {
    for (const mode of MODES) {
      for (const scheme of SCHEMES) {
        expect(slotRefs(group(mode, `palette-${scheme}`))).toHaveLength(SLOTS)
        expect(slotRefs(group(mode, `palette-${scheme}-on`))).toHaveLength(SLOTS)
      }
      expect(slotRefs(group(mode, 'palette-categorical'))).toEqual(slotRefs(group(mode, 'categorical')))
      expect(slotRefs(group(mode, 'palette-categorical-on'))).toEqual(slotRefs(group(mode, 'on-categorical')))
    }
  })

  it('主题单色取品牌色阶由深到浅的浅色调：亮色从 500、暗色从 300 起，亮色末端往承载面里混', () => {
    for (const mode of MODES) {
      expect(slotRefs(group(mode, 'palette-monochrome'))).toEqual(MONOCHROME[mode].map(slot => typeof slot === 'string'
        ? `{color.brand.${slot}}`
        : `color-mix(in oklab, {color.brand.${slot.step}} ${slot.amount}%, {bg.surface})`))
    }
    expect(slotRefs(group('light', 'palette-monochrome'))[0]).toBe('{color.brand.500}')
    expect(slotRefs(group('dark', 'palette-monochrome'))[0]).toBe('{color.brand.300}')
  })

  it('柔和品牌只取品牌两侧的冷色一族与粉的浅色调，同一色相至多两档，色槽 1 是品牌色相', () => {
    for (const mode of MODES) {
      for (const ref of slotRefs(group(mode, 'palette-brand')))
        expect(TINT.amounts).toContain(Number(TINT_REF.exec(ref)?.[2]))
    }
    const hues = slotRefs(group('light', 'palette-brand')).map(hueOf)
    expect(hues[0]).toBe(FIRST_HUE)
    for (const hue of hues)
      expect(BRAND_HUES).toContain(hue)
    for (const hue of new Set(hues))
      expect(hues.filter(h => h === hue).length).toBeLessThanOrEqual(BRAND_PER_HUE)
    expect(slotRefs(group('dark', 'palette-brand')).map(hueOf)).toEqual(hues)
  })

  it('莫兰迪柔彩每个色槽都是基础色往浅灰里的 oklab 混合，色相互不重复', () => {
    const mixed = /^color-mix\(in oklab, \{color\.([a-z]+)\.\d+\} (\d+)%, (\{color\.neutral\.\d+\})\)$/
    for (const mode of MODES) {
      const hits = slotRefs(group(mode, 'palette-muted')).map(ref => mixed.exec(ref))
      expect(hits.every(hit => hit?.[3] === MUTED_TINT.toward && MUTED_TINT.amounts.includes(Number(hit[2])))).toBe(true)
      const hues = hits.map(hit => hit?.[1])
      expect(hues.every(Boolean)).toBe(true)
      expect(new Set(hues).size).toBe(SLOTS)
      expect(hues[0]).toBe(FIRST_HUE)
    }
  })
})
