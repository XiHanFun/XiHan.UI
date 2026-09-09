#!/usr/bin/env node
// 门禁：只有登记在册的部件才许在皮肤里当查询容器。
//
// `container-type` 不是一条样式，是给那个盒换了套布局规则：它施加行内一轴的尺寸限制，
// 盒从此不再由内容撑宽。放在宽度由外部给的块级根上没有影响；放在收缩包裹的盒上
// （行内块、没写 flex-basis 的 flex 项）宽度当场归零。这条判据静态看不出来，
// 所以改成登记制——每加一个容器都得写清「为什么这个根能当容器」，判据是：
// 它是库自己渲的根、是块级盒、宽度由外面给，不是收缩包裹的。
//
// 登记表 container-scope-registry.json 一张：
//   containers  键是「组件:部件」，why 必填；pending 表示「已核准、皮肤里还没写」
// 两侧反查：写了 container-type 却没登记判红；登记了却没写、又没标 pending 也判红；
// 标了 pending 却已经写上了，同样判红——那条理由过期了。
//
// 登记表现在是空的，空表算通过：库里一处 container-type 都没有，四个换档组件全部改走
// 视口断点 @media。这道门禁此刻守的是「谁都不许再写 container-type」——皮肤里凡出现一处
// 就没有对应登记，立刻判红。要重新启用某个落点，先在登记表里补一条写清判据。
//
// 取值只许 inline-size：`size` 还要一个确定的块向尺寸，块向一轴的换档不在三层口径里。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const SKINS = 'packages/design/styles/css'
const REGISTRY = 'tooling/scripts/container-scope-registry.json'

/** 建立查询容器的两种写法：长手与简写。 */
const CONTAINER_PROPS = new Set(['container-type', 'container'])

/** 行内一轴的外部显示型：容器根写成这些即是收缩包裹的盒。 */
const INLINE_LEVEL = /^inline-(?:block|flex|grid|table)$|^inline$/

const problems = []

/** 在括号之外按逗号切选择器分支。 */
function splitBranches(text) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[') {
      depth++
    }
    else if (ch === ')' || ch === ']') {
      depth--
    }
    else if (depth === 0 && ch === ',') {
      out.push(text.slice(start, i))
      start = i + 1
    }
  }
  out.push(text.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** 一条选择器分支的落点部件：最右边那个 data-part 就是规则的主语。 */
function subjectPart(branch) {
  const hits = [...branch.matchAll(/\[data-part='([a-z0-9-]+)'\]/g)]
  return hits.length ? hits[hits.length - 1][1] : null
}

/** 简写 `container: name / inline-size` 里的类型段；没有斜杠即只设了名字。 */
function typeOfShorthand(value) {
  const slash = value.indexOf('/')
  return slash === -1 ? null : value.slice(slash + 1).trim()
}

/** 皮肤里真的写了 container-type 的部件：`组件:部件` → 出处与取值。 */
const written = new Map()
/** 每个部件写过的 display 取值：`组件:部件` → 取值集合。 */
const displays = new Map()

const files = (await readdir(SKINS)).filter(f => f.endsWith('.css')).sort()
for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(SKINS, file), 'utf8'))
  const lineAt = lineCounter(css)

  for (const decl of declarations(css)) {
    const selector = decl.selectors[decl.selectors.length - 1] ?? ''
    for (const branch of splitBranches(selector)) {
      const part = subjectPart(branch)
      if (part == null)
        continue
      const key = `${comp}:${part}`

      if (decl.prop === 'display') {
        if (!displays.has(key))
          displays.set(key, new Set())
        displays.get(key).add(decl.value.trim())
        continue
      }

      if (!CONTAINER_PROPS.has(decl.prop))
        continue
      const type = decl.prop === 'container' ? typeOfShorthand(decl.value) : decl.value.trim()
      if (type == null)
        continue
      written.set(key, { at: `${file}:${lineAt(decl.index)}`, prop: decl.prop, type })
    }
  }

  // 落在 data-part 之外的容器声明（打在 data-scope、伪元素或裸选择器上）同样要拦：
  // 它们进不了上面那张表，反查就看不见
  for (const decl of declarations(css)) {
    if (!CONTAINER_PROPS.has(decl.prop))
      continue
    const selector = decl.selectors[decl.selectors.length - 1] ?? ''
    const branches = splitBranches(selector)
    if (branches.length && branches.every(b => subjectPart(b) != null))
      continue
    if (decl.prop === 'container' && typeOfShorthand(decl.value) == null)
      continue
    problems.push(
      `${file}:${lineAt(decl.index)} ${decl.prop}: ${decl.value} 落在 \`${selector.trim()}\` 上——`
      + '容器只能建在具名部件上，登记表按「组件:部件」记账，选择器里没有 data-part 就登不进去',
    )
  }
}

let registry
try {
  registry = JSON.parse(await readFile(REGISTRY, 'utf8'))
}
catch (err) {
  console.error(`[check-container-scope] ✗ 读不到 ${REGISTRY}：${err.message}`)
  process.exit(1)
}
const containers = registry.containers ?? {}

// 写了却没登记
for (const [key, info] of written) {
  if (!(key in containers)) {
    problems.push(
      `${key}（${info.at}）写了 ${info.prop}: ${info.type} 却没登记——`
      + `先在 ${REGISTRY} 里补一条，写清它为什么能当容器（库自己渲的块级根、宽度由外面给、不是收缩包裹的）`,
    )
  }
}

// 登记了却没写，或写的与登记的对不上
let live = 0
let pending = 0
for (const [key, entry] of Object.entries(containers)) {
  if (!entry || typeof entry !== 'object') {
    problems.push(`${key} 登记的取值不是对象——每条要写成 { "why": "…" }`)
    continue
  }
  if (!entry.why)
    problems.push(`${key} 登在册里没写理由——补一句「为什么这个根能当容器」`)

  const info = written.get(key)
  if (info == null) {
    if (!entry.pending) {
      problems.push(
        `${key} 登记成查询容器，皮肤里却没写 container-type——`
        + '要么把它写上，要么标一句 pending 说明它为什么还没写',
      )
    }
    else {
      pending += 1
    }
    continue
  }
  if (entry.pending) {
    problems.push(`${key}（${info.at}）已经写上 container-type 了——pending 那条理由过期了，删掉`)
  }
  if (info.type !== 'inline-size') {
    problems.push(
      `${key}（${info.at}）${info.prop} 的类型是 ${info.type}——`
      + '只许 inline-size：size 还要一个确定的块向尺寸，块向换档不在三层口径里',
    )
  }
  // 块级旁证：容器根写成行内级即是收缩包裹的盒，加上 container-type 宽度会归零
  for (const value of displays.get(key) ?? []) {
    if (INLINE_LEVEL.test(value)) {
      problems.push(
        `${key}（${info.at}）另有一条 display: ${value}——行内级的盒是收缩包裹的，`
        + '建成查询容器后行内一轴不再由内容撑开，宽度会塌',
      )
    }
  }
  live += 1
}

if (problems.length) {
  console.error('[check-container-scope] ✗ 查询容器的落点对不上登记表：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const total = Object.keys(containers).length
console.log(
  total === 0
    ? `[check-container-scope] 通过：${files.length} 份皮肤 · 登记表是空的，皮肤里一处 container-type 都没有`
    : `[check-container-scope] 通过：${files.length} 份皮肤 · 登记在册的查询容器 ${total} 个，`
      + `${live} 个已建、${pending} 个已核准待写；皮肤里没有第二处 container-type`,
)
