#!/usr/bin/env node
// 门禁：组件的标准结构与 anatomy 同源，三端都照这一份渲。
//
// 每份 headless/<组件>/<组件>.structure.ts 登记两张表：<名>_STRUCTURE_PARTS（结构会产出的部件）
// 与 <名>_STRUCTURE_OMITS（anatomy 里不进标准结构的部件）。类型已经管住两张表只收 anatomy 里的名字、
// 结构函数只产出 PARTS 里的部件；这里核类型核不到的：
//   ① PARTS、OMITS 与 root（由组件或元素自己给出）正好分完 anatomy，不重不漏——
//      anatomy 加了部件、结构既不产出也不登记时判红；
//   ② meta 的必备部件（root 以外）都在 PARTS 里；
//   ③ 有结构文件的组件：Web Components 元素声明了 structure，Vue / React 的缺省树调结构函数渲、
//      不再手写 renderDefaultTree，一致性套件有 defaultStructure 场景；
//   ④ 反过来，声明了 structure 的元素都有结构文件；
//   ⑤ 结构节点的 attrs 只放身份属性：结构文件里不出现 role、aria-*、data-state、tabindex，这些归 connect；
//   ⑥ 可接管部件登记在结构文件的 <名>_STRUCTURE_TAKEOVER（部件 → trailing / portal）里，部件都在 PARTS 里，
//      Web Components 元素的 takeover 直接引用这张表，不另写一份。trailing 的确实排在 root 末尾，
//      由钩子在生成时核对（wc.structure-takeover-order），一致性套件的 defaultStructure 场景断言它不出现；
//   ⑦ 组合节点：结构文件里出现的组件（instance: '<名>' 或 structureInstance(key, '<名>'）都要登记在 Web Components 元素的
//      static dependencies（'xh-<名>'）与 Vue / React 的 <名>_INSTANCES 组件表里；反过来，登记了却从不生成的也报。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const HEADLESS = 'packages/engine/headless/src'
const WC = 'packages/adapters/web-components/src/elements'
const VUE = 'packages/adapters/vue/src/components'
const REACT = 'packages/adapters/react/src/components'
const SUITES = 'tooling/testing/src/suites'

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return undefined
  }
}

/** 数组字面量里的字符串：['a', 'b'] → ['a', 'b']。 */
function names(block) {
  return [...block.matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1])
}

const camel = name => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

const errors = []
const covered = []

const components = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()
for (const comp of components) {
  const structure = await read(join(HEADLESS, comp, `${comp}.structure.ts`))
  if (structure === undefined)
    continue
  covered.push(comp)
  const parts = structure.match(/export const [A-Z0-9_]+_STRUCTURE_PARTS = \[([\s\S]*?)\]/)
  const omits = structure.match(/export const [A-Z0-9_]+_STRUCTURE_OMITS = \[([\s\S]*?)\]/)
  if (!parts || !omits) {
    errors.push(`${comp}.structure.ts 没有登记 _STRUCTURE_PARTS 与 _STRUCTURE_OMITS 两张表`)
    continue
  }
  const produced = names(parts[1])
  const omitted = names(omits[1])
  const anatomySrc = await read(join(HEADLESS, comp, `${comp}.anatomy.ts`))
  const anatomyBlock = anatomySrc?.match(/createAnatomy\([^,]+,\s*\[([\s\S]*?)\]/)
  if (!anatomyBlock) {
    errors.push(`${comp} 找不到 anatomy`)
    continue
  }
  const anatomy = names(anatomyBlock[1])
  const listed = ['root', ...produced, ...omitted]
  for (const part of anatomy) {
    const count = listed.filter(name => name === part).length
    if (count === 0)
      errors.push(`${comp}：anatomy 的部件 ${part} 既不在 _STRUCTURE_PARTS 也不在 _STRUCTURE_OMITS（结构没跟上 anatomy）`)
    else if (count > 1)
      errors.push(`${comp}：部件 ${part} 在 root、_STRUCTURE_PARTS、_STRUCTURE_OMITS 里登记了不止一处`)
  }
  for (const part of listed) {
    if (!anatomy.includes(part))
      errors.push(`${comp}：登记的部件 ${part} 不在 anatomy 里`)
  }
  const meta = await read(join(HEADLESS, comp, `${comp}.meta.ts`))
  const required = names(meta?.match(/requiredParts:\s*\[([^\]]*)\]/)?.[1] ?? '')
  for (const part of required) {
    if (part !== 'root' && !produced.includes(part))
      errors.push(`${comp}：必备部件 ${part} 不在 _STRUCTURE_PARTS 里，缺省结构会缺它`)
  }

  const code = structure.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  const owned = code.match(/['"]?(?:role|tabindex|data-state|aria-[a-z-]+)['"]?\s*:/g)
  if (owned)
    errors.push(`${comp}.structure.ts 的结构节点写了 connect 产出的属性（${[...new Set(owned.map(key => key.replace(/[\s:'"]/g, '')))].join('、')}），attrs 只放身份属性`)

  const takeover = structure.match(/export const ([A-Z0-9_]+_STRUCTURE_TAKEOVER) = \{([\s\S]*?)\}/)
  if (takeover) {
    for (const [, part, position] of takeover[2].matchAll(/'?([a-z0-9-]+)'?\s*:\s*'([a-z]+)'/g)) {
      if (!produced.includes(part))
        errors.push(`${comp}：可接管部件 ${part} 不在 _STRUCTURE_PARTS 里`)
      if (position !== 'trailing' && position !== 'portal')
        errors.push(`${comp}：可接管部件 ${part} 的位置 ${position} 只能是 trailing 或 portal`)
    }
  }

  const fn = `${camel(comp)}Structure(`
  const wc = await read(join(WC, `${comp}.ts`))
  if (!wc?.includes('static override structure'))
    errors.push(`${comp}：Web Components 元素没有声明 static structure`)
  const wcTakeover = wc?.match(/takeover:\s*([^,\n]+)/)?.[1]?.trim()
  if (wcTakeover !== undefined && wcTakeover !== takeover?.[1])
    errors.push(`${comp}：Web Components 元素的 takeover 要直接引用结构文件的 ${takeover?.[1] ?? '<名>_STRUCTURE_TAKEOVER'}`)
  const vue = await read(join(VUE, comp, `${comp}.ts`))
  const react = await read(join(REACT, comp, `${comp}.tsx`))
  const used = new Set([
    ...[...code.matchAll(/instance:\s*'([a-z0-9-]+)'/g)].map(m => m[1]),
    ...[...code.matchAll(/structureInstance\([^,]+,\s*'([a-z0-9-]+)'/g)].map(m => m[1]),
  ])
  const keysOf = block => new Set([...(block ?? '').matchAll(/'?([a-z0-9-]+)'?\s*:/g)].map(m => m[1]))
  const dependencies = new Set([...keysOf(wc?.match(/static override dependencies = \{([\s\S]*?)\}/)?.[1])].filter(tag => tag.startsWith('xh-')).map(tag => tag.slice(3)))
  for (const [side, src] of [['Vue', vue], ['React', react]]) {
    const table = keysOf(src?.match(/const [A-Z0-9_]+_INSTANCES\b[^=]*=\s*\{([\s\S]*?)\}/)?.[1])
    for (const name of used) {
      if (!table.has(name))
        errors.push(`${comp}：结构里组合了 ${name}，${side} 的 _INSTANCES 组件表里没有它`)
    }
    for (const name of table) {
      if (!used.has(name))
        errors.push(`${comp}：${side} 的 _INSTANCES 组件表登记了 ${name}，结构里却从不生成`)
    }
  }
  for (const name of used) {
    if (!dependencies.has(name))
      errors.push(`${comp}：结构里组合了 ${name}，Web Components 元素的 static dependencies 没有登记 xh-${name}`)
  }
  for (const name of dependencies) {
    if (!used.has(name))
      errors.push(`${comp}：Web Components 元素的 static dependencies 登记了 xh-${name}，结构里却从不生成`)
  }
  if (!vue?.includes(fn))
    errors.push(`${comp}：Vue 的缺省树没有调 ${fn.slice(0, -1)}`)
  if (vue?.includes('function renderDefaultTree'))
    errors.push(`${comp}：Vue 仍手写 renderDefaultTree`)
  if (!react?.includes(fn))
    errors.push(`${comp}：React 的缺省树没有调 ${fn.slice(0, -1)}`)
  if (react?.includes('function renderDefaultTree'))
    errors.push(`${comp}：React 仍手写 renderDefaultTree`)
  const suite = await read(join(SUITES, `${comp}.suite.ts`))
  if (!suite?.includes('defaultStructure: true'))
    errors.push(`${comp}：一致性套件没有 defaultStructure 场景`)
}

for (const file of (await readdir(WC)).filter(name => name.endsWith('.ts')).sort()) {
  const src = await readFile(join(WC, file), 'utf8')
  const comp = file.slice(0, -3)
  if (src.includes('static override structure') && !covered.includes(comp))
    errors.push(`${comp}：Web Components 元素声明了 structure，headless 却没有 ${comp}.structure.ts`)
}

if (errors.length > 0) {
  console.error('[check-structure-anatomy] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}
console.log(`[check-structure-anatomy] 通过：${covered.length} 个组件的标准结构与 anatomy 分得不重不漏，三端都照结构函数渲（${covered.join('、')}）`)
