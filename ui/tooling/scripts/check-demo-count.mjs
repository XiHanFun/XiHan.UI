#!/usr/bin/env node
// 门禁：每个组件的示例不少于四份。
//
// 一份示例只讲得了一件事。基础用法、一条轴、一个受控口，三份就见底了——
// 剩下的用法（拆开写法、组内嵌别的控件、远程取数、受控开合）在文档站上一个字都没有，
// 而它们恰好是使用者接进项目时第一个撞上的那几件事。
//
// 判据：component-docs.manifest.json 里登记的每个组件，
// docs/.vitepress/demos/<组件>/ 下的 .vue 示例数不少于 FLOOR。
// 只数 .vue：它是示例的规范来源（check-demo-frameworks 的 SPEC），
// 其余框架版由那条门禁按首行对账。
//
// 确实凑不出四份的逐个登记进 demo-count-exempt.json，连同理由。
// 表两侧都反查：登记的组件不在清单里、或它其实已经够数，都判红——名单过期比没有名单更坏。
//
// 用法：
//   node tooling/scripts/check-demo-count.mjs             对账
//   node tooling/scripts/check-demo-count.mjs --update    按当下的缺口生成登记表骨架（理由留空，须手写）
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const MANIFEST = 'scripts/component-docs.manifest.json'
const DEMOS = '../docs/.vitepress/demos'
const TABLE = 'tooling/scripts/demo-count-exempt.json'

/** 每个组件至少几份示例。 */
const FLOOR = 4

/** 清单里登记的组件，按出现次序；line 是它在清单里的行号，报错时指得到位置。 */
async function manifestComponents() {
  const source = await readFile(MANIFEST, 'utf8')
  const lines = source.split('\n')
  const { categories } = JSON.parse(source)
  const out = []
  for (const category of categories) {
    for (const component of category.components ?? []) {
      const needle = `"id": "${component.id}"`
      const at = lines.findIndex(line => line.includes(needle))
      out.push({ id: component.id, name: component.name, line: at === -1 ? 1 : at + 1 })
    }
  }
  return out
}

/** 该组件目录下的 .vue 示例数；目录不存在算 0。 */
async function demoCount(id) {
  try {
    return (await readdir(join(DEMOS, id))).filter(file => file.endsWith('.vue')).length
  }
  catch {
    return 0
  }
}

const components = await manifestComponents()
const counts = new Map()
for (const component of components)
  counts.set(component.id, await demoCount(component.id))

if (process.argv.includes('--update')) {
  let existing = {}
  try {
    existing = JSON.parse(await readFile(TABLE, 'utf8'))
  }
  catch {}
  const next = {}
  for (const component of components) {
    if (counts.get(component.id) >= FLOOR)
      continue
    next[component.id] = existing[component.id] ?? ''
  }
  await writeFile(TABLE, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  const blanks = Object.entries(next).filter(([, reason]) => !reason).length
  console.log(
    `[demo:count] 已写入 ${TABLE}：${Object.keys(next).length} 条豁免，其中 ${blanks} 条理由留空——`
    + '理由要手写，留空的那几条对账时照样判红',
  )
  process.exit(0)
}

let exempt
try {
  exempt = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-demo-count] ✗ 读不到 ${TABLE}——先跑 node tooling/scripts/check-demo-count.mjs --update 落登记表`)
  process.exit(1)
}

/** 登记表里某条豁免所在的行号。 */
const tableLines = (await readFile(TABLE, 'utf8')).split('\n')
function exemptLine(id) {
  const at = tableLines.findIndex(line => line.trimStart().startsWith(`"${id}":`))
  return at === -1 ? 1 : at + 1
}

const problems = []
let short = 0
let total = 0

for (const { id, name, line } of components) {
  const count = counts.get(id)
  total += count
  if (count >= FLOOR) {
    if (id in exempt)
      problems.push(`${TABLE}:${exemptLine(id)} —— ${id} 登记着豁免，却已经有 ${count} 份示例：名单过期了，删掉这条`)
    continue
  }
  short += 1
  if (id in exempt) {
    if (!exempt[id])
      problems.push(`${TABLE}:${exemptLine(id)} —— ${id} 登记了豁免却没写理由：一句话说清为什么这个组件凑不出 ${FLOOR} 份`)
    continue
  }
  problems.push(
    `${MANIFEST}:${line} —— ${name}（${id}）只有 ${count} 份示例，少于 ${FLOOR} 份：`
    + `在 docs/.vitepress/demos/${id}/ 下补，首行写「标题 | 说明」；`
    + `确实凑不出就登记进 ${TABLE}`,
  )
}

for (const id of Object.keys(exempt)) {
  if (!counts.has(id))
    problems.push(`${TABLE}:${exemptLine(id)} —— ${id} 登记着豁免，但它不在 ${MANIFEST} 里：组件改名或退役了就一起改登记表`)
}

if (problems.length) {
  console.error('[check-demo-count] ✗ 有组件的示例不够四份：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n三份示例讲得完基础用法与两条轴，讲不完使用者接进项目时真正要查的那几件事。')
  process.exit(1)
}

console.log(
  `[check-demo-count] 通过：${components.length} 个组件、合计 ${total} 份示例，`
  + `除登记豁免的 ${short} 个之外各不少于 ${FLOOR} 份`,
)
