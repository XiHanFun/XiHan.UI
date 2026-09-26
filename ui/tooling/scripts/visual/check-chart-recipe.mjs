#!/usr/bin/env node
// 门禁：Chart 家族配方的生成物与真源一致；配方与 headless 的纹理形状逐项相同；每份 @import 了它的图表皮肤，都在部件上把自己的组件槽
// 接进了配方要的私有槽。漏接一条，配方里那处取值就落空（gap 变 normal、圆角变 0），而且不报错。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CHART_CONTRACT_FIELDS, CHART_LINE_CONTRACT_FIELDS, emitChartRecipe } from '../../../packages/design/styles/build/chart-recipe.mjs'

const STYLES_DIR = 'packages/design/styles/css'
const RECIPE = 'packages/design/styles/recipes/chart.recipe.json'
const PATTERNS = 'packages/engine/headless/src/shared/chart/patterns.ts'
const IMPORT = `@import '../family/chart.css';`

try {
  const result = await emitChartRecipe({ check: true })
  const problems = []
  const skins = []
  for (const file of (await readdir(STYLES_DIR)).filter(name => name.endsWith('.css')).sort()) {
    const css = await readFile(join(STYLES_DIR, file), 'utf8')
    if (!css.includes(IMPORT))
      continue
    skins.push(file)
    // 画折线色标（data-mark="line"）的图表才要接折线那两条
    const lines = css.includes(`[data-mark='line']`)
    for (const field of CHART_CONTRACT_FIELDS) {
      if (!lines && CHART_LINE_CONTRACT_FIELDS.includes(field))
        continue
      const slot = result.contract[field]
      if (!new RegExp(`${slot}\\s*:`).test(css))
        problems.push(`css/${file} 没有接配方的私有槽 ${slot}（${field}）`)
    }
  }
  if (skins.length === 0)
    problems.push('没有一份皮肤引入 family/chart.css')

  // 色标上的纹理由配方画，绘图区里的纹理由 headless 画：两边的方向、线距与交叉必须逐项相同
  const recipe = JSON.parse(await readFile(RECIPE, 'utf8'))
  const source = await readFile(PATTERNS, 'utf8')
  const shapes = [...source.matchAll(/\{\s*angle:\s*(\d+),\s*spacing:\s*([\d.]+),\s*cross:\s*(true|false)\s*\}/g)]
    .map(m => `${Number(m[1])}/${Number(m[2])}/${m[3]}`)
  const wanted = recipe.patterns.map(p => `${p.angle}/${p.spacing}/${p.cross}`)
  if (shapes.join(',') !== wanted.join(','))
    problems.push(`配方的 patterns 与 ${PATTERNS} 的纹理形状对不上：配方 ${wanted.join(' ')}；headless ${shapes.join(' ') || '(没读到)'}`)
  if (problems.length) {
    console.error('[check-chart-recipe] ✗ 图表皮肤与家族配方的合同对不上：')
    problems.forEach(problem => console.error(`  ${problem}`))
    process.exit(1)
  }
  console.log(`[check-chart-recipe] 通过：${Object.keys(result.contract).length} 支合同槽，${skins.length} 份图表皮肤都接上了，生成物 ${result.bytes} bytes`)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
