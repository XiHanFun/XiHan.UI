#!/usr/bin/env node
// 门禁：皮肤里的断点字面量必须出自令牌清单。
//
// CSS 自定义属性在查询条件里不生效——`@media (min-width: var(--xh-breakpoint-md))`
// 是不成立的写法，`@container` 同理。所以断点只能在皮肤里写字面量，令牌那份清单管不住它。
// 这条门禁替代了 var() 的约束力：每个查询条件里的宽度值，都得在
// packages/design/tokens 的断点令牌里找得到，否则各写各的、迟早对不齐。
//
// 扫描面是 @media 与 @container 两种查询的行内一轴：
//   冒号写法 (min-width: 768px) / (max-inline-size: 1024px) / (width: 640px)
//   区间写法 (width >= 768px) / (640px <= inline-size < 1024px)
// 块向一轴（height / block-size）与 aspect-ratio 不在清单管辖内，不收。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { lineCounter, stripComments } from './lib/css-declarations.mjs'

const STYLES = 'packages/design/styles/css'
const TOKENS = 'packages/design/tokens/tokens.json'

/** 从令牌产物里取断点清单：`--xh-breakpoint-md` → `768px` */
async function declaredBreakpoints() {
  const tokens = JSON.parse(await readFile(TOKENS, 'utf8'))
  const out = new Map()
  for (const [name, value] of Object.entries(tokens)) {
    const m = /^--xh-breakpoint-([a-z0-9]+)$/.exec(name)
    if (m)
      out.set(String(value), m[1])
  }
  return out
}

/** 查询前奏：从 @media / @container 起，到它那对花括号的 `{` 为止。 */
const QUERY_PRELUDE = /@(media|container)\b([^{]*)\{/g

/** 行内一轴的特性名。forced-colors、prefers-reduced-motion、hover 这些不带长度，不在此列。 */
const INLINE_AXIS = /^(?:width|inline-size)$/i

/** 冒号写法的特性名：(min-width: 768px) 里冒号左边那一段。 */
const COLON_FEATURE = /^(?:min-|max-)?(?:width|inline-size)$/i

/** 收出一段文本里全部成对括号的内容，嵌套的也各算一组。 */
function parenGroups(text) {
  const out = []
  const open = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      open.push(i)
    }
    else if (text[i] === ')' && open.length) {
      const start = open.pop()
      out.push(text.slice(start + 1, i))
    }
  }
  return out
}

/** 从一段查询前奏里切出全部行内一轴的宽度字面量。 */
function widthLiterals(prelude) {
  const out = []
  for (const group of parenGroups(prelude)) {
    const colon = group.indexOf(':')
    if (colon !== -1 && COLON_FEATURE.test(group.slice(0, colon).trim())) {
      const value = group.slice(colon + 1).trim()
      if (value)
        out.push(value)
      continue
    }
    // 区间写法：按比较符切段，特性名占一段，剩下的段就是长度
    const parts = group.split(/<=|>=|[<>]/).map(s => s.trim())
    if (parts.length < 2 || !parts.some(p => INLINE_AXIS.test(p)))
      continue
    for (const part of parts) {
      if (part && !INLINE_AXIS.test(part))
        out.push(part)
    }
  }
  return out
}

const declared = await declaredBreakpoints()
if (declared.size === 0) {
  console.error('[check-breakpoints] 令牌里一个断点都没有，先在 packages/design/tokens 里声明')
  process.exit(1)
}

const offenders = []
let mediaQueries = 0
let containerQueries = 0
let checked = 0

for (const file of await readdir(STYLES)) {
  if (!file.endsWith('.css'))
    continue
  const css = stripComments(await readFile(join(STYLES, file), 'utf8'))
  const lineAt = lineCounter(css)
  for (const rule of css.matchAll(QUERY_PRELUDE)) {
    const [, kind, prelude] = rule
    if (kind === 'media')
      mediaQueries += 1
    else
      containerQueries += 1
    for (const value of widthLiterals(prelude)) {
      checked += 1
      if (!declared.has(value))
        offenders.push(`${file}:${lineAt(rule.index)} @${kind} 里的 ${value}`)
    }
  }
}

// 瀑布流的列数按容器宽度换档，比的是数字而不是媒体查询，所以在 JS 里复制了一份断点值。
// 它是全仓唯一一处这样的复制，皮肤侧的扫描看不到它——源码里自己写着「改令牌必须同步改这四个数」，
// 那就把这句话变成可执行的。
const MASONRY = 'packages/engine/headless/src/masonry/masonry.layout.ts'
const masonry = await readFile(MASONRY, 'utf8')
const table = /const BREAKPOINTS[^=]*=\s*\{([^}]*)\}/.exec(masonry)?.[1]
if (!table) {
  offenders.push(`${MASONRY}: 找不到 BREAKPOINTS 表——常量改名了就把本门禁一起改`)
}
else {
  const byName = new Map([...declared].map(([value, name]) => [name, value]))
  let paired = 0
  for (const [, name, value] of table.matchAll(/(\w+)\s*:\s*(\d+)/g)) {
    paired += 1
    const expected = byName.get(name)
    if (expected === undefined)
      offenders.push(`${MASONRY}: ${name} 不是令牌里的档位`)
    else if (expected !== `${value}px`)
      offenders.push(`${MASONRY}: ${name}=${value} 与令牌的 ${expected} 对不上`)
  }
  if (paired !== byName.size)
    offenders.push(`${MASONRY}: 表里有 ${paired} 档，令牌里有 ${byName.size} 档`)
}

if (offenders.length) {
  console.error('[check-breakpoints] 查询条件里的断点值不在令牌清单里：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error(`  清单：${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')}`)
  process.exit(1)
}

console.log(
  `[check-breakpoints] 通过：断点只有 ${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')} 这几档，`
  + `${mediaQueries} 条 @media 与 ${containerQueries} 条 @container 里的 ${checked} 个宽度字面量都出自清单`,
)
