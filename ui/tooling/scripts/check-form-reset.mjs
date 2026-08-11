#!/usr/bin/env node
// 门禁：带 name 的组件（= 参与表单提交）必须认表单重置。
// 分母从源码扫出来而不是手写名单：新加一个表单组件，它自动进等式，忘了接线就红。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'

/** 带 name 却不认重置的，必须写明理由。 */
const EXEMPT = {}

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

for (const name of dirs) {
  const types = await read(join(HEADLESS, name, `${name}.types.ts`))
  const machine = await read(join(HEADLESS, name, `${name}.machine.ts`))
  if (types == null)
    continue

  // props 段里出现 name?: string 即视为表单字段
  const isField = /^\s{4}name\?: string/m.test(types)
  if (!isField)
    continue
  fields.push(name)

  const declared = !!machine && (rootOnBlock(machine)?.includes('\'FORM.RESET\'') ?? false)

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

console.log(`[check-form-reset] 通过：${fields.length} 个表单字段组件都认表单重置`)
