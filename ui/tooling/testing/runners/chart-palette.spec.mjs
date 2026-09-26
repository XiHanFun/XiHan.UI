// 图表色板的两份实现对拍：令牌生成与门禁用的 packages/design/tokens/build/emit-chart-palette.mjs
// （只依赖 node 内置模块，跑在构建之前），与 @xihan-ui/viz 的 color 模块（使用者拿来校验自己的色板）。
// 两边的对比度、ΔE 与色觉障碍模拟必须逐值一致，令牌里的图表色板也必须过 viz 自己的检查——
// 否则门禁判的与使用者复验的就不是同一件事。
// 颜色换算只在 sRGB 色域内对拍：出界时令牌一侧按浏览器的画法逐通道截断，viz 固定明度与色相降彩度收回。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as tokens from '../../../packages/design/tokens/build/emit-chart-palette.mjs'
import * as viz from '../../../packages/engine/viz/src/color/index.ts'
import { oklabToLinearRgb } from '../../../packages/engine/viz/src/color/space.ts'

const TOKENS_DIR = join(import.meta.dirname, '../../../packages/design/tokens/tokens')
const read = name => JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8'))

const primitive = read('primitive.json').color
const palette = read('primitive.palette.json').color
const colors = { ...primitive, ...palette }
const chart = read('chart.palette.json')
const semantic = { light: read('semantic.light.json'), dark: read('semantic.dark.json') }

/** 全部原语颜色：十二色相 × 11 档与中性、品牌、语气各档。 */
const samples = Object.values(colors).flatMap(scale => Object.entries(scale).filter(([key]) => !key.startsWith('$')).map(([, token]) => token.$value))
const withAlpha = color => ({ ...color, a: 1 })
const close = (a, b) => expect(Math.abs(a - b)).toBeLessThan(1e-9)

function oklchOf(value) {
  const hit = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(value)
  return { l: Number(hit[1]), c: Number(hit[2]), h: Number(hit[3]), alpha: 1 }
}

describe('颜色换算与度量', () => {
  it('色域内的 oklch → sRGB 逐值一致', () => {
    const inGamut = samples.filter(value => oklabToLinearRgb(viz.oklchToOklab(oklchOf(value))).every(v => v >= 0 && v <= 1))
    expect(inGamut.length).toBeGreaterThan(50)
    for (const value of inGamut) {
      const ours = tokens.parseOklch(value)
      const theirs = viz.fromOklch(oklchOf(value))
      close(ours.r, theirs.r)
      close(ours.g, theirs.g)
      close(ours.b, theirs.b)
    }
  })

  it('对比度、ΔE 与两种色觉障碍模拟逐值一致', () => {
    const rgb = samples.map(tokens.parseOklch)
    for (let i = 0; i < rgb.length; i += 7) {
      for (let j = i + 3; j < rgb.length; j += 11) {
        close(tokens.contrastRatio(rgb[i], rgb[j]), viz.contrastRatio(withAlpha(rgb[i]), withAlpha(rgb[j])))
        close(tokens.deltaEOk(rgb[i], rgb[j]), viz.deltaEOk(withAlpha(rgb[i]), withAlpha(rgb[j])))
      }
      for (const kind of ['protan', 'deutan']) {
        const ours = tokens.simulateCvd(rgb[i], kind)
        const theirs = viz.simulateCvd(withAlpha(rgb[i]), kind)
        close(ours.r, theirs.r)
        close(ours.g, theirs.g)
        close(ours.b, theirs.b)
      }
    }
  })
})

describe('令牌里的图表色板过 viz 的检查', () => {
  const resolve = ref => tokens.resolvePrimitive(colors, ref)
  const surfaceOf = mode => resolve(semantic[mode].bg.surface.$value)
  const categoricalOf = mode => Array.from({ length: tokens.SLOTS }, (_, i) => resolve(chart[mode].chart.categorical[i + 1].$value))

  for (const mode of tokens.MODES) {
    it(`${mode} 分类色板：相邻与前 3 色两两都通过，最差值与门禁同值`, () => {
      const surface = withAlpha(surfaceOf(mode))
      const categorical = categoricalOf(mode)
      const other = categoricalOf(mode === 'light' ? 'dark' : 'light').map(withAlpha)
      const ours = Object.fromEntries(tokens.checkCategorical(categorical, { mode, surface }).map(check => [check.label, check.worst]))
      const adjacent = viz.validateCategoricalPalette(categorical.map(withAlpha), { mode, surface, pairs: 'adjacent', reference: other })
      const head = viz.validateCategoricalPalette(categorical.map(withAlpha), { mode, surface, pairs: 'all' })
      for (const report of [adjacent, head]) {
        expect(report.ok).toBe(true)
        expect(report.checks.filter(check => check.status === 'warn')).toEqual([])
      }
      const worst = (report, id) => report.checks.find(check => check.id === id).worst
      close(worst(adjacent, 'cvd'), ours['相邻 · 色觉障碍 ΔE'])
      close(worst(adjacent, 'distinct'), ours['相邻 · 正常视觉 ΔE'])
      close(worst(adjacent, 'contrast'), ours['对比度'])
      close(worst(head, 'cvd'), ours['前 3 色两两 · 色觉障碍 ΔE'])
      close(worst(head, 'distinct'), ours['前 3 色两两 · 正常视觉 ΔE'])
    })

    it(`${mode} 有序色阶通过`, () => {
      const ordinal = Object.entries(semantic[mode].chart.ordinal).filter(([key]) => !key.startsWith('$')).map(([, token]) => withAlpha(resolve(token.$value)))
      expect(viz.validateOrdinalRamp(ordinal, { mode, surface: withAlpha(surfaceOf(mode)) }).ok).toBe(true)
    })
  }
})
