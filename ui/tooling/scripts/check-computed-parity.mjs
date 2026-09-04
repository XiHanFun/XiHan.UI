#!/usr/bin/env node
// 门禁：两个适配器的计算样式快照逐字一致。
//
// 快照由两侧的 computed-snapshot.spec.ts 在真实浏览器里采出并入库，
// 内容是每个部件解析完令牌代换、继承与层序之后的最终取值。
//
// 这一条查的是别的门禁查不到的那一层：check-control-height / check-shape-scale 只能核
// 「引的是不是同一个令牌」，核不到「令牌代换加继承加层序算完之后是不是同一个像素」。
// 两侧逐字一致，等于把「两端视觉一致」从人眼判断变成机器判断。
//
// 已知差异逐条登记，两侧反查：登记的组件必须确实还不一致，一致了就判登记过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const VUE = 'packages/adapters/vue/tests/browser/__snapshots__/computed'
const WC = 'packages/adapters/web-components/tests/browser/__snapshots__/computed'

/**
 * 已知不一致的组件，值写一句理由。
 * 三个模态各自单开了 WC 规格，fixture 本就不同构；另两条是实测出来的真差异。
 */
const KNOWN_DIVERGENCE = {
  'dialog': 'WC 侧走单开的 wc-dialog.suite，presence 模型与共享套件不同构',
  'drawer': 'WC 侧走单开的 wc-drawer.suite，presence 模型与共享套件不同构',
  'image-viewer': 'WC 侧走单开的 wc-image-viewer.suite，presence 模型与共享套件不同构',
  'menubar': 'positioner 的 color 两侧不同：Vue 侧落回初始黑，WC 侧继承到语义前景色。全库 22 个 positioner 里只有它与 tour 两侧不同',
  'tour': 'backdrop 与 positioner 的 color 两侧不同，同 menubar',
}

async function listSnapshots(dir) {
  try {
    return (await readdir(dir)).filter(f => f.endsWith('.txt')).sort()
  }
  catch {
    return null
  }
}

const vueFiles = await listSnapshots(VUE)
const wcFiles = await listSnapshots(WC)

if (!vueFiles || !wcFiles) {
  console.error('[check-computed-parity] ✗ 读不到计算样式快照目录——先在两个适配器各跑一遍 computed-snapshot.spec.ts')
  process.exit(1)
}

const problems = []
const diverged = new Set()

const vueSet = new Set(vueFiles)
const wcSet = new Set(wcFiles)

for (const file of vueFiles) {
  if (!wcSet.has(file))
    problems.push(`${file} 只有 Vue 侧有——WC 侧的套件清单漏了这个组件`)
}
for (const file of wcFiles) {
  if (!vueSet.has(file))
    problems.push(`${file} 只有 WC 侧有——Vue 侧的套件清单漏了这个组件`)
}

for (const file of vueFiles) {
  if (!wcSet.has(file))
    continue
  const component = file.replace(/\.txt$/, '')
  const [a, b] = await Promise.all([
    readFile(join(VUE, file), 'utf8'),
    readFile(join(WC, file), 'utf8'),
  ])
  if (a === b)
    continue

  diverged.add(component)
  if (component in KNOWN_DIVERGENCE)
    continue

  const al = a.split('\n')
  const bl = b.split('\n')
  const first = al.findIndex((line, i) => line !== bl[i])
  let part = ''
  for (let i = first; i >= 0; i--) {
    if (al[i]?.startsWith('[')) {
      part = al[i]
      break
    }
  }
  problems.push(
    `${component} 两侧计算样式不一致，首处在第 ${first + 1} 行 ${part}：\n`
    + `      vue: ${al[first]}\n`
    + `      wc:  ${bl[first] ?? '(缺这一行)'}\n`
    + `    —— 同一个部件在两个适配器里解析出不同的值；确实该不同就登进 KNOWN_DIVERGENCE 并写清理由`,
  )
}

for (const component of Object.keys(KNOWN_DIVERGENCE)) {
  if (!vueSet.has(`${component}.txt`))
    problems.push(`${component} 登记在 KNOWN_DIVERGENCE 里却没有快照——组件改名或退役了就一起改`)
  else if (!diverged.has(component))
    problems.push(`${component} 登记成两侧不一致，实测已经一致了——把这条删掉`)
}

if (problems.length) {
  console.error('[check-computed-parity] ✗ 两个适配器的计算样式对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-computed-parity] 通过：${vueFiles.length} 个组件的计算样式快照两侧逐字一致`
  + `（登记 ${Object.keys(KNOWN_DIVERGENCE).length} 处已知差异）`,
)
