#!/usr/bin/env node
// 门禁：带 name 的组件（= 参与表单提交）必须认表单重置。
// 分母从源码扫出来而不是手写名单：新加一个表单组件，它自动进等式，忘了接线就红。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'

/** 带 name 却不认重置的，必须写明理由。 */
const EXEMPT = {}

/**
 * 三个适配器各自把宿主表单的 reset 翻成机器事件的接入点。各组件机器里逐条的重置声明
 * 全靠这几座桥兑现，桥一拆，那一侧所有组件的重置同时变成空转而每一条声明看着都还在。
 */
const BRIDGES = [
  ['vue', `${ADAPTERS.vue.root}/src/runtime/use-machine.ts`, 'attachFormReset('],
  ['vue', `${ADAPTERS.vue.root}/src/runtime/attach-form-reset.ts`, 'createFormResetBridge('],
  ['wc', `${ADAPTERS.wc.root}/src/runtime/machine-controller.ts`, 'createFormResetBridge('],
  ['react', `${ADAPTERS.react.root}/src/runtime/attach-form-reset.ts`, 'createFormResetBridge('],
]

/** 每个适配器各有几处接入点，收尾行照这个数报。 */
function bridgeCount(key) {
  return BRIDGES.filter(([k]) => k === key).length
}

/**
 * React 的桥是个 hook，由每个组件自己调，不像 Vue / WC 那样在运行时统一挂一次。
 * 所以桥在不等于组件接上了：还要逐个组件核这句调用，漏一个只漏它自己，且不报任何错。
 */
const REACT_HOOK = 'useFormReset('

const dirs = (await readdir(HEADLESS, { withFileTypes: true }))
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort()

if (dirs.length === 0) {
  console.error(`[check-form-reset] ✗ ${HEADLESS} 下一个组件都没有，路径变了`)
  process.exit(1)
}

async function read(p) {
  try {
    return await readFile(p, 'utf8')
  }
  catch {
    return null
  }
}

/** 去掉 import 语句：import 进来的名字不算调用，留着它这条判据只要写了 import 就放行。 */
function stripImports(src) {
  return src.replace(/^\s*import\s[\s\S]*?from\s+'[^']*'\s*$/gm, '')
}

/** 读某个 React 组件目录下的全部源码（已去掉 import），拼成一段文本。目录不在时返回 null。 */
async function readReactComponent(name) {
  const dir = join(ADAPTERS.react.components, name)
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return null
  }
  const parts = []
  for (const entry of entries) {
    if (entry.isFile() && /\.tsx?$/.test(entry.name))
      parts.push(stripImports(await read(join(dir, entry.name)) ?? ''))
  }
  return parts.join('\n')
}

/**
 * 取根级 on 块的正文。根级 = 缩进两格、且排在 states 之前；
 * 状态级 on 只在那个状态下生效，而重置从任何状态发出都要认。
 */
function rootOnBlock(machine) {
  const lines = machine.split('\n')
  const start = lines.findIndex(l => l === '  on: {')
  const states = lines.findIndex(l => l === '  states: {')
  if (start === -1 || (states !== -1 && start > states))
    return null
  const end = lines.findIndex((l, i) => i > start && l === '  },')
  return end === -1 ? null : lines.slice(start, end).join('\n')
}

const fields = []
const missing = []
const staleExempt = []
/** 机器在根级 on 里声明了 FORM.RESET 的组件。 */
const declaresReset = []
/** 有 types 文件的目录才算一个组件，config / shared / spec 这类不算。 */
let components = 0

for (const name of dirs) {
  const types = await read(join(HEADLESS, name, `${name}.types.ts`))
  const machine = await read(join(HEADLESS, name, `${name}.machine.ts`))
  if (types == null)
    continue
  components += 1

  const declared = !!machine && (rootOnBlock(machine)?.includes('\'FORM.RESET\'') ?? false)
  if (declared)
    declaresReset.push(name)

  // props 段里出现 name?: string 即视为表单字段
  const isField = /^\s{4}name\?: string/m.test(types)
  if (!isField)
    continue
  fields.push(name)

  if (!declared && !(name in EXEMPT))
    missing.push(name)
}

for (const name of Object.keys(EXEMPT)) {
  if (!fields.includes(name))
    staleExempt.push(name)
}

if (missing.length) {
  console.error('[check-form-reset] ✗ 下列组件带 name 参与表单提交，却不认表单重置：')
  for (const m of missing)
    console.error(`  ${m} —— 在 ${m}.machine.ts 的根级 on 里声明 'FORM.RESET'，或登记进本脚本的 EXEMPT 并写明理由`)
  console.error('放进 form 里点重置，这些组件会一动不动，而同表单的原生控件已经还原。')
  process.exit(1)
}

if (staleExempt.length) {
  console.error('[check-form-reset] ✗ EXEMPT 里有已经不是表单字段的组件，删掉它：')
  for (const s of staleExempt)
    console.error(`  ${s}`)
  process.exit(1)
}

// 总闸：桥断了，上面逐组件的声明会一起变成空转，而每一条看着都还在
const brokenBridges = []
for (const [key, path, needle] of BRIDGES) {
  const text = await read(path)
  if (text == null || !text.includes(needle))
    brokenBridges.push(`${ADAPTERS[key].label}：${path} 里找不到 ${needle}`)
}
if (brokenBridges.length) {
  console.error('[check-form-reset] ✗ 适配器把宿主表单的 reset 送进机器的那座桥断了：')
  for (const b of brokenBridges)
    console.error(`  ${b}`)
  console.error(`机器那侧的声明还在，但事件永远送不进去——${fields.length} 个组件的重置会一起静默失效。`)
  process.exit(1)
}

// React 逐组件核这句 hook 调用：只核已铺到的组件，没铺到的跳过
const covered = await reactCovered()
const reactProblems = []
let reactWired = 0
for (const name of declaresReset) {
  if (!covered.has(name))
    continue
  const src = await readReactComponent(name)
  if (src == null) {
    reactProblems.push(`${name} —— React 登记成已铺，却没有 ${join(ADAPTERS.react.components, name)} 这个目录`)
    continue
  }
  if (src.includes(REACT_HOOK))
    reactWired += 1
  else
    reactProblems.push(`${name} —— React 的组件源码没有调 ${REACT_HOOK})：机器认重置，宿主表单的 reset 却送不进去`)
}

if (reactProblems.length) {
  console.error('[check-form-reset] ✗ React 侧逐组件挂的那座桥有组件没挂上：')
  for (const p of reactProblems)
    console.error(`  ${p}`)
  console.error(`React 不像 Vue / WC 在运行时统一挂，${REACT_HOOK}) 要写在组件里；漏一个只漏它自己，页面上不报任何错。`)
  process.exit(1)
}

console.log(
  `[check-form-reset] 通过：${components} 个组件里 ${fields.length} 个带 name 参与提交、都认表单重置；`
  + `桥都在（${ADAPTERS.vue.label} ${bridgeCount('vue')} 处 / ${ADAPTERS.wc.label} ${bridgeCount('wc')} 处 / ${ADAPTERS.react.label} ${bridgeCount('react')} 处）；`
  + `${reactProgress(covered, components)}，其中 ${reactWired} 个认重置的组件都调了 ${REACT_HOOK})（未铺到的跳过）`,
)
