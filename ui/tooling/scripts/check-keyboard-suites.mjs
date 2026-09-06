#!/usr/bin/env node
// 门禁：写了键盘表的组件，必须有一致性套件，且三个适配器都把它跑起来。
//
// 键盘表是对外承诺的交互契约；套件是兑现它的证据。表写了、套件没写，承诺就没人验；
// 套件写了、某个适配器没登记，那一侧的回归就静默不报。三样东西逐组件对账：
// <c>.keyboard.ts 非空 ⇒ tooling/testing/src/suites/<c>.suite.ts 存在，
// 且 Vue / React / WC 的 conformance 清单里都引用了 <c>Suite（WC 侧允许改写成 wc<C>Suite）。
// React 正在按批次铺开，只核 react-coverage.json 里已铺到的组件。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const HEADLESS = 'packages/engine/headless/src'
const SUITES = 'tooling/testing/src/suites'

/** 逐个适配器：它的 conformance 清单在哪几个文件里，以及是否只核已铺到的组件。 */
const SIDES = [
  { key: 'vue', specs: [`${ADAPTERS.vue.root}/tests/conformance.spec.ts`], coveredOnly: false },
  { key: 'react', specs: [`${ADAPTERS.react.root}/tests/conformance.spec.tsx`], coveredOnly: true },
  {
    key: 'wc',
    specs: [
      `${ADAPTERS.wc.root}/tests/suites.ts`,
      `${ADAPTERS.wc.root}/tests/dialog-conformance.spec.ts`,
    ],
    coveredOnly: false,
  },
]

/**
 * 某一侧刻意不跑的组件，逐条写明理由。
 * 每条都要真被用来放行过一次——组件没了、或那一侧其实已经登记了套件，
 * 这条豁免就成了一张过期的免检通行证，由下面的名单核验报出来。
 */
const EXEMPT = {
  vue: {},
  react: {},
  wc: {},
}

/**
 * 键盘表里不由一致性套件认领的行，逐行写明由谁认领。
 *
 * 「有套件」只说明这份表有人管，管没管到每一行是另一回事——从前这里不查，
 * 于是一行键位悄悄加进表里、没人写用例，契约与证据就此脱钩。
 */
const ROW_EXEMPT = {
  // 焦点陷阱的 Tab 回绕是共享原语在做，判据在 behavior/tests/focus-scope.spec.ts 的
  // 「tab 边界回绕」一节；四家不各演一遍浏览器的 Tab 序列（jsdom 也演不出来）
  'dialog.kbd.tab': '焦点域原语，见 behavior/tests/focus-scope.spec.ts',
  'dialog.kbd.shift-tab': '同上',
  'drawer.kbd.tab': '同 dialog',
  'drawer.kbd.shift-tab': '同 dialog',
  'image-viewer.kbd.tab': '同 dialog',
  'image-viewer.kbd.shift-tab': '同 dialog',
  'command.kbd.tab': '同 dialog',
  'popover.kbd.tab': '同 dialog',
  'popover.kbd.shift-tab': '同 dialog',
  // 列设置区摆在 root 之外（root 是 grid 系角色，子节点只能是 row 与 rowgroup），
  // 而套件的 fixture 是一棵以 root 为树根的树，表达不出它的兄弟位
  'table.kbd.column-visibility': '列设置区在 root 之外，见 headless 的 tests/table-column-settings.spec.ts',
}

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

/** 注释与 import 语句都去掉：import 进来的名字不算登记，清单里得真把它交给运行方。 */
async function readAll(paths) {
  const out = []
  for (const p of paths) {
    out.push((await readFile(p, 'utf8'))
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
      .replace(/^\s*import\s[\s\S]*?from\s+'[^']*'\s*$/gm, ''))
  }
  return out.join('\n')
}

/** 每个适配器的清单正文，按侧名取用。 */
const sideSrc = {}
for (const { key, specs } of SIDES)
  sideSrc[key] = await readAll(specs)

const covered = await reactCovered()
const suiteFiles = new Set(await readdir(SUITES))
/** 组件总数按套件数算，与 react-coverage.json 的登记口径是同一个。 */
const componentTotal = [...suiteFiles].filter(f => f.endsWith('.suite.ts')).length

const problems = []
let checked = 0
let rows = 0
/** 逐侧真的登记上了的组件数，收尾行照它报。 */
const registeredCount = { vue: 0, react: 0, wc: 0 }
const exemptSeen = new Set()
/** 真的用来放行过的单侧豁免，写成「侧 组件」。 */
const sideExemptSeen = new Set()

for (const dir of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  let keyboard
  try {
    keyboard = await readFile(join(HEADLESS, dir, `${dir}.keyboard.ts`), 'utf8')
  }
  catch {
    continue
  }
  if (!/\brows:\s*\[\s*\{/.test(keyboard))
    continue
  checked++
  if (!suiteFiles.has(`${dir}.suite.ts`)) {
    problems.push(`${dir}  有键盘表却没有 ${SUITES}/${dir}.suite.ts——表里的每一行都要有用例 covers 到`)
    continue
  }
  const id = `${camel(dir)}Suite`
  const wcId = `wc${id[0].toUpperCase()}${id.slice(1)}`
  const usedIn = (src, ids) => ids.some(x => new RegExp(`(?<![\\w$])${x}(?![\\w$])`).test(src))
  const accepted = { vue: [id], react: [id], wc: [id, wcId] }
  const registered = {}
  for (const { key } of SIDES)
    registered[key] = usedIn(sideSrc[key], accepted[key])

  for (const { key, coveredOnly } of SIDES) {
    // React 只核已铺到的组件：没铺到的这一侧压根还没有清单可登记
    if (coveredOnly && !covered.has(dir))
      continue
    if (EXEMPT[key][dir]) {
      sideExemptSeen.add(`${key} ${dir}`)
      // 豁免要真起作用才算数：那一侧其实已经登记了，这条豁免就该删
      if (registered[key])
        problems.push(`EXEMPT.${key} 里的 ${dir} 已经登记了套件，这条豁免用不上了，删掉`)
      continue
    }
    if (registered[key])
      registeredCount[key] += 1
    else
      problems.push(`${dir}  ${ADAPTERS[key].label} 的 conformance 清单没有登记 ${accepted[key].join(' / ')}`)
  }

  // 逐行对账：表里每一行都要有用例 covers 到，或在 ROW_EXEMPT 里写明由谁认领
  const suite = await readFile(join(SUITES, `${dir}.suite.ts`), 'utf8')
  const coveredRows = new Set(
    [...suite.matchAll(/covers:\s*\[([^\]]*)\]/g)]
      .flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1])),
  )
  for (const [, rowId] of keyboard.matchAll(/id:\s*'([^']+)'/g)) {
    rows += 1
    if (coveredRows.has(rowId))
      continue
    if (rowId in ROW_EXEMPT) {
      exemptSeen.add(rowId)
      continue
    }
    problems.push(`${dir}  键盘表的 ${rowId} 没有任何用例 covers 到——补用例，或登进 ROW_EXEMPT 写明由谁认领`)
  }
}

for (const rowId of Object.keys(ROW_EXEMPT)) {
  if (!exemptSeen.has(rowId))
    problems.push(`ROW_EXEMPT 里的 ${rowId} 已经不在任何键盘表里、或已经被用例认领了——名单过期`)
}

for (const { key } of SIDES) {
  for (const dir of Object.keys(EXEMPT[key])) {
    if (!sideExemptSeen.has(`${key} ${dir}`))
      problems.push(`EXEMPT.${key} 里的 ${dir} 登记了却没被扫到——名单过期了`)
  }
}

if (problems.length) {
  console.error('[check-keyboard-suites] ✗ 键盘表与套件对不上账：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-keyboard-suites] 通过：${checked} 份键盘表都有套件，`
  + `${ADAPTERS.vue.label} 登记 ${registeredCount.vue} 份 / ${ADAPTERS.wc.label} ${registeredCount.wc} 份 / ${ADAPTERS.react.label} ${registeredCount.react} 份`
  + `（${reactProgress(covered, componentTotal)}，未铺到的跳过）；`
  + `${rows} 行键位逐行有用例认领（另有 ${exemptSeen.size} 行由共享原语或单测认领、${sideExemptSeen.size} 处单侧豁免）`,
)
