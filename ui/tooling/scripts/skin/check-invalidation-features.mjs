#!/usr/bin/env node
// 门禁：运行期会翻转的状态属性与交互伪类，后面跟着的规则主体必须带可认的特征。
//
// 浏览器在某个属性或伪类翻转时，按「失效集」决定要重算哪些后代或兄弟。失效集只按属性名 / 伪类
// 全局登记，不看取值、也不看同一节里的组件限定：只要有一条规则写成
// `.xh-scope-x[data-part='a'][data-state='open'] [data-part='b']`（主体只靠 data-part）或 `… > *`
// （主体没有特征），页面上任何元素翻转 data-state，都会把它整棵子树里带 data-part 的节点（后者是
// 整棵子树）一起标脏。3500 个组件节点的容器上翻一次 data-state 曾经要 150ms，补齐特征后 4ms。
//
// 判据：规则的非主体位置（祖先、前兄弟，以及主体里 :not() / :is() 复杂参数的祖先位置）出现下面的
// 状态属性或交互伪类时，对应的主体必须带类名、id、标签名或家族属性（data-xh-*）。
// 修法：主体是本组件部件的，补 :where([data-scope='x'])（产物里成为 :where(.xh-scope-x)，不加特异性）；
// 主体是作者放进来的任意节点的，把条件挪到父节点自身写私有槽，子节点规则只读槽。
//
// data-orientation 一类只随 prop 变化、运行期几乎不翻的属性，以及 data-theme 等整页轴（翻转时本来就要
// 整页重算）不在此列。
import { readFile } from 'node:fs/promises'
import { collectSelectors, compoundsOf, splitTop, topLevel } from '../lib/css-selectors.mjs'

const FILE = 'packages/design/styles/index.css'

/** 交互与开合时会翻转、且被多个组件共用的状态属性。 */
const HOT_ATTRS = new Set([
  'data-state',
  'data-instant',
  'data-disabled',
  'data-current',
  'data-loading',
  'data-highlighted',
  'data-selected',
  'data-checked',
  'data-invalid',
  'data-readonly',
  'data-pressed',
  'data-dragging',
  'data-open',
  'data-active',
  'data-placeholder-shown',
  'data-in-range',
  'hidden',
  'aria-selected',
  'aria-checked',
  'aria-expanded',
  'aria-pressed',
  'aria-disabled',
  'aria-busy',
  'aria-current',
])

/** 随指针、焦点与表单状态翻转的伪类。 */
const HOT_PSEUDOS = new Set([':hover', ':active', ':focus', ':focus-visible', ':focus-within', ':checked', ':disabled', ':placeholder-shown', ':invalid', ':user-invalid'])

function triggersOf(compound) {
  const out = new Set()
  for (const m of compound.matchAll(/\[\s*([\w-]+)/g)) {
    if (HOT_ATTRS.has(m[1]))
      out.add(`[${m[1]}]`)
  }
  for (const m of compound.matchAll(/(:[\w-]+)/g)) {
    if (HOT_PSEUDOS.has(m[1]))
      out.add(m[1])
  }
  return out
}

/** 主体有没有可认的特征：类名、id、标签名、家族属性；:is() / :where() 的每个参数都有才算。 */
function strong(compound) {
  const { flat, args } = topLevel(compound)
  const noAttrs = flat.replace(/\[[^\]]*\]/g, '[]')
  if (/[.#][\w-]/.test(noAttrs) || /^[a-z]/i.test(flat) || /\[\s*data-xh-/.test(flat))
    return true
  return args.some(({ pseudo, text }) => (pseudo === ':is' || pseudo === ':where')
    && splitTop(text, ',').every(arg => strong(compoundsOf(arg).at(-1)?.text ?? '')))
}

/** 一条复杂选择器里，非主体位置的热条件配上没特征的主体。 */
function violations(selector) {
  const found = []
  const compounds = compoundsOf(selector)
  const subject = compounds.at(-1)?.text ?? ''
  if (compounds.length > 1 && !strong(subject)) {
    const triggers = new Set(compounds.slice(0, -1).flatMap(c => [...triggersOf(c.text)]))
    if (triggers.size)
      found.push([...triggers])
  }
  // 主体里 :not() / :is() / :where() / :has() 之外的复杂参数：参数的最右一节指的是主体自己
  for (const { pseudo, text } of topLevel(subject).args) {
    if (pseudo === ':has')
      continue
    for (const arg of splitTop(text, ',')) {
      if (compoundsOf(arg).length > 1)
        found.push(...violations(arg))
    }
  }
  return found
}

const selectors = collectSelectors(await readFile(FILE, 'utf8'))
const errors = []
for (const s of selectors) {
  const found = violations(s)
  if (found.length)
    errors.push(`${[...new Set(found.flat())].join(' ')}  ${s.replace(/\s+/g, ' ').slice(0, 150)}`)
}

if (errors.length > 0) {
  console.error(`[check-invalidation-features] ✗ ${errors.length} 条规则的主体没有可认的特征，却挂在运行期会翻转的条件后面：`)
  for (const e of errors.slice(0, 30))
    console.error(`  ${e}`)
  console.error('主体是本组件部件的补 :where([data-scope=\'x\'])；是作者任意节点的，把条件挪到父节点写私有槽、子节点只读槽。')
  process.exit(1)
}
console.log(`[check-invalidation-features] 通过：${selectors.length} 条选择器里，挂在运行期状态与交互伪类后面的规则主体都带可认的特征`)
