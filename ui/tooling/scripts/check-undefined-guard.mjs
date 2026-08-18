#!/usr/bin/env node
// 门禁：凡是在 wire() 里用内联 display 收起浮层部件的元素，标签名必须列进 undefined.css 的升级前名单。
//
// 收起态与 data-scope / data-part 都是元素升级那一刻才落到 DOM。JS 到达之前这段子树既没有皮肤
// 也没有收起，内容会以裸文本堆在页面流里，名单漏一个就漏一处。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ELEMENTS_DIR = 'packages/adapters/web-components/src/elements'
const UNDEFINED_CSS = 'packages/design/styles/css/undefined.css'

/** 升级前必须收起的浮层部件。 */
const OVERLAY_PARTS = new Set(['backdrop', 'content', 'positioner', 'viewport'])

/** 把「标识符 → 它取自哪个部件」的绑定形态列全，setPartHidden 的实参靠这张表还原成部件名。 */
const BINDINGS = [
  /(?:const|let)\s+(\w+)\s*=\s*this\.getParts?\('([\w-]+)'\)/g,
  /for\s*\(\s*const\s+(\w+)\s+of\s+this\.getParts\('([\w-]+)'\)/g,
  /for\s*\(\s*const\s+(\w+)\s+of\s+this\.partsIn\([^,]+,\s*'([\w-]+)'\)/g,
]
const FIELD_BINDING = /this\.(\w+)\s*=\s*this\.getParts?\('([\w-]+)'\)/g
const FOREACH_BINDING = /this\.getParts\('([\w-]+)'\)(?:\.\w+\([^)]*\))*\.forEach\(\(?\s*(\w+)/g
const NAME_LOOP = /for\s*\(\s*const\s+(\w+)\s+of\s+\[([^\]]*)\]\)\s*\{([\s\S]{0,400}?)\n\s{0,6}\}/g

/** 还原一份元素源码收起过哪些部件，实参解不出部件名的另行报出。 */
function hiddenParts(src) {
  const binds = new Map()
  const bind = (id, part) => binds.set(id, (binds.get(id) ?? new Set()).add(part))

  for (const re of BINDINGS) {
    for (const m of src.matchAll(re))
      bind(m[1], m[2])
  }
  for (const m of src.matchAll(FIELD_BINDING))
    bind(`this.${m[1]}`, m[2])
  for (const m of src.matchAll(FOREACH_BINDING))
    bind(m[2], m[1])
  // 部件名写成数组、循环里再逐个取节点的形态
  for (const m of src.matchAll(NAME_LOOP)) {
    const [, loopVar, array, body] = m
    const inner = body.match(new RegExp(`(?:const|let)\\s+(\\w+)\\s*=\\s*this\\.getParts?\\(${loopVar}\\)`))
    if (!inner)
      continue
    for (const name of array.matchAll(/'([\w-]+)'/g))
      bind(inner[1], name[1])
  }

  const parts = new Set()
  const unresolved = []
  for (const m of src.matchAll(/setPartHidden\(([^,]+),/g)) {
    const arg = m[1].trim()
    const inline = arg.match(/this\.getParts?\('([\w-]+)'\)/)
    if (inline) {
      parts.add(inline[1])
      continue
    }
    if (binds.has(arg)) {
      for (const part of binds.get(arg))
        parts.add(part)
      continue
    }
    unresolved.push(arg)
  }
  return { parts, unresolved }
}

const problems = []
const files = (await readdir(ELEMENTS_DIR)).filter(f => f.endsWith('.ts'))

/** 标签名取元素自己的 @customElement 标注，那是标签与文件的唯一对应处。 */
const tagOf = new Map()
const shouldList = new Set()
for (const file of files) {
  const src = await readFile(join(ELEMENTS_DIR, file), 'utf8')
  const tag = src.match(/@customElement\s+(xh-[\w-]+)/)?.[1]
  if (!tag) {
    problems.push(`${file}：没有 @customElement 标注，读不出标签名`)
    continue
  }
  tagOf.set(tag, file)

  const { parts, unresolved } = hiddenParts(src)
  for (const arg of unresolved)
    problems.push(`${file}：setPartHidden 的实参「${arg}」解不出部件名，判不了它收的是不是浮层`)
  if ([...parts].some(part => OVERLAY_PARTS.has(part)))
    shouldList.add(tag)
}

const css = await readFile(UNDEFINED_CSS, 'utf8')
const block = css.match(/:where\(\s*(xh-[\s\S]*?)\)/)
if (!block) {
  console.error(`[check-undefined-guard] ✗ ${UNDEFINED_CSS} 里找不到标签名单`)
  process.exit(1)
}
const listed = new Set([...block[1].matchAll(/xh-[\w-]+/g)].map(m => m[0]))

for (const tag of [...shouldList].sort()) {
  if (!listed.has(tag))
    problems.push(`${tag}：收起了浮层部件，却不在 ${UNDEFINED_CSS} 的名单里`)
}
for (const tag of [...listed].sort()) {
  if (!tagOf.has(tag))
    problems.push(`${tag}：在名单里，但 ${ELEMENTS_DIR} 下没有这个标签的元素`)
  else if (!shouldList.has(tag))
    problems.push(`${tag}：在名单里，但它已经不收起任何浮层部件了`)
}

if (problems.length) {
  console.error('[check-undefined-guard] ✗ 升级前名单与元素对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('名单漏一个，那个组件的浮层内容在 JS 到达之前就以裸文本堆在页面流里。')
  process.exit(1)
}

console.log(`[check-undefined-guard] 通过：${files.length} 个元素里 ${shouldList.size} 个收起浮层部件，与升级前名单逐一对上`)
