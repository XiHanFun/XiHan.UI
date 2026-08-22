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

/** 某一侧刻意不跑的组件，逐条写明理由。 */
const EXEMPT = {
  vue: {},
  wc: {},
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
  if (!EXEMPT.vue[dir] && !usedIn(vueSrc, [id]))
    problems.push(`${dir}  Vue 的 conformance 清单没有登记 ${id}`)
  if (!EXEMPT.wc[dir] && !usedIn(wcSrc, [id, wcId]))
    problems.push(`${dir}  WC 的 conformance 清单没有登记 ${id} / ${wcId}`)
}

for (const side of ['vue', 'wc']) {
  for (const dir of Object.keys(EXEMPT[side])) {
    if (!suiteFiles.has(`${dir}.suite.ts`))
      problems.push(`EXEMPT.${side} 里的 ${dir} 没有套件，这条豁免是陈旧的，删掉`)
  }
}

if (problems.length) {
  console.error('[check-keyboard-suites] ✗ 键盘表与套件对不上账：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-keyboard-suites] 通过：${checked} 份键盘表都有套件，且 Vue 与 WC 两侧都登记了`)
