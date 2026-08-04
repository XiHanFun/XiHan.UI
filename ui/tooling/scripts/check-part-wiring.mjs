#!/usr/bin/env node
// 门禁：connect 产出了 props 的角色节点，两个适配器都得接上。
//
// 解剖里声明、connect 里产出、适配器却不接线的 part，是一条库没兑现的承诺：
// 皮肤为它写了规则却匹配不到任何元素，作者按文档写了节点也拿不到属性，而且不报错。
// button 的 label / prefix / suffix / indicator 就这么悬空过——皮肤里那条转圈动画
// 从来没有作用在任何东西上。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/headless/src'
const VUE = 'packages/vue/src/components'
const WC = 'packages/wc/src/elements'

/** 只在某一端存在的角色节点，逐条写明理由。 */
const EXEMPT = {}

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

const pascal = s => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())

const problems = []
const entries = await readdir(HEADLESS, { withFileTypes: true })

for (const entry of entries) {
  if (!entry.isDirectory())
    continue
  const comp = entry.name
  const anatomy = await read(join(HEADLESS, comp, `${comp}.anatomy.ts`))
  const connect = await read(join(HEADLESS, comp, `${comp}.connect.ts`))
  if (!anatomy || !connect)
    continue

  const parts = [...anatomy.matchAll(/'([a-z][a-z0-9-]*)'/g)].map(m => m[1])
  const vue = await readVue(comp)
  const wc = (await read(join(WC, `${comp}.ts`))) ?? ''

  for (const part of parts) {
    const getter = `get${pascal(part)}Props`
    if (!connect.includes(getter))
      continue
    if (EXEMPT[comp]?.includes(part))
      continue
    const inVue = vue.includes(getter)
    const inWc = wc.includes(`'${part}'`) || wc.includes(getter)
    if (!inVue && !inWc)
      problems.push(`${comp} 的 ${part}：connect 产出了 ${getter}，两端都不接`)
    else if (!inVue)
      problems.push(`${comp} 的 ${part}：只有 WC 接了，Vue 没接`)
    else if (!inWc)
      problems.push(`${comp} 的 ${part}：只有 Vue 接了，WC 没接`)
  }
}

if (problems.length) {
  console.error('[check-part-wiring] ✗ 角色节点悬空：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('要么两端都接上，要么从解剖与 connect 里删掉——留着等于承诺了做不到的事。')
  process.exit(1)
}

console.log('[check-part-wiring] 通过：connect 产出的角色节点两端都接上了')
