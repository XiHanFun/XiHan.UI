#!/usr/bin/env node
// 门禁：皮肤产物里的规则按浏览器的分桶方式摊开，不许重新挤回一个大桶。
//
// 浏览器匹配样式时先按规则最右侧那一节（主体复合选择器）分桶：有 id 认 id、有类认类、
// 再没有才按属性名、标签名，什么都没有的进通配桶。一个元素重算样式时只试与它沾边的几个桶。
// 属性选择器只按属性名分桶、不看取值：皮肤曾经全写成 [data-scope='x'][data-part='y']…，
// 规则按最后一个属性挤进 data-part 一类的桶里，每个组件节点每次重算都要逐条试一遍——
// 大页面打一次 inert 上百毫秒。现在 build/emit-entries.mjs 把产物里的 [data-scope='x'] 换成挂载类
// .xh-scope-x（源文件照旧按属性写），每个组件各占一个桶。这道门禁守住两件事：
//   1. 两份扁平产物的选择器里不再出现带取值的 [data-scope=…]——转换漏了，或有人绕开生成直接改产物；
//   2. index.css 各桶的规则数不超过预算：某个组件的皮肤膨胀、或新写的规则主体只剩 [data-part] / 通配，
//      都会让对应的桶变大，在这里报出来。
//
// 取键规则见 ../lib/css-selectors.mjs（对照 Chrome 实测）。
import { readFile } from 'node:fs/promises'
import { bucketOf, collectSelectors, subjectOf } from '../lib/css-selectors.mjs'

const PKG = 'packages/design/styles'
const OUTPUTS = ['index.css', 'index.unlayered.css']
const BUDGET_FILE = 'index.css'

/**
 * index.css 各桶的规则数上限。挂载类桶按组件计，最大的 grid 当下 277 条；
 * 非类名的桶是挂载类够不着的：通配主体（`> *` 一类）、家族配方的根属性、少数按标签写的规则。
 * 上限给到当下规模之上一点，涨过去先看能不能把主体收回类名。
 */
const BUDGET = {
  'class': 320,
  'attr:data-part': 60,
  'universal': 100,
  'attr': 100,
  'tag': 60,
}

const scopeExact = /\[data-scope=(['"]?)[a-z][a-z0-9-]*\1\]/

function budgetFor(key) {
  if (key.startsWith('class:'))
    return BUDGET.class
  if (key in BUDGET)
    return BUDGET[key]
  if (key.startsWith('attr:'))
    return BUDGET.attr
  if (key.startsWith('tag:'))
    return BUDGET.tag
  return BUDGET.universal
}

const errors = []
let summary = ''
for (const file of OUTPUTS) {
  const selectors = collectSelectors(await readFile(`${PKG}/${file}`, 'utf8'))
  const leftovers = selectors.filter(s => scopeExact.test(s))
  for (const s of leftovers.slice(0, 5))
    errors.push(`${file} 里还有以属性写的组件选择器：${s.slice(0, 120)}`)
  if (leftovers.length > 5)
    errors.push(`${file} 里另有 ${leftovers.length - 5} 条同类选择器`)
  if (file !== BUDGET_FILE)
    continue
  const buckets = new Map()
  for (const s of selectors) {
    const key = bucketOf(subjectOf(s))
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const sorted = [...buckets].sort((a, b) => b[1] - a[1])
  for (const [key, count] of sorted) {
    const limit = budgetFor(key)
    if (count > limit)
      errors.push(`${file} 的 ${key} 桶有 ${count} 条规则，超过预算 ${limit}：把规则主体收回挂载类，或拆掉重复的规则`)
  }
  summary = `${selectors.length} 条选择器分进 ${buckets.size} 个桶，最大的几个：${sorted.slice(0, 5).map(([k, n]) => `${k} ${n}`).join('、')}`
}

if (errors.length > 0) {
  console.error('[check-selector-buckets] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  console.error('先跑 pnpm --filter @xihan-ui/styles gen 重新生成产物；产物仍不过就看上面点名的桶。')
  process.exit(1)
}
console.log(`[check-selector-buckets] 通过：两份产物里没有以属性写的组件选择器；index.css 的 ${summary}`)
