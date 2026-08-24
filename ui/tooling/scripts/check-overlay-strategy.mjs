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

/**
 * 取出给 positioner 定坐标系的那条规则的声明块。
 *
 * 不能取「第一条提到 positioner 的规则」：皮肤里还有
 * `:is([data-part='root'], [data-part='positioner'])[data-size='sm']` 这类
 * 只发私有槽、不管定位的合并块，它们可能排在真正那条前面。
 * 判据取「选择器点到 positioner 且声明里真的写了 position」的第一条。
 */
function positionerRule(css) {
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector.includes('data-part=\'positioner\']'))
      continue
    if (/(?:^|;|\s)position\s*:/.test(body))
      return body
  }
  return null
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

// connect 在某个部件上发了 data-contained，皮肤就得给那个部件换坐标系。
// 只换一半是最坏的情形：遮罩缩进了容器、面板照旧贴视口边，而两头单看都像是对的。
for (const name of discovered) {
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const skin = await read(`packages/design/styles/css/${name}.css`)
  if (!connect?.includes('\'data-contained\''))
    continue
  const sent = new Set()
  // 逐个 getXxxProps 块看它有没有发这个属性，块名即部件名
  for (const [, part, body] of connect.matchAll(/get([A-Z][A-Za-z]*)Props\s*:[\s\S]*?(?=\n\s{4}get[A-Z][A-Za-z]*Props\s*:|\n\s{2}\}\s*$)/g).map(m => [m[0], m[1], m[0]])) {
    if (body.includes('\'data-contained\''))
      sent.add(part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
  }
  for (const part of sent) {
    if (part === 'root')
      continue
    const rule = new RegExp(`data-part='${part}'\\]\\[data-contained\\]`)
    if (!rule.test(skin ?? ''))
      problems.push(`${name}：connect 给 ${part} 发了 data-contained，皮肤却没有对应规则——那个部件的坐标系没跟着换`)
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
