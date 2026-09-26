// 图表分类色板：tokens/chart.palette.json 由 build/emit-chart-palette.mjs 从基础色板搜出来。
// 这里核三件事：生成物与重新搜索的结果逐字一致（没人手改、基础色板改了就得重跑生成）、
// 不取的色相确实不在色板里、色槽 1 与品牌色同色相。色板本身的各项检查由 check-chart-palette 门禁判。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EXCLUDED_HUES,
  FIRST_HUE,
  loadPrimitiveColors,
  loadSurfaces,
  paletteDocument,
  parseOklch,
  SLOTS,
  solveCategorical,
  toOklch,
} from '../build/emit-chart-palette.mjs'

const TOKENS_DIR = join(import.meta.dirname, '../tokens')

interface ColorToken { $type: string, $value: string }
type ChartGroup = Record<string, ColorToken | string>
type PaletteFile = Record<'light' | 'dark', { chart: { 'categorical': ChartGroup, 'on-categorical': ChartGroup } }>

const committed = JSON.parse(readFileSync(join(TOKENS_DIR, 'chart.palette.json'), 'utf8')) as PaletteFile
const primitive = JSON.parse(readFileSync(join(TOKENS_DIR, 'primitive.json'), 'utf8')) as { color: Record<string, Record<string, ColorToken>> }

function slotRefs(group: ChartGroup): string[] {
  return Array.from({ length: SLOTS }, (_, i) => (group[String(i + 1)] as ColorToken).$value)
}

describe('图表分类色板', () => {
  it('生成物与按当前基础色板重新搜索的结果逐字一致', async () => {
    const { colors, hues } = await loadPrimitiveColors()
    const surfaces = await loadSurfaces(colors)
    const fresh = paletteDocument(colors, surfaces, solveCategorical(colors, hues, surfaces))
    expect(committed).toEqual(fresh)
  })

  it('亮暗两套各 8 个色槽，同一色槽同一色相，不取排除的色相', () => {
    const hueOf = (ref: string): string => /^\{color\.([a-z]+)\.\d+\}$/.exec(ref)![1]!
    const light = slotRefs(committed.light.chart.categorical).map(hueOf)
    const dark = slotRefs(committed.dark.chart.categorical).map(hueOf)
    expect(light).toHaveLength(SLOTS)
    expect(new Set(light).size).toBe(SLOTS)
    expect(dark).toEqual(light)
    for (const hue of Object.keys(EXCLUDED_HUES))
      expect(light).not.toContain(hue)
  })

  it('色槽 1 取品牌色相', () => {
    const first = /^\{color\.([a-z]+)\.\d+\}$/.exec(slotRefs(committed.light.chart.categorical)[0]!)!
    expect(first[1]).toBe(FIRST_HUE)
    const brand = toOklch(parseOklch(primitive.color.brand!['600']!.$value)).h
    const palette = JSON.parse(readFileSync(join(TOKENS_DIR, 'primitive.palette.json'), 'utf8')) as { color: Record<string, Record<string, ColorToken>> }
    const indigo = toOklch(parseOklch(palette.color[FIRST_HUE]!['600']!.$value)).h
    expect(Math.abs(indigo - brand)).toBeLessThan(1)
  })
})
