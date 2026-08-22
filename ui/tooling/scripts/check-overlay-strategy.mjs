#!/usr/bin/env node
// 门禁：浮层族的坐标系三处必须同步——机器传给引擎的 strategy、connect 产出的内联 position、
// 皮肤里 positioner 规则的 position。任意一处走岔，引擎按一套坐标算、CSS 按另一套渲染，
// 整族浮层会偏掉一个 scrollY，而且没有任何现成判据会红。
import { readdir, readFile } from 'node:fs/promises'

const HEADLESS = 'packages/engine/headless/src'

/**
 * 定位不吃引擎坐标的 positioner，连同理由。
 * 名单之外的 positioner 一律受本门禁管辖——族成员从解剖里扫出来，手写清单会漏。
 */
const NOT_ENGINE_POSITIONED = {
  'dialog': '居中由皮肤的 inset + flex 排布，不问引擎要坐标',
  'drawer': '贴边由皮肤的 inset 排布，不问引擎要坐标',
  'floating-panel': '位置由用户拖出来、存在机器里，不问引擎要坐标',
  'image-viewer': '全屏居中由皮肤的 inset + flex 排布，不问引擎要坐标',
}

/** 没有自己机器、跑别人机器的：坐标系由被复用的那台机器决定，查那一台。 */
const COMPOSED = {
  popconfirm: 'popover',
  popselect: 'popover',
}

/** 皮肤里没有独立 positioner 规则的：定位由内联样式全权负责。 */
const NO_SKIN_RULE = new Set(['tour'])

/**
 * 没有 positioner 部件、面板由皮肤 position: absolute 排布的浮层，连同理由。
 * 按解剖发现不到它们，所以逐项核实登记理由仍成立：解剖没有 positioner、connect 不碰定位引擎、
 * 皮肤 content 是 absolute 且层级走 --xh-layer-popover（直接引用或经 --xh-<名>-layer 槽兜底）。
 */
const SKIN_POSITIONED = {
  'navigation-menu': '面板贴着自己那一项落在列表下方，由皮肤 position: absolute 排布，不需要 flip / shift',
}

/** 取出 [data-scope='<名>'][data-part='content'] 那条规则的声明块。 */
function contentRule(css, name) {
  const m = css.match(new RegExp(`\\[data-scope='${name}'\\]\\[data-part='content'\\]\\s*\\{([^}]*)\\}`))
  return m ? m[1] : null
}

/** 登记为皮肤排布的浮层，三处事实都对得上才算成立。 */
async function verifySkinPositioned(name) {
  const anatomy = await read(`${HEADLESS}/${name}/${name}.anatomy.ts`)
  const connect = await read(`${HEADLESS}/${name}/${name}.connect.ts`)
  const css = await read(`packages/design/styles/css/${name}.css`)
  const errs = []
  if (anatomy == null)
    errs.push('找不到解剖')
  else if (anatomy.includes('\'positioner\''))
    errs.push('解剖里已有 positioner 部件，它会被当作引擎浮层发现，不该再留在 SKIN_POSITIONED')
  if (connect == null)
    errs.push('找不到 connect')
  else if (/overlayPositioned|computePosition/.test(connect))
    errs.push('connect 已接定位引擎（overlayPositioned / computePosition），登记理由不再成立')
  if (css == null) {
    errs.push('找不到皮肤')
  }
  else {
    const rule = contentRule(css, name)
    const layer = new RegExp(`z-index:\\s*var\\((?:--xh-${name}-layer,\\s*var\\(--xh-layer-popover\\)|--xh-layer-popover)\\)`)
    if (rule == null)
      errs.push('皮肤里找不到 content 规则')
    else if (!/position:\s*absolute/.test(rule))
      errs.push('皮肤的 content 不是 position: absolute')
    else if (!layer.test(rule))
      errs.push(`皮肤的 content 层级没走 --xh-layer-popover（允许 var(--xh-${name}-layer, var(--xh-layer-popover)) 或 var(--xh-layer-popover)）`)
  }
  return errs
}

/** 有 positioner 部件的组件即浮层族。 */
async function discoverFamilies() {
  const dirs = await readdir(HEADLESS, { withFileTypes: true })
  const found = []
  for (const d of dirs) {
    if (!d.isDirectory())
      continue
    const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
    if (anatomy?.includes('\'positioner\''))
      found.push(d.name)
  }
  return found.sort()
}

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

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
  const css = await read(`packages/design/styles/css/${name}.css`)

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
