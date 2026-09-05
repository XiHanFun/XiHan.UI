#!/usr/bin/env node
// 门禁：部件名在册，且尾词走规范词。
//
// data-part 的取值是皮肤写跨组件规则的抓手：同一件事叫同一个名字，一条规则才能盖住多个
// 组件；一名两义或一义两名，皮肤就只能每个组件各长各的。
//
// 名字拆两段看：尾词说「这是个什么东西」（-trigger / -label / -item），前缀说「哪一个」
// （clear- / prev- / week-）。所以判据也分两层：
//   ① 名字本身在册（parts 段），新名字要么复用既有的，要么跑 pnpm vocab:update 登记
//   ② 尾词必须是 tails 段里的规范词；判成同义词的尾词（synonymOf）一律判红，
//      收敛前的存量逐个列在 pendingUsers 里放行，收敛完删掉即恢复判红
//
// parts 段由脚本从 127 份 *.anatomy.ts 现算生成，不手写——规范 §17.3 那张词频表已经
// 全面过期，拿一张对不上代码的表当基线，第一次跑就会把合法名字判红。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const HEADLESS = 'packages/engine/headless/src'
const TABLE = 'tooling/scripts/part-vocabulary.json'

/** 不是组件的目录。 */
const NOT_COMPONENT = new Set(['config', 'shared', 'spec'])

const dirs = (await readdir(HEADLESS, { withFileTypes: true }))
  .filter(d => d.isDirectory() && !NOT_COMPONENT.has(d.name))
  .map(d => d.name)
  .sort()

/** 部件名 → 用它的组件。 */
const usedBy = new Map()
for (const comp of dirs) {
  let src
  try {
    src = await readFile(join(HEADLESS, comp, `${comp}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }
  // createAnatomy('select', ['root', 'label', …])：第一个参数是 scope 名，不算部件
  const block = src.match(/createAnatomy\([^,]+,\s*\[([\s\S]*?)\]/)
  if (!block)
    continue
  for (const m of block[1].matchAll(/'([a-z0-9-]+)'/g)) {
    if (!usedBy.has(m[1]))
      usedBy.set(m[1], new Set())
    usedBy.get(m[1]).add(comp)
  }
}

const tailOf = name => name.split('-').pop()

if (process.argv.includes('--update')) {
  let previous = {}
  try {
    previous = JSON.parse(await readFile(TABLE, 'utf8'))
  }
  catch {
    // 首次生成
  }

  const parts = {}
  for (const name of [...usedBy.keys()].sort())
    parts[name] = [...usedBy.get(name)].sort()

  // 尾词：保留上一版的裁决（synonymOf / pendingUsers），新出现的尾词默认收进规范词。
  // 判成同义词的尾词即使已经没人用也留着：收敛完就把它删掉，下一个人写出来时又是无声放行。
  const tailNames = new Set([...usedBy.keys()].map(tailOf))
  for (const [tail, rule] of Object.entries(previous.tails ?? {})) {
    if (rule !== true && rule?.synonymOf)
      tailNames.add(tail)
  }
  const tails = {}
  for (const tail of [...tailNames].sort())
    tails[tail] = previous.tails?.[tail] ?? true

  const table = {
    $description: '部件名（data-part 取值）的真源。parts 段由 check-part-vocabulary.mjs --update 从 127 份 *.anatomy.ts 现算生成。tails 段记尾词裁决：值为 true 是规范词，值为对象且带 synonymOf 的判红，pendingUsers 是收敛前放行的存量。',
    parts,
    tails,
    retired: previous.retired ?? {},
  }
  await writeFile(TABLE, `${JSON.stringify(table, null, 2)}\n`, 'utf8')
  const shared = Object.values(parts).filter(cs => cs.length >= 2).length
  console.log(
    `[vocab:update] 已写入 ${TABLE}：${Object.keys(parts).length} 个部件名`
    + `（共享 ${shared} · 独用 ${Object.keys(parts).length - shared}）· 尾词 ${Object.keys(tails).length} 种`,
  )
  process.exit(0)
}

let table
try {
  table = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-part-vocabulary] ✗ 读不到 ${TABLE}——先跑 pnpm vocab:update 落基线`)
  process.exit(1)
}

const { parts = {}, tails = {}, retired = {} } = table
const problems = []

// ① 名字在册 + 用它的组件对得上
for (const [name, comps] of usedBy) {
  const listed = parts[name]
  if (!listed) {
    problems.push(
      `${name}（${[...comps].sort().join(' / ')}）未登记——先与既有词汇比对，`
      + `同义就用既有那个；确实是新概念再跑 pnpm vocab:update`,
    )
    continue
  }
  const actual = [...comps].sort().join(',')
  const expect = [...listed].sort().join(',')
  if (actual !== expect)
    problems.push(`${name} 的使用面变了：实际 ${actual}，登记 ${expect}——跑 pnpm vocab:update`)
}

// 过期反查
for (const name of Object.keys(parts)) {
  if (!usedBy.has(name))
    problems.push(`${name} 登记在册却没有任何解剖在用——名单过期了，跑 pnpm vocab:update`)
}

// ② 尾词走规范词
for (const [name, comps] of usedBy) {
  const tail = tailOf(name)
  const rule = tails[tail]
  if (rule === undefined) {
    problems.push(`${name} 的尾词 -${tail} 未登记——跑 pnpm vocab:update`)
    continue
  }
  if (rule === true)
    continue
  if (!rule.synonymOf)
    continue
  const pending = new Set(rule.pendingUsers ?? [])
  if (pending.has(name))
    continue
  problems.push(
    `${name}（${[...comps].sort().join(' / ')}）的尾词 -${tail} 是 -${rule.synonymOf} 的同义词——`
    + `改名走 -${rule.synonymOf}${rule.$description ? `（${rule.$description}）` : ''}`,
  )
}

// pendingUsers 过期反查
for (const [tail, rule] of Object.entries(tails)) {
  if (rule === true || !rule.pendingUsers)
    continue
  for (const name of rule.pendingUsers) {
    if (!usedBy.has(name))
      problems.push(`-${tail} 的 pendingUsers 里 ${name} 已经不在了——收敛完就把这条删掉`)
  }
}

// ③ 退役名不许再出现
for (const [name, why] of Object.entries(retired)) {
  if (usedBy.has(name))
    problems.push(`${name} 已退役（${why}），解剖里却还在用`)
}

if (problems.length) {
  console.error('[check-part-vocabulary] ✗ 部件名与词汇表对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const shared = Object.values(parts).filter(cs => cs.length >= 2).length
const pending = Object.values(tails).filter(r => r !== true && r.synonymOf).length
console.log(
  `[check-part-vocabulary] 通过：${dirs.length} 份解剖 · ${usedBy.size} 个部件名`
  + `（共享 ${shared} · 独用 ${usedBy.size - shared}）· 尾词 ${Object.keys(tails).length} 种`
  + `（判为同义待收敛 ${pending} 种）`,
)
