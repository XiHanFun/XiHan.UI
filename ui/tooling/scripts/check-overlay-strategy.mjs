#!/usr/bin/env node
// 门禁：浮层族的坐标系三处必须同步——机器传给引擎的 strategy、connect 产出的内联 position、
// 皮肤里 positioner 规则的 position。任意一处走岔，引擎按一套坐标算、CSS 按另一套渲染，
// 整族浮层会偏掉一个 scrollY，而且没有任何现成判据会红。
import {
  COMPOSED,
  discoverFamilies,
  HEADLESS,
  NO_SKIN_RULE,
  NOT_ENGINE_POSITIONED,
  read,
  SKIN_POSITIONED,
  SKINS,
  verifySkinPositioned,
} from './lib/overlay-families.mjs'

/** 取出 [data-part='positioner'] 那条规则的声明块。 */
function positionerRule(css) {
  const at = css.indexOf('data-part=\'positioner\']')
  if (at === -1)
    return null
  const open = css.indexOf('{', at)
  const close = css.indexOf('}', open)
  return open === -1 || close === -1 ? null : css.slice(open, close)
}

const problems = []
const discovered = await discoverFamilies()
const FAMILIES = discovered.filter(name => !(name in NOT_ENGINE_POSITIONED))

for (const name of Object.keys(NOT_ENGINE_POSITIONED)) {
  if (!discovered.includes(name))
    problems.push(`${name}：登记在「不吃引擎坐标」里，但它已经没有 positioner 部件了`)
}

for (const name of Object.keys(SKIN_POSITIONED)) {
  for (const err of await verifySkinPositioned(name))
    problems.push(`${name}：登记在 SKIN_POSITIONED（${SKIN_POSITIONED[name]}），但 ${err}`)
}

for (const name of FAMILIES) {
  const machineOwner = COMPOSED[name] ?? name
  const machine = await read(`${HEADLESS}/${machineOwner}/${machineOwner}.machine.ts`)
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const css = await read(`${SKINS}/${name}.css`)

  if (machine == null)
    problems.push(`${name}：找不到机器（${machineOwner}），没有自己机器的组件要登记进 COMPOSED`)
  if (connect == null)
    problems.push(`${name}：找不到 connect`)

  if (machine && !machine.includes('strategy: \'fixed\''))
    problems.push(`${name}：机器（${machineOwner}）没给引擎传 strategy: 'fixed'`)

  if (connect && !connect.includes('position: \'fixed\''))
    problems.push(`${name}：connect 的 positioner 没产出 position: 'fixed'`)

  if (css && !NO_SKIN_RULE.has(name)) {
    const rule = positionerRule(css)
    if (rule == null)
      problems.push(`${name}：皮肤里找不到 positioner 规则`)
    else if (/position:\s*absolute/.test(rule))
      problems.push(`${name}：皮肤的 positioner 仍是 position: absolute`)
    else if (!/position:\s*fixed/.test(rule))
      problems.push(`${name}：皮肤的 positioner 没声明 position: fixed`)
  }
}

if (problems.length) {
  console.error('[check-overlay-strategy] ✗ 浮层坐标系三处不同步：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('机器的 strategy、connect 的内联 position、皮肤的 positioner 规则必须同为 fixed。')
  process.exit(1)
}

console.log(`[check-overlay-strategy] 通过：${FAMILIES.length} 个浮层族的坐标系三处一致（另有 ${Object.keys(NOT_ENGINE_POSITIONED).length} 个不吃引擎坐标、${Object.keys(SKIN_POSITIONED).length} 个由皮肤排布）`)
