#!/usr/bin/env node
// 门禁：三个适配器的计算样式快照两两逐字一致。
//
// 快照由各侧的 computed-snapshot 用例在真实浏览器里采出并入库，
// 内容是每个部件解析完令牌代换、继承与层序之后的最终取值。
//
// 这一条查的是别的门禁查不到的那一层：check-control-height / check-shape-scale 只能核
// 「引的是不是同一个令牌」，核不到「令牌代换加继承加层序算完之后是不是同一个像素」。
//
// 比对按适配器对逐对进行：vue↔react、vue↔wc、react↔wc。
// 已知差异按「组件 + 适配器对」登记——三个模态的差异只在与 wc 配对时成立，
// 登记成组件级会把 vue↔react 这一对一起放过。
// 表两侧反查：登记的对必须确实还不一致，一致了就判登记过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

import { ADAPTERS } from './lib/adapters.mjs'

const SNAPSHOTS = 'tests/browser/__snapshots__/computed'

/** 参与比对的适配器，按这个顺序两两配对。 */
const SIDES = ['vue', 'react', 'wc']

/** 两两配对，键写成 `a-b`。 */
const PAIRS = SIDES.flatMap((a, i) => SIDES.slice(i + 1).map(b => [a, b]))

/**
 * 已知不一致的「组件@适配器对」，值写一句结构性理由。
 *
 * 三个模态与 command 在 wc 侧走单开的 fixture，本就不同构；
 * menubar 与 tour 是实测出来的真差异。这几条对 vue↔react 都不成立——
 * 那一对必须逐字全等，所以表里没有任何 vue-react 的条目。
 */
const KNOWN_DIVERGENCE = {
  'command@vue-wc': 'WC 侧走单开的 fixture（浮层壳归作者手写），且 Light DOM 不删作者节点：收起这一屏 Vue 只剩 trigger，WC 是整棵面板都在',
  'command@react-wc': '同 command@vue-wc：WC 侧 fixture 不同构，收起这一屏 React 只剩 trigger，WC 是整棵面板都在',
  'dialog@vue-wc': 'WC 侧走单开的 wc-dialog.suite，presence 模型与共享套件不同构',
  'dialog@react-wc': '同 dialog@vue-wc：WC 侧不吃共享套件，presence 模型不同构',
  'drawer@vue-wc': 'WC 侧走单开的 wc-drawer.suite，presence 模型与共享套件不同构',
  'drawer@react-wc': '同 drawer@vue-wc：WC 侧不吃共享套件，presence 模型不同构',
  'image-viewer@vue-wc': 'WC 侧走单开的 wc-image-viewer.suite，presence 模型与共享套件不同构',
  'image-viewer@react-wc': '同 image-viewer@vue-wc：WC 侧不吃共享套件，presence 模型不同构',
  'menubar@vue-wc': 'positioner 的 color 两侧不同：Vue 侧落回初始黑，WC 侧继承到语义前景色。全库 22 个 positioner 里只有它与 tour 两侧不同',
  'menubar@react-wc': '同 menubar@vue-wc：React 侧与 Vue 侧取值一致，差的是 WC 侧 positioner 的 color 继承链',
  'tour@vue-wc': 'backdrop 与 positioner 的 color 两侧不同，同 menubar',
  'tour@react-wc': '同 tour@vue-wc：React 侧与 Vue 侧取值一致，差的是 WC 侧的 color 继承链',
}

function dirOf(side) {
  return `${ADAPTERS[side].root}/${SNAPSHOTS}`
}

/** 列出一侧的快照文件名；目录不存在返回 null。 */
async function listSnapshots(side) {
  try {
    return (await readdir(dirOf(side))).filter(f => f.endsWith('.txt')).sort()
  }
  catch {
    return null
  }
}

const files = new Map()
const problems = []

for (const side of SIDES) {
  const list = await listSnapshots(side)
  if (list === null) {
    console.error(`[check-computed-parity] ✗ 读不到 ${dirOf(side)}——先在这个适配器跑一遍 computed-snapshot 用例`)
    process.exit(1)
  }
  // 目录在但一份快照都没有：接着比会「两边都没有」地静默通过
  if (list.length === 0) {
    console.error(`[check-computed-parity] ✗ ${dirOf(side)} 下一份快照都没有——这一侧的用例没跑或套件清单是空的`)
    process.exit(1)
  }
  files.set(side, list)
}

/** 逐字不一致的「组件@适配器对」。 */
const diverged = new Set()
/** 实际比对过内容的对数，一份都没比到时判失败。 */
let compared = 0

/** 差异首行往上找最近的部件标题行，用来指出差在哪一段。 */
function partOf(lines, index) {
  for (let i = index; i >= 0; i--) {
    if (lines[i]?.startsWith('['))
      return lines[i]
  }
  return '(首个部件标题之前)'
}

for (const [a, b] of PAIRS) {
  const pair = `${a}-${b}`
  const aSet = new Set(files.get(a))
  const bSet = new Set(files.get(b))

  for (const file of files.get(a)) {
    if (!bSet.has(file))
      problems.push(`${file} 只有 ${ADAPTERS[a].label} 侧有——${ADAPTERS[b].label} 侧的套件清单漏了这个组件`)
  }
  for (const file of files.get(b)) {
    if (!aSet.has(file))
      problems.push(`${file} 只有 ${ADAPTERS[b].label} 侧有——${ADAPTERS[a].label} 侧的套件清单漏了这个组件`)
  }

  for (const file of files.get(a)) {
    if (!bSet.has(file))
      continue
    const component = file.replace(/\.txt$/, '')
    const key = `${component}@${pair}`
    const [textA, textB] = await Promise.all([
      readFile(join(dirOf(a), file), 'utf8'),
      readFile(join(dirOf(b), file), 'utf8'),
    ])
    compared++
    if (textA === textB)
      continue

    diverged.add(key)
    if (key in KNOWN_DIVERGENCE)
      continue

    const linesA = textA.split('\n')
    const linesB = textB.split('\n')
    const first = linesA.findIndex((line, i) => line !== linesB[i])
    problems.push(
      `${component} 在 ${ADAPTERS[a].label}↔${ADAPTERS[b].label} 两侧计算样式不一致，`
      + `首处在第 ${first + 1} 行 ${partOf(linesA, first)}：\n`
      + `      ${a}: ${linesA[first]}\n`
      + `      ${b}: ${linesB[first] ?? '(缺这一行)'}\n`
      + `    —— 同一个部件在两个适配器里解析出不同的值；确实该不同就以 ${key} 登进 KNOWN_DIVERGENCE 并写清结构性理由`,
    )
  }
}

if (compared === 0)
  problems.push('三侧一份快照都没比到——同名文件对不上，判据落空')

// 例外表反查：键的写法、组件是否还在、以及是不是真的还不一致
for (const [key, why] of Object.entries(KNOWN_DIVERGENCE)) {
  const [component, pair] = key.split('@')
  if (!pair || !PAIRS.some(([a, b]) => `${a}-${b}` === pair)) {
    problems.push(`KNOWN_DIVERGENCE 里的 ${key} 不是「组件@适配器对」的写法，适配器对只有 ${PAIRS.map(([a, b]) => `${a}-${b}`).join(' / ')}`)
    continue
  }
  if (!why?.trim()) {
    problems.push(`KNOWN_DIVERGENCE 里的 ${key} 没写理由`)
    continue
  }
  const [a, b] = pair.split('-')
  const missing = [a, b].filter(side => !files.get(side).includes(`${component}.txt`))
  if (missing.length > 0)
    problems.push(`${key} 登记在 KNOWN_DIVERGENCE 里，${missing.map(s => ADAPTERS[s].label).join(' 与 ')} 侧却没有这份快照——组件改名或退役了就一起改`)
  else if (!diverged.has(key))
    problems.push(`${key} 登记成两侧不一致，实测已经一致了——把这条删掉`)
}

if (problems.length) {
  console.error('[check-computed-parity] ✗ 适配器之间的计算样式对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const counts = SIDES.map(s => `${ADAPTERS[s].label} ${files.get(s).length} 份`).join(' · ')
console.log(
  `[check-computed-parity] 通过：${counts}快照，${PAIRS.length} 对适配器共比对 ${compared} 处，逐字一致`
  + `（登记 ${Object.keys(KNOWN_DIVERGENCE).length} 处已知差异）`,
)
