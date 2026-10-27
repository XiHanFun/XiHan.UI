#!/usr/bin/env node
// 门禁：tone.css 的语气边界名单与 headless 连接层一一对上。
//
// 语气槽声明在 [data-tone] 上、靠继承流到部件；有语气轴的组件没写 tone 时，要在它的根上把整族私有槽
// 清回未声明，否则外层容器的语气会顺着继承染进来（没写 tone 的按钮放进 danger 的 Alert 就成了 danger）。
// 哪些组件有语气轴由连接层决定：根的 getter 投影了 data-tone 的，边界落在 root；没有根语气、
// 但别的部件按 prop('tone') 投影 data-tone 的（Menu、Tooltip 的内容部件），边界落在那个部件。
// 名单逐个组件写死在 tone.css 里（产物按组件分桶，见那条规则的注释），新增一个有语气轴的组件
// 而名单没跟上，它就仍接外层的语气；反过来名单里多出一个没有语气轴的组件，它会挡住组往条目的继承。
//
// 同批核两件事：
//   1. 边界规则的选择器只认 [data-scope='x'][data-part='y']:not([data-tone]) 与浮层壳
//      [data-xh-portal-shell]:not([data-tone]) 两种写法，(scope, part) 集合与连接层推出来的相等；
//   2. 边界清掉的槽恰是 tone.css 声明过的整族 --xh-_tone*，每支都写 initial——族里加一支而边界没清，
//      那一支照旧越过组件边界。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { connectSource, getterBody, gettersProjecting, HEADLESS_SRC, partOfGetter } from '../lib/connect-getters.mjs'
import { stripComments } from '../lib/css-declarations.mjs'
import { parseRules, splitSelectors } from '../lib/skin-rules.mjs'

const TONE_CSS = 'packages/design/styles/css/tone.css'
const SHELL = '[data-xh-portal-shell]:not([data-tone])'
const BRANCH = /^\[data-scope='([a-z][a-z0-9-]*)'\]\[data-part='([a-z][a-z0-9-]*)'\]:not\(\[data-tone\]\)$/
const TONE_SLOT = /^--xh-_tone(?:-|$)/

const problems = []

/** 连接层推出来的边界：`scope part` → 依据。 */
const expected = new Map()
for (const entry of (await readdir(HEADLESS_SRC, { withFileTypes: true })).filter(d => d.isDirectory()).sort((a, b) => a.name < b.name ? -1 : 1)) {
  const comp = entry.name
  const anatomy = await readFile(join(HEADLESS_SRC, comp, `${comp}.anatomy.ts`), 'utf8').catch(() => '')
  const scope = /createAnatomy\(\s*'([a-z][a-z0-9-]*)'\s*,\s*\[\s*\S/.exec(anatomy)?.[1]
  if (!scope || !await connectSource(comp))
    continue
  const root = await getterBody(comp, 'root')
  if (root?.includes('\'data-tone\':')) {
    expected.set(`${scope} root`, `${comp}.connect.ts 的 getRootProps 投影了 data-tone`)
    continue
  }
  for (const getter of await gettersProjecting(comp, 'data-tone')) {
    const body = await getterBody(comp, partOfGetter(getter))
    if (body?.includes('\'data-tone\': prop(\'tone\')'))
      expected.set(`${scope} ${partOfGetter(getter)}`, `${comp}.connect.ts 没有根语气，${getter} 按 prop('tone') 投影 data-tone`)
  }
}

const rules = parseRules(stripComments(await readFile(TONE_CSS, 'utf8')))
const boundaries = rules.filter(rule => rule.decls.some(d => d.prop === '--xh-_tone' && d.value === 'initial'))
if (boundaries.length !== 1) {
  problems.push(`${TONE_CSS}  应恰有一条把 --xh-_tone 清成 initial 的边界规则，读到 ${boundaries.length} 条`)
}
else {
  const [boundary] = boundaries
  const listed = new Set()
  let shell = false
  for (const branch of splitSelectors(boundary.selector)) {
    if (branch === SHELL) {
      shell = true
      continue
    }
    const m = BRANCH.exec(branch)
    if (!m) {
      problems.push(`${TONE_CSS}:${boundary.line}  边界选择器「${branch}」不是 [data-scope='x'][data-part='y']:not([data-tone]) 的写法`)
      continue
    }
    listed.add(`${m[1]} ${m[2]}`)
  }
  if (!shell)
    problems.push(`${TONE_CSS}:${boundary.line}  边界名单里没有浮层壳 ${SHELL}：浮层会从落点那边接语气`)
  for (const [key, why] of expected) {
    if (!listed.has(key)) {
      const [scope, part] = key.split(' ')
      problems.push(`${TONE_CSS}:${boundary.line}  缺 [data-scope='${scope}'][data-part='${part}']：${why}，没写 tone 时会接外层容器的语气`)
    }
  }
  for (const key of listed) {
    if (!expected.has(key)) {
      const [scope, part] = key.split(' ')
      problems.push(`${TONE_CSS}:${boundary.line}  多了 [data-scope='${scope}'][data-part='${part}']：连接层在那里没有投影组件自己的语气，它会挡住组往条目的继承`)
    }
  }

  const family = new Set(rules.filter(rule => rule !== boundary).flatMap(rule => rule.decls.map(d => d.prop)).filter(prop => TONE_SLOT.test(prop)))
  const cleared = new Map(boundary.decls.filter(d => TONE_SLOT.test(d.prop)).map(d => [d.prop, d.value]))
  for (const prop of family) {
    if (!cleared.has(prop))
      problems.push(`${TONE_CSS}:${boundary.line}  边界没清 ${prop}：这一支照旧越过组件边界`)
  }
  for (const [prop, value] of cleared) {
    if (!family.has(prop))
      problems.push(`${TONE_CSS}:${boundary.line}  边界清了 ${prop}，tone.css 别处没声明这一支`)
    else if (value !== 'initial')
      problems.push(`${TONE_CSS}:${boundary.line}  边界把 ${prop} 写成 ${value}，要写 initial 才落回读槽处的兜底`)
  }
}

if (problems.length) {
  console.error('[check-tone-boundary] ✗ 语气边界与连接层对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-tone-boundary] 通过：${expected.size} 个有语气轴的组件部件都在 tone.css 的语气边界里，连同浮层壳清掉整族语气私有槽`)
