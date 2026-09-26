#!/usr/bin/env node
// 门禁：图表数据色（--xh-chart-*）在亮暗两套主题下都要过色板检查。
//
// 分类色板由 packages/design/tokens/build/emit-chart-palette.mjs 从基础色板搜出来，其余数据色在
// semantic.light / semantic.dark 的 chart 组里手写。这条门禁不看令牌源，看产物：从 tokens.css 把每支
// --xh-chart-* 沿 var() 追到 oklch() 字面量，按生成器的同一套检查逐项判，承载面取各自主题的 --xh-bg-surface。
//   分类 1…8          明度带、彩度下限、对比度 ≥ 3、相邻与前 3 色两两的正常视觉 / 色觉障碍 ΔE、任意两色 ΔE、
//                     色相分散、离开 danger 语气各档
//   亮暗顺序          同一色槽同一色相，色槽 1 为品牌色相
//   色块内文字        on-categorical-N 对 categorical-N ≥ 4.5
//   有序 1…6          单色相、明度单调、由强到弱、最弱一档 ≥ 2
//   顺序 start…end    单色相、明度单调、小值贴近表面、终点 ≥ 3
//   发散              两臂等档、两端 ≥ 3 且色觉障碍下可分、两端离开 danger 各档、中点中性且贴近表面
//   涨跌              对比度、色觉障碍与正常视觉 ΔE、涨为成功色相、跌为危险色相
//   其他 / 淡出        都是中性色；其他照常可读且与各色槽拉得开，淡出弱于每个色槽
// 这里不另写一份颜色数学：检查与度量都从生成器模块引，与 @xihan-ui/viz 的对拍由 tooling/testing 的
// chart-palette 用例负责。
import { readFile } from 'node:fs/promises'
import {
  checkCategorical,
  checkDiverging,
  checkNeutrals,
  checkOnColors,
  checkOrder,
  checkOrdinal,
  checkRiseFall,
  checkSequential,
  contrastRatio,
  formatHex,
  MODES,
  parseOklch,
  SLOTS,
} from '../../../packages/design/tokens/build/emit-chart-palette.mjs'

const TOKENS = 'packages/design/tokens/tokens.css'
const ORDINAL = 6

/** 摘掉 @media 块：强制色、减少透明、减弱动效、打印都是条件档，不是主题的缺省取值。 */
function withoutMedia(css) {
  let out = ''
  let i = 0
  while (i < css.length) {
    const at = css.indexOf('@media', i)
    if (at === -1)
      return out + css.slice(i)
    out += css.slice(i, at)
    let depth = 0
    let j = css.indexOf('{', at)
    for (; j < css.length; j++) {
      if (css[j] === '{')
        depth++
      else if (css[j] === '}' && --depth === 0)
        break
    }
    i = j + 1
  }
  return out
}

/** tokens.css 的取值块：只认零特指度的 :where() 选择器与 --xh-* 声明。 */
function parseBlocks(css) {
  const blocks = []
  for (const hit of withoutMedia(css.replace(/\/\*[\s\S]*?\*\//g, '')).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = hit[1].split(',').map(part => part.trim().replace(/\s+/g, ' '))
    const decls = new Map()
    for (const d of hit[2].matchAll(/(--xh-[\w-]+):([^;]+);/g))
      decls.set(d[1], d[2].trim())
    if (decls.size > 0)
      blocks.push({ selectors, decls })
  }
  return blocks
}

/** 根块（原语、基线）叠上主题块，按书写顺序后者覆盖前者。 */
function themeValues(blocks, theme) {
  const own = `:where([data-theme='${theme}'])`
  const out = new Map()
  for (const { selectors, decls } of blocks) {
    if (!selectors.includes(':where(:root)') && !selectors.includes(own))
      continue
    if (theme !== 'light' && selectors.includes(':where(:root)') && selectors.includes(':where([data-theme=\'light\'])'))
      continue
    for (const [name, value] of decls)
      out.set(name, value)
  }
  return out
}

function resolver(values, theme) {
  return function resolve(name, seen = []) {
    if (seen.includes(name))
      throw new Error(`${theme} 档里 ${[...seen, name].join(' → ')} 成环`)
    const value = values.get(name)
    if (value === undefined)
      throw new Error(`${theme} 档里没有声明 ${name}`)
    const ref = /^var\((--xh-[\w-]+)\)$/.exec(value)
    return ref ? resolve(ref[1], [...seen, name]) : { value, chain: [...seen, name] }
  }
}

const blocks = parseBlocks(await readFile(TOKENS, 'utf8'))
const failures = []
const lines = []

const colorsOf = {}
for (const mode of MODES) {
  const values = themeValues(blocks, mode)
  const resolve = resolver(values, mode)
  const color = name => parseOklch(resolve(name).value)
  const origin = name => resolve(name).chain.at(-1).replace('--xh-color-', '')
  const surface = color('--xh-bg-surface')
  const danger = [...values.keys()].filter(name => /^--xh-color-danger-\d+$/.test(name)).map(color)
  const categorical = Array.from({ length: SLOTS }, (_, i) => color(`--xh-chart-categorical-${i + 1}`))
  const on = Array.from({ length: SLOTS }, (_, i) => color(`--xh-chart-on-categorical-${i + 1}`))
  colorsOf[mode] = { categorical, brand: color('--xh-color-brand-600') }

  lines.push(`  ${mode}（承载面 ${formatHex(surface)}）`)
  lines.push(`    分类  ${categorical.map((c, i) => `${origin(`--xh-chart-categorical-${i + 1}`)} ${formatHex(c)} ${contrastRatio(c, surface).toFixed(2)}`).join(' · ')}`)

  const checks = [
    ...checkCategorical(categorical, { mode, surface, danger }),
    ...checkOnColors(categorical, on),
    ...checkOrdinal(Array.from({ length: ORDINAL }, (_, i) => color(`--xh-chart-ordinal-${i + 1}`)), { surface }),
    ...checkSequential(['start', 'mid', 'end'].map(step => color(`--xh-chart-sequential-${step}`)), { surface }),
    ...checkDiverging(['negative', 'center', 'positive'].map(step => color(`--xh-chart-diverging-${step}`)), { surface, danger }),
    ...checkRiseFall(color('--xh-chart-rise'), color('--xh-chart-fall'), {
      surface,
      success: color('--xh-color-success-600'),
      danger: color('--xh-color-danger-600'),
    }),
    ...checkNeutrals({ other: color('--xh-chart-categorical-other'), deemphasis: color('--xh-chart-deemphasis') }, categorical, { surface }),
  ]
  for (const check of checks) {
    const measured = check.worst === null ? '' : `${check.worst.toFixed(2)}${check.where ? `（${check.where}）` : ''}`
    lines.push(`    ${check.pass ? '✓' : '✗'} ${check.label.padEnd(18)} ${measured.padEnd(14)} ${check.limit}`)
    if (!check.pass)
      failures.push(`${mode} ${check.label}：${measured || '不成立'}，要求 ${check.limit}`)
  }
}

for (const check of checkOrder(colorsOf.light.categorical, colorsOf.dark.categorical, colorsOf.light.brand)) {
  lines.push(`  ${check.pass ? '✓' : '✗'} ${check.label} ${check.worst.toFixed(1)}° ${check.limit}`)
  if (!check.pass)
    failures.push(`${check.label}：${check.worst.toFixed(1)}°，要求 ${check.limit}`)
}

if (process.argv.includes('--verbose') || failures.length > 0)
  console.log(lines.join('\n'))

if (failures.length > 0) {
  console.error('[check-chart-palette] ✗ 图表数据色不达标：')
  for (const failure of failures)
    console.error(`  ${failure}`)
  console.error('分类色板改基础色板或生成器的规则后重跑 pnpm --filter @xihan-ui/tokens gen；其余数据色改 semantic.light / semantic.dark 的 chart 组。')
  process.exit(1)
}

console.log(`[check-chart-palette] 通过：亮暗两套 × 分类 ${SLOTS} 色、有序 ${ORDINAL} 档、顺序、发散、涨跌与中性色全部达标（--verbose 打印度量）`)
