#!/usr/bin/env node
// 门禁：写了键盘表的组件，必须有一致性套件，且两个适配器都把它跑起来。
//
// 键盘表是对外承诺的交互契约；套件是兑现它的证据。表写了、套件没写，承诺就没人验；
// 套件写了、某个适配器没登记，那一侧的回归就静默不报。三样东西逐组件对账：
// <c>.keyboard.ts 非空 ⇒ tooling/testing/src/suites/<c>.suite.ts 存在，
// 且 Vue 与 WC 的 conformance 清单里都引用了 <c>Suite（WC 侧允许改写成 wc<C>Suite）。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const SUITES = 'tooling/testing/src/suites'
const VUE_SPECS = ['packages/adapters/vue/tests/conformance.spec.ts']
const WC_SPECS = [
  'packages/adapters/web-components/tests/suites.ts',
  'packages/adapters/web-components/tests/dialog-conformance.spec.ts',
]

/**
 * 某一侧刻意不跑的组件，逐条写明理由。
 * 每条都要真被用来放行过一次——组件没了、或那一侧其实已经登记了套件，
 * 这条豁免就成了一张过期的免检通行证，由下面的名单核验报出来。
 */
const EXEMPT = {
  vue: {},
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
  'popover.kbd.tab': '同 dialog',
  'popover.kbd.shift-tab': '同 dialog',
}

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

async function readAll(paths) {
  const out = []
  for (const p of paths)
    out.push((await readFile(p, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1'))
  return out.join('\n')
}

const vueSrc = await readAll(VUE_SPECS)
const wcSrc = await readAll(WC_SPECS)
const suiteFiles = new Set(await readdir(SUITES))

const problems = []
let checked = 0
let rows = 0
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
  const registered = { vue: usedIn(vueSrc, [id]), wc: usedIn(wcSrc, [id, wcId]) }
  const wanted = { vue: id, wc: `${id} / ${wcId}` }
  for (const side of ['vue', 'wc']) {
    if (EXEMPT[side][dir]) {
      sideExemptSeen.add(`${side} ${dir}`)
      // 豁免要真起作用才算数：那一侧其实已经登记了，这条豁免就该删
      if (registered[side])
        problems.push(`EXEMPT.${side} 里的 ${dir} 已经登记了套件，这条豁免用不上了，删掉`)
      continue
    }
    if (!registered[side])
      problems.push(`${dir}  ${side === 'vue' ? 'Vue' : 'WC'} 的 conformance 清单没有登记 ${wanted[side]}`)
  }

  // 逐行对账：表里每一行都要有用例 covers 到，或在 ROW_EXEMPT 里写明由谁认领
  const suite = await readFile(join(SUITES, `${dir}.suite.ts`), 'utf8')
  const covered = new Set(
    [...suite.matchAll(/covers:\s*\[([^\]]*)\]/g)]
      .flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1])),
  )
  for (const [, rowId] of keyboard.matchAll(/id:\s*'([^']+)'/g)) {
    rows += 1
    if (covered.has(rowId))
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

for (const side of ['vue', 'wc']) {
  for (const dir of Object.keys(EXEMPT[side])) {
    if (!sideExemptSeen.has(`${side} ${dir}`))
      problems.push(`EXEMPT.${side} 里的 ${dir} 登记了却没被扫到——名单过期了`)
  }
}

if (problems.length) {
  console.error('[check-keyboard-suites] ✗ 键盘表与套件对不上账：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-keyboard-suites] 通过：${checked} 份键盘表都有套件、两侧都登记了，${rows} 行键位逐行有用例认领（另有 ${exemptSeen.size} 行由共享原语或单测认领、${sideExemptSeen.size} 处单侧豁免）`)
