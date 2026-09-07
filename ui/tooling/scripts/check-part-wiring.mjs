#!/usr/bin/env node
// 门禁：connect 产出了 props 的角色节点，每个适配器都得接上。
//
// 解剖里声明、connect 里产出、适配器却不接线的 part，是一条库没兑现的承诺：
// 皮肤为它写了规则却匹配不到任何元素，作者按文档写了节点也拿不到属性，而且不报错。
// button 的 label / prefix / suffix / indicator 就这么悬空过——皮肤里那条转圈动画
// 从来没有作用在任何东西上。
//
// 三个适配器都核：vue 与 wc 是全量的，react 按批次铺开，只核 react-coverage.json
// 登记为已铺的组件，没铺到的这一侧跳过。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'
const VUE = ADAPTERS.vue.components
const REACT = ADAPTERS.react.components
const WC = ADAPTERS.wc.components

/**
 * 只在某一端存在的角色节点，逐条写明理由。键是组件名，值是 part 名数组。
 * 每条都要真被用来放行过一次，一次都没用上的会被下面的名单核验报出来。
 */
const EXEMPT = {}

/**
 * getter 名与 part 名对不上的，逐条登记。
 *
 * 判据靠「part 名派生 getter 名」找承诺，名字对不上就整段跳过——那个 part 于是
 * 一道检查都不过。side-nav 的定位层就这么漏了：connect 叫 getPopoutPositionerProps，
 * 派生出来的是 getPositionerProps，两边对不上，WC 适配器整个没接它也没人报错。
 *
 * 别名本身也会过期：connect 改回了派生名、或那个 part 没了，别名就再也对不上，
 * 于是又变回「整段跳过」的静默。每条都要真被用上一次，用不上的由下面的名单核验报出来。
 */
const GETTER_ALIAS = {
  'side-nav': { positioner: 'getPopoutPositionerProps' },
}

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** vue 侧组件可能是 <名>.ts，也可能是 <名>/<名>.ts。 */
async function readVue(comp) {
  return (await read(join(VUE, `${comp}.ts`))) ?? (await read(join(VUE, comp, `${comp}.ts`))) ?? ''
}

/**
 * react 侧组件多是一个目录，接线可能分散在目录里的几个 .ts / .tsx 上，全拼起来看；
 * 没有机器的那几个（button 这类）与 Vue 侧一样是单文件平铺，两种形态都要认。
 */
async function readReact(comp) {
  const flat = (await read(join(REACT, `${comp}.tsx`))) ?? (await read(join(REACT, `${comp}.ts`)))
  if (flat != null)
    return flat
  let entries
  try {
    entries = await readdir(join(REACT, comp), { withFileTypes: true })
  }
  catch {
    return ''
  }
  const texts = []
  for (const entry of entries) {
    if (entry.isFile() && /\.tsx?$/.test(entry.name))
      texts.push((await read(join(REACT, comp, entry.name))) ?? '')
  }
  return texts.join('\n')
}

const pascal = s => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())

const problems = []
/** 真的用来放行过的例外，写成「组件 part」。 */
const usedExempt = new Set()
/** 真的用来找到 getter 的别名，写成「组件 part」。 */
const usedAlias = new Set()
/** React 侧已经铺到的组件，没铺到的不核 React 这一侧。 */
const covered = await reactCovered()
/** 有解剖也有 connect 的组件数，给 React 的铺开进度当分母。 */
let componentTotal = 0
const entries = await readdir(HEADLESS, { withFileTypes: true })

for (const entry of entries) {
  if (!entry.isDirectory())
    continue
  const comp = entry.name
  const anatomy = await read(join(HEADLESS, comp, `${comp}.anatomy.ts`))
  const connect = await read(join(HEADLESS, comp, `${comp}.connect.ts`))
  if (!anatomy || !connect)
    continue
  componentTotal++

  const parts = [...anatomy.matchAll(/'([a-z][a-z0-9-]*)'/g)].map(m => m[1])
  const vue = await readVue(comp)
  const wc = (await read(join(WC, `${comp}.ts`))) ?? ''
  const react = covered.has(comp) ? await readReact(comp) : ''

  for (const part of parts) {
    const alias = GETTER_ALIAS[comp]?.[part]
    const getter = alias ?? `get${pascal(part)}Props`
    if (!connect.includes(getter))
      continue
    if (alias)
      usedAlias.add(`${comp} ${part}`)
    if (EXEMPT[comp]?.includes(part)) {
      usedExempt.add(`${comp} ${part}`)
      continue
    }
    // 每一侧看它自己的接法：vue 与 react 直接调 getter，wc 还可以按 part 名取节点。
    // react 只有登记为已铺时才排进来，没铺到的组件这一侧根本不在名单里
    const sides = [
      { label: ADAPTERS.vue.label, wired: vue.includes(getter) },
      { label: ADAPTERS.wc.label, wired: wc.includes(`'${part}'`) || wc.includes(getter) },
    ]
    if (covered.has(comp))
      sides.push({ label: ADAPTERS.react.label, wired: react.includes(getter) })
    const missing = sides.filter(side => !side.wired)
    if (missing.length === 0)
      continue
    const names = list => list.map(side => side.label).join('、')
    if (missing.length === sides.length)
      problems.push(`${comp} 的 ${part}：connect 产出了 ${getter}，${names(sides)} 都不接`)
    else
      problems.push(`${comp} 的 ${part}：${names(missing)} 没接（${names(sides.filter(side => side.wired))} 接了）`)
  }
}

for (const [comp, parts] of Object.entries(EXEMPT)) {
  for (const part of parts) {
    if (!usedExempt.has(`${comp} ${part}`))
      problems.push(`${comp} 的 ${part} 登记在 EXEMPT 里却没被扫到——名单过期了`)
  }
}

for (const [comp, aliases] of Object.entries(GETTER_ALIAS)) {
  for (const part of Object.keys(aliases)) {
    if (!usedAlias.has(`${comp} ${part}`))
      problems.push(`${comp} 的 ${part} 登记在 GETTER_ALIAS 里却没被扫到——名单过期了，那个 part 会整段跳过一道检查都不过`)
  }
}

if (problems.length) {
  console.error('[check-part-wiring] ✗ 角色节点悬空：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('要么各侧都接上，要么从解剖与 connect 里删掉——留着等于承诺了做不到的事。')
  process.exit(1)
}

console.log(`[check-part-wiring] 通过：${componentTotal} 个组件的角色节点，${ADAPTERS.vue.label} 与 ${ADAPTERS.wc.label} 全量接上，${reactProgress(covered, componentTotal)}、这些也都接上了（getter 别名 ${usedAlias.size} 条、例外 ${usedExempt.size} 条）`)
