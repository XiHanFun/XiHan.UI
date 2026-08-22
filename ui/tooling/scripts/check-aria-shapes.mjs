#!/usr/bin/env node
// 门禁：连接层里 ARIA 属性的写法只许一种形状。
//
// ① aria-hidden 写布尔 true，不写字符串 'true'：两种写法落到 DOM 都是 "true"，
//    但属性级断言与快照会分成两套，连接层之间也会各写各的。
// ② getTriggerProps 发了 aria-haspopup='listbox' 的触发器必须同时写 role='combobox'
//    （APG 的 select-only combobox 形态），除非登记在 ALLOWED 里：
//    那些是按钮式弹出，触发器不承载当前值、保持原生 button 角色。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'

/** 按钮式弹出列表框：触发器保持 button 角色，不扮演 combobox。 */
const ALLOWED = new Set(['popselect'])

const problems = []
let connects = 0
let ariaHidden = 0
let listboxTriggers = 0

/** 抠出 getXxxProps 的函数体（到下一个 getXxxProps 或对象末尾）。 */
function getter(src, name) {
  const i = src.indexOf(`${name}:`)
  if (i < 0)
    return null
  const rest = src.slice(i + name.length + 1)
  const next = rest.search(/\n\s{4}get[A-Z][A-Za-z]*Props\s*[:(]/)
  return next < 0 ? rest : rest.slice(0, next)
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

for (const dir of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!dir.isDirectory())
    continue
  const name = dir.name
  const file = join(HEADLESS, name, `${name}.connect.ts`)
  let raw
  try {
    raw = await readFile(file, 'utf8')
  }
  catch {
    continue
  }
  connects += 1
  const src = stripComments(raw)

  // ① aria-hidden 的形状
  for (const m of src.matchAll(/['"]aria-hidden['"]\s*:\s*([^,\n]+)/g)) {
    ariaHidden += 1
    if (/['"]true['"]/.test(m[1]))
      problems.push(`${name}.connect.ts：aria-hidden 写了字符串 'true'，该写布尔 true → ${m[1].trim()}`)
  }

  // ② 触发器的 combobox 角色
  const trigger = getter(src, 'getTriggerProps')
  if (trigger && /['"]aria-haspopup['"]\s*:\s*['"]listbox['"]/.test(trigger)) {
    listboxTriggers += 1
    const combobox = /['"]role['"]\s*:\s*['"]combobox['"]/.test(trigger)
    if (!combobox && !ALLOWED.has(name))
      problems.push(`${name}.connect.ts：getTriggerProps 发了 aria-haspopup='listbox' 却没有 role='combobox'；按钮式弹出要登记进 ALLOWED`)
    if (combobox && ALLOWED.has(name))
      problems.push(`${name}.connect.ts：已写 role='combobox'，从 ALLOWED 里去掉`)
  }
}

for (const name of ALLOWED) {
  try {
    await readFile(join(HEADLESS, name, `${name}.connect.ts`), 'utf8')
  }
  catch {
    problems.push(`ALLOWED 里的 ${name} 没有 connect 文件——组件改名了就把名单一起改`)
  }
}

if (problems.length) {
  console.error('[check-aria-shapes] ✗ 连接层 ARIA 写法不齐：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-aria-shapes] 通过：${connects} 份 connect，${ariaHidden} 处 aria-hidden 都写布尔，${listboxTriggers} 个 listbox 触发器角色齐全`)
