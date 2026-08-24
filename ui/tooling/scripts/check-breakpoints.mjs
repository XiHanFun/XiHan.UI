#!/usr/bin/env node
// 门禁：皮肤里的断点字面量必须出自令牌清单。
//
// CSS 自定义属性在 @media 条件里不生效——`@media (min-width: var(--xh-breakpoint-md))`
// 是不成立的写法。所以断点只能在皮肤里写字面量，令牌那份清单管不住它。
// 这条门禁替代了 var() 的约束力：每个 @media 宽度条件里的值，都得在
// packages/design/tokens 的断点令牌里找得到，否则各写各的、迟早对不齐。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

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

// 只查宽度条件；forced-colors、prefers-reduced-motion、hover 这些不带长度，不在此列
// 冒号后不再单写 \s*：它与 [^)]+ 能吃同一批字符，两边可交换的前缀会让引擎在不匹配时
// 逐位回溯。值统一交给下面的 trim 归一，正则只负责切出来。
const WIDTH_QUERY = /@media[^{]*?\((?:min|max)-width:([^)]+)\)/g

const declared = await declaredBreakpoints()
if (declared.size === 0) {
  console.error('[check-breakpoints] 令牌里一个断点都没有，先在 packages/design/tokens 里声明')
  process.exit(1)
}

const offenders = []
for (const file of await readdir(STYLES)) {
  if (!file.endsWith('.css'))
    continue
  const css = await readFile(join(STYLES, file), 'utf8')
  for (const m of css.matchAll(WIDTH_QUERY)) {
    const value = m[1].trim()
    if (!declared.has(value))
      offenders.push(`${file}: ${value}`)
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
  console.error('[check-breakpoints] 皮肤里的断点值不在令牌清单里：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error(`  清单：${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')}`)
  process.exit(1)
}

console.log(
  `[check-breakpoints] 通过：断点只有 ${[...declared].map(([v, k]) => `${k}=${v}`).join(' · ')} 这几档，皮肤没有另起炉灶`,
)
